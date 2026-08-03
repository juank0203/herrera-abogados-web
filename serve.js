#!/usr/bin/env node
/**
 * Servidor local de solo lectura para previsualizar ./dist con el mismo
 * comportamiento de rutas limpias que ofrecen Netlify, Vercel, Cloudflare
 * Pages o GitHub Pages en producción (carpeta/index.html para cada ruta).
 *
 * Sin dependencias externas — solo el módulo http de Node.
 * Uso:  node serve.js  →  http://localhost:4000
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "dist");
const PORT = process.env.PORT || 4000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

function safeResolve(urlPath) {
  // Quita query string y decodifica
  let pathname = decodeURIComponent(urlPath.split("?")[0]);

  // Evita salir de /dist
  pathname = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");

  let filePath = path.join(DIST, pathname);

  // Ruta limpia tipo carpeta: /nosotros → /nosotros/index.html
  if (pathname.endsWith("/")) {
    filePath = path.join(filePath, "index.html");
  } else if (!path.extname(filePath)) {
    filePath = path.join(filePath, "index.html");
  }

  return filePath;
}

const server = http.createServer((req, res) => {
  const filePath = safeResolve(req.url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Página 404 simple (usa la home si no existe una dedicada)
      const notFoundPath = path.join(DIST, "404.html");
      fs.readFile(notFoundPath, (err2, data2) => {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(err2 ? "<h1>404 — Página no encontrada</h1>" : data2);
      });
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  Herrera Abogados — vista previa local`);
  console.log(`  → http://localhost:${PORT}\n`);
  console.log(`  Rutas:`);
  console.log(`    http://localhost:${PORT}/`);
  console.log(`    http://localhost:${PORT}/nosotros`);
  console.log(`    http://localhost:${PORT}/servicios`);
  console.log(`    http://localhost:${PORT}/casos`);
  console.log(`    http://localhost:${PORT}/contacto\n`);
});
