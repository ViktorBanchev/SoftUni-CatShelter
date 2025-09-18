import http from "http";
import fs from "fs/promises";

import cats from "./cats.js";

const server = http.createServer(async (req, res) => {
    let html;

    if (req.method == "POST") {
        console.log("POST Requst has been made");

        let data = '';

        req.on('data', (chunk) => {
            data += chunk.toString();
        });

        req.on('end', () => {
            const searchParams = new URLSearchParams(data);

            const newCat = Object.fromEntries(searchParams.entries());

            cats.push(newCat);

            res.writeHead(302, {
                'location': '/'
            })

            res.end();
        })
        return
    }


    switch (req.url) {
        case "/":
            html = await homeView()
            break;
        case "/styles/site.css":
            const homeCss = await fs.readFile('./src/styles/site.css', { encoding: 'utf-8' });

            res.writeHead(200, {
                "content-type": "text/css"
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
                <li class="btn edit"><a href="">Change Info</a></li>
                <li class="btn delete"><a href="">New Home</a></li>
            </ul>
        </li>
    `
}

async function homeView() {
    const html = await fs.readFile('./src/views/home/index.html', { encoding: "utf-8" });

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