"use strict";

// Server locale: serve la pagina web e le API per creare/modificare i dati.
// Avvio: node scripts/server.js  →  apri http://localhost:3000

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const { RADICE } = require("./nuovo/base/impostazioni");

const PORTA = process.env.PORTA || 3000;
const CARTELLA_WEB = path.join(__dirname, "web");

const mime = {
  ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
};

const leggiCorpo = (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { reject(new Error("JSON non valido nel corpo della richiesta.")); }
    });
    req.on("error", reject);
  });

const rispondi = (res, codice, obj) => {
  res.writeHead(codice, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
};

// Esegue `node scripts/nuovo.js <args>` con input opzionale da stdin
const eseguiNuovo = (args, input = "") =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, "nuovo.js"), ...args], {
      cwd: RADICE,
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve({ ok: true, output: out })
        : reject(new Error(err || out || `Codice ${code}`)),
    );
    child.stdin.write(input);
    child.stdin.end();
  });

const api = {
  async stato() {
    const storico = JSON.parse(
      fs.readFileSync(path.join(RADICE, "json/Statistiche/History/Storico.json"), "utf8"),
    );
    const stagioni = {};
    for (const nome of ["Primavera", "Estate", "Autunno_Inverno"]) {
      const g = JSON.parse(
        fs.readFileSync(path.join(RADICE, `json/${nome}/generale.json`), "utf8"),
      );
      stagioni[nome] = {
        periodi: Object.keys(g.subPeriods).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)),
        colori: g.colors || [],
      };
    }
    return {
      anni: Object.keys(storico.anni).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)),
      coloriAnni: storico.coloriAnni || [],
      stagioni,
    };
  },

  async giro(body) {
    const { stagione, data, luogo, km, link } = body;
    if (!stagione || !data || !luogo || !km) {
      throw new Error("Stagione, data, luogo e km sono obbligatori.");
    }
    const args = [
      "--giro",
      `--stagione=${stagione}`,
      `--data=${data}`,
      `--km=${km}`,
      `--luogo=${luogo}`,
      "--si",
    ];
    if (link) args.push(`--link=${link}`);
    return eseguiNuovo(args);
  },

  async mese(body) {
    const { anno, mese, km, corse, sostituisci } = body;
    if (!anno || !mese || km === undefined) {
      throw new Error("Anno, mese e km sono obbligatori.");
    }
    const args = [
      "--mese",
      `--anno=${anno}`,
      `--mese=${mese}`,
      `--km=${km}`,
      "--si",
    ];
    if (corse) args.push(`--corse=${corse}`);
    if (sostituisci) args.push("--sostituisci");
    return eseguiNuovo(args);
  },

  async stagione(body) {
    const { nome, periodo, colore } = body;
    if (!nome || !periodo || !colore) {
      throw new Error("Nome stagione, periodo e colore sono obbligatori.");
    }
    return eseguiNuovo([
      "--stagione-nuova",
      `--nome=${nome}`,
      `--periodo=${periodo}`,
      `--colore=${colore}`,
      "--si",
    ]);
  },

  async anno(body) {
    const { anno, colore } = body;
    if (!anno || !colore) throw new Error("Anno e colore sono obbligatori.");
    return eseguiNuovo([
      "--anno-nuovo",
      `--anno=${anno}`,
      `--colore=${colore}`,
      "--si",
    ]);
  },

  async foto(body) {
    const { stagione, periodo, cartella } = body;
    if (!stagione || !periodo || !cartella) {
      throw new Error("Stagione, periodo e cartella sono obbligatori.");
    }
    return eseguiNuovo([
      "--foto",
      `--stagione=${stagione}`,
      `--periodo=${periodo}`,
      `--cartella=${cartella}`,
      "--si",
    ]);
  },
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && !url.pathname.startsWith("/api/")) {
    const file = url.pathname === "/" ? "/index.html" : url.pathname;
    const percorso = path.join(CARTELLA_WEB, file);
    if (percorso.startsWith(CARTELLA_WEB) && fs.existsSync(percorso) && fs.statSync(percorso).isFile()) {
      res.writeHead(200, { "Content-Type": mime[path.extname(percorso)] || "text/plain" });
      return fs.createReadStream(percorso).pipe(res);
    }
    const imgPath = path.join(RADICE, url.pathname);
    if (fs.existsSync(imgPath) && fs.statSync(imgPath).isFile()) {
      res.writeHead(200, { "Content-Type": mime[path.extname(imgPath)] || "application/octet-stream" });
      return fs.createReadStream(imgPath).pipe(res);
    }
    res.writeHead(404);
    return res.end("Non trovato");
  }

  if (req.method === "GET" && url.pathname === "/api/stato") {
    try { return rispondi(res, 200, await api.stato()); }
    catch (e) { return rispondi(res, 500, { errore: e.message }); }
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/")) {
    const azione = url.pathname.slice(5);
    if (!api[azione]) return rispondi(res, 404, { errore: "Azione sconosciuta." });
    try {
      const body = await leggiCorpo(req);
      return rispondi(res, 200, await api[azione](body));
    } catch (e) {
      return rispondi(res, 400, { errore: e.message });
    }
  }

  res.writeHead(404);
  res.end("Non trovato");
});

server.listen(PORTA, () => {
  console.log(`\n🚴 Giri in Bici — pannello web`);
  console.log(`   Apri: http://localhost:${PORTA}\n`);
});