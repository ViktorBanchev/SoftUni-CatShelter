import http from "http";
import fs from "fs/promises";

import { getCat, getCats, saveCat, updateCat } from "./data.js";

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
                <li class="btn delete"><a href="">New Home</a></li>
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
    const html = await fs.readFile('./src/views/addCat.html', { encoding: "utf-8" });
    return html
}

async function editCatView(cat) {
    let html = await fs.readFile('./src/views/editCat.html', { encoding: "utf-8" });
    const entries = Object.entries(cat);
    entries.forEach(entry => {
        let testVar = `{{${entry[0]}}}`
        html = html.replaceAll(testVar, entry[1])
    })

    return html;
}

function getCatId(reqUrl) {
    const segments = reqUrl.split("/");
    const catId = Number(segments[3]);
    return catId;
}