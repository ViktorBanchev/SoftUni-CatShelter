import http from "http";
import fs from "fs/promises";


const server = http.createServer(async (req, res) => {
    console.log(req.url)
    let html;
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

server.listen(5000);
console.log("Server is listening on http://localhost:5000");

async function homeView() {
    const html = await fs.readFile('./src/views/home/index.html', { encoding: "utf-8" });
    return html
}

async function addBreedView() {
    const html = await fs.readFile('./src/views/addBreed.html', { encoding: "utf-8" });
    return html;
}

async function addCatView() {
    const html = await fs.readFile('./src/views/addCat.html', { encoding: "utf-8" });
    return html
}