"use strict";
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { RADICE, argomenti, opzione } = require("../base/impostazioni");
const api = require("./api");
const gestione = require("./gestione");
const statistiche = require("./statistiche");
const risorse = require("./risorse");
const WEB = path.join(__dirname, "..", "www");
const FILE_STATICI = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"],
  "/app.js": ["app.js", "text/javascript; charset=utf-8"],
  "/gestione.js": ["gestione.js", "text/javascript; charset=utf-8"],
};
const MAX_BANDIERA = 5 * 1024 * 1024;
const inviaJson = (res, codice, corpo) => {
  res.writeHead(codice, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(corpo));
};
const leggiCorpo = (req, massimo) =>
  new Promise((ok, no) => {
    const pezzi = [];
    let totale = 0;
    req.on("data", (pezzo) => {
      totale += pezzo.length;
      if (totale > massimo) {
        no(new api.ErroreDati("Richiesta troppo grande."));
        req.destroy();
        return;
      }
      pezzi.push(pezzo);
    });
    req.on("end", () => ok(Buffer.concat(pezzi)));
    req.on("error", no);
  });
const ipv4Privato = (ip) =>
  /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.)/.test(ip);
const richiestaAutorizzata = (req) => {
  const host = String(req.headers.host || "")
    .replace(/:\d+$/, "")
    .replace(/^\[|\]$/g, "");
  const origin = req.headers.origin;
  if (["localhost", "127.0.0.1", "::1"].includes(host)) {
    if (!origin) return true;
    try {
      return ["localhost", "127.0.0.1", "::1"].includes(
        new URL(origin).hostname,
      );
    } catch {
      return false;
    }
  }
  const remote = String(req.socket.remoteAddress || "").replace(/^::ffff:/, "");
  if (!ipv4Privato(remote) || !origin) return false;
  try {
    const origine = new URL(origin);
    return (
      origine.hostname === host &&
      ["http:", "https:"].includes(origine.protocol)
    );
  } catch {
    return false;
  }
};
const leggiJsonRichiesta = async (req, max = 256 * 1024) =>
  JSON.parse((await leggiCorpo(req, max)).toString("utf8") || "{}");
const gestisci = async (req, res) => {
  if (!richiestaAutorizzata(req)) {
    res.writeHead(403);
    return res.end("Accesso consentito solo da localhost o dalla rete locale.");
  }
  const url = new URL(req.url, "http://localhost");
  if (req.method === "GET" && FILE_STATICI[url.pathname]) {
    const [nome, tipo] = FILE_STATICI[url.pathname];
    const contenuto = ["app.js", "gestione.js", "styles.css"].includes(nome)
      ? risorse.leggiBundle(nome)
      : fs.readFileSync(path.join(WEB, nome));
    res.writeHead(200, {
      "Content-Type": tipo,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    return res.end(contenuto);
  }
  const bandiera = url.pathname.match(/^\/img\/Bandiere\/([a-z]{2})\.svg$/i);
  if (req.method === "GET" && bandiera) {
    const nome = `${bandiera[1].toLowerCase()}.svg`;
    const file = path.join(__dirname, "..", "base", "bandiere", nome); // anteprima nella pagina: copia inclusa col programma
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      return res.end("Non trovato");
    }
    res.writeHead(200, {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    return res.end(fs.readFileSync(file));
  }
  const icona = url.pathname.match(
    /^\/(?:img|Img)\/Icons\/([a-z0-9_-]+\.(?:png|jpe?g|webp))$/i,
  );
  if (req.method === "GET" && icona) {
    const file = path.join(RADICE, "Img", "Icons", icona[1]);
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      return res.end("Non trovato");
    }
    const estensione = path.extname(file).toLowerCase();
    const tipo =
      estensione === ".png"
        ? "image/png"
        : estensione === ".webp"
          ? "image/webp"
          : "image/jpeg";
    res.writeHead(200, {
      "Content-Type": tipo,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    return res.end(fs.readFileSync(file));
  }
  if (!url.pathname.startsWith("/api/")) {
    res.writeHead(404);
    return res.end("Non trovato");
  }
  try {
    if (
      req.method === "POST" &&
      api.stato().prova &&
      !["/api/anteprima", "/api/conferma"].includes(url.pathname)
    )
      return inviaJson(res, 409, {
