import http from "http";


const server = http.createServer((req,res) => {
    res.writeHead(200, {
        "content-type": "text/plain",
    })

    res.end()
})

server.listen(5000);
console.log("Server is listening on http://localhost:5000");

