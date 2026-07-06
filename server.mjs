import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const distDir = resolve(process.cwd(), "dist");
const host = "127.0.0.1";
const port = 4173;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = createServer((request, response) => {
  const urlPath = request.url === "/" ? "/index.html" : request.url || "/index.html";
  const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(distDir, safePath);

  if (!filePath.startsWith(distDir) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Preview server running at http://${host}:${port}`);
});
