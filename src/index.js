import http from "http";
import fs from "fs/promises";

import { deleteCat, getBreeds, getCat, getCats, getOtherBreeds, saveBreed, saveCat, updateCat } from "./data.js";

const server = http.createServer(async (req, res) => {
    let html;

    if (req.method == "POST") {
        console.log("POST Requst has been made");

        let data = '';
        req.on('data', (chunk) => {
            data += chunk.toString();
        });

        req.on('end', async () => {
            const searchParams = new URLSearchParams(data);
            const catData = Object.fromEntries(searchParams.entries());

            if (req.url === "/cats/add-cat") {
                await saveCat(catData)
            } else if (req.url.startsWith("/cats/edit-cat")) {
                const catId = getCatId(req.url);
                await updateCat(catId, catData);
            } else if (req.url === "/cats/add-breed") {
                await saveBreed(catData.breed);
            } else if (req.url.endsWith("/delete")) {
                const catId = getCatId(req.url);
                await deleteCat(catId)
            }

            res.writeHead(302, {
                'location': '/'
            })

            res.end();
        })
        return
    }

    if (req.url.startsWith('/cats/edit-cat')) {
        const catId = getCatId(req.url)
        const cat = await getCat(catId);
        html = await editCatView(cat);

    } else if (req.url.startsWith('/cats/new-home')) {
        console.log('new home');
        const catId = getCatId(req.url);
        const cat = await getCat(catId);
        html = await shelterCat(cat);

    } else if (req.url.startsWith("/search")) {
        let searchUrl = req.url.split("?")[1]
        const searchParams = new URLSearchParams(searchUrl);
        const searchdata = Array.from(searchParams.values());
        html = await searchCats(searchdata[0])
    } else {
        switch (req.url) {
            case "/":
                html = await homeView()
                break;
            case "/styles/site.css":
                const homeCss = await fs.readFile('./src/styles/site.css', { encoding: 'utf-8' });

                res.writeHead(200, {
                    "content-type": "text/css",
                    "cache-control": "max-age=10"
                })

                res.write(homeCss);
                return res.end();
            case "/cats/add-breed":
                html = await addBreedView();
                break;
            case "/cats/add-cat":
                html = await addCatView();
                break;
            default:
                return res.end();
        }
    }

    res.writeHead(200, {
        "content-type": "text/html"
    })
    res.write(html)

    res.end()
})

server.listen(5050);
console.log("Server is listening on http://localhost:5050");


function catTemplate(cat) {
    return `
        <li>
            <img src="${cat.imageUrl}" alt="${cat.name}">
            <h3>${cat.name}</h3>
            <p><span>Breed: </span>${cat.breed}</p>
            <p><span>Description: </span>${cat.description}</p>
            <ul class="buttons">
                <li class="btn edit"><a href="/cats/edit-cat/${cat.id}/">Change Info</a></li>
                <li class="btn delete"><a href="/cats/new-home/${cat.id}">New Home</a></li>
            </ul>
        </li>
    `
}

async function homeView() {
    const html = await fs.readFile('./src/views/home/index.html', { encoding: "utf-8" });

    const cats = await getCats();
    const catsHtml = cats.map(cat => catTemplate(cat)).join('\n')
    const result = html.replaceAll('{{cats}}', catsHtml)

    return result;
}

async function addBreedView() {
    const html = await fs.readFile('./src/views/addBreed.html', { encoding: "utf-8" });
    return html;
}

async function addCatView() {
    let html = await fs.readFile('./src/views/addCat.html', { encoding: "utf-8" });
    const breeds = await getBreeds();
    let optionTemp = ``;
    breeds.forEach(breed => {
        optionTemp += `\n<option value="${breed}">${breed}</option>`
    })
    html = html.replaceAll("{{breedOptions}}",  optionTemp);
    return html
}

async function editCatView(cat) {
    let html = await fs.readFile('./src/views/editCat.html', { encoding: "utf-8" });
    const entries = Object.entries(cat);

    entries.forEach(entry => {
        let prop = `{{${entry[0]}}}`
        html = html.replaceAll(prop, entry[1])
    })
    let optionTemp = ``;
    const breeds = await getBreeds();
    breeds.forEach(breed => {
        if (breed == cat.breed) {
            optionTemp += `\n<option selected value="${breed}">${breed}</option>`
        } else {
            optionTemp += `\n<option value="${breed}">${breed}</option>`
        }
    })
    html = html.replaceAll("{{breedOptions}}",  optionTemp);
    return html;
}

async function searchCats(criteria) {
    const html = await fs.readFile('./src/views/home/index.html', { encoding: "utf-8" });
    let cats = await getCats();
    let searchResult = [];
    cats.forEach(cat => {
        let catInfo = JSON.stringify(cat).toLowerCase();
        // let catInfo =Object.values(cat);
        if (catInfo.includes(criteria.toLowerCase())) {
            searchResult.push(cat)
        }
    })
    const catsHtml = searchResult.map(cat => catTemplate(cat)).join('\n')
    const result = html.replaceAll('{{cats}}', catsHtml)

    return result;
}

async function shelterCat(cat) {
    let html = await fs.readFile('./src/views/catShelter.html', { encoding: 'utf-8' });
    const entries = Object.entries(cat);
    entries.forEach(entry => {
        let prop = `{{${entry[0]}}}`;
        html = html.replace(prop, entry[1]);
    })
    html = html.replaceAll("{{formUrl}}", `/cats/new-home/${cat.id}/delete`);

    return html;
}

function getCatId(reqUrl) {
    const segments = reqUrl.split("/");
    let catId = Number(segments[3].split("?")[0])
    return catId
}