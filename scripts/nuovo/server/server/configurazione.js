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
const monitor = require("./monitor");
const WEB = path.join(__dirname, "..", "www");
const FILE_STATICI = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"],
  "/app.js": ["app.js", "text/javascript; charset=utf-8"],
  "/gestione.js": ["gestione.js", "text/javascript; charset=utf-8"],
  "/icona.svg": ["icona.svg", "image/svg+xml"],
};
const MAX_BANDIERA = 5 * 1024 * 1024;
const TIPI_IMMAGINE = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};
// /img/Icons/Bandiere/Austria.png → <radice>/Img/Icons/Bandiere/Austria.png (senza uscire da Img)
const percorsoImmagine = (pathname) => {
  let rel;
  try {
    rel = decodeURIComponent(pathname.slice("/img/".length));
  } catch {
    return null;
  }
  if (!rel || rel.includes("\0") || rel.split(/[\\/]/).includes(".."))
    return null;
  const cartellaImg = path.join(RADICE, "Img");
  const file = path.join(cartellaImg, rel);
  if (!file.startsWith(cartellaImg + path.sep)) return null;
  if (!TIPI_IMMAGINE[path.extname(file).toLowerCase()]) return null;
  try {
    return fs.statSync(file).isFile() ? file : null;
  } catch {
    return null;
  }
};
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
const NOMI_LOCALI = ["localhost", "127.0.0.1", "::1"];
const richiestaAutorizzata = (req) => {
  const host = String(req.headers.host || "")
    .replace(/:\d+$/, "")
    .replace(/^\[|\]$/g, "");
  const origin = req.headers.origin;
  const lettura = ["GET", "HEAD"].includes(req.method);
  if (NOMI_LOCALI.includes(host)) {
    if (!origin) return true;
    try {
      return NOMI_LOCALI.includes(new URL(origin).hostname);
    } catch {
      return false;
    }
  }
  // Rete locale (telefono sullo stesso Wi-Fi): host = IP privato, chi chiama = IP privato.
  const remote = String(req.socket.remoteAddress || "").replace(/^::ffff:/, "");
  if (!ipv4Privato(remote) || !ipv4Privato(host)) return false;
  // Un browser non manda Origin nelle letture della stessa pagina: va bene.
  // Le scritture invece devono arrivare dalla pagina servita da questo stesso indirizzo.
  if (!origin) return lettura;
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
