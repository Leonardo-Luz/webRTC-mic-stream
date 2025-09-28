const https = require("https");
const fs = require("fs");
const path = require("path");

const options = {
  key: fs.readFileSync("../certs/key.pem"),
  cert: fs.readFileSync("../certs/cert.pem"),
};

https.createServer(options, (req, res) => {
  let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
    } else {
      res.writeHead(200);
      res.end(content);
    }
  });
}).listen(8080, () => console.log("🌐 Client served at https://localhost:8080"));
