"use strict";

// Server web locale per aggiornare Giri in Bici da browser.
// Nessuna libreria: solo Node.js. Si ascolta solo su 127.0.0.1 (questo computer).

process.env.NO_COLOR = "1"; // niente codici colore del terminale nei testi inviati al browser

const fs = require("fs");
const http = require("http");
const path = require("path");
const { exec } = require("child_process");
const { RADICE, argomenti, opzione } = require("../base/impostazioni");
const api = require("./api");

const WEB = path.join(__dirname, "..", "web");

const FILE_STATICI = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/stile.css": ["stile.css", "text/css; charset=utf-8"],
  "/app.js": ["app.js", "text/javascript; charset=utf-8"],
};

const inviaJson = (res, codice, corpo) => {
  const testo = JSON.stringify(corpo);
  res.writeHead(codice, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(testo);
};

const leggiCorpo = (req, massimo) =>
  new Promise((risolvi, rifiuta) => {
    const pezzi = [];
    let totale = 0;
    req.on("data", (p) => {
      totale += p.length;
      if (totale > massimo) {
        rifiuta(new api.ErroreDati("File o richiesta troppo grande."));
        req.destroy();
        return;
      }
      pezzi.push(p);
    });
    req.on("end", () => risolvi(Buffer.concat(pezzi)));
    req.on("error", rifiuta);
  });

// Accetto solo richieste dal browser aperto su questo computer (protezione da altri siti).
const richiestaLocale = (req) => {
  const host = String(req.headers.host || "").replace(/:\d+$/, "");
  if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) return false;
  const origine = req.headers.origin;
  if (!origine) return true;
  try {
    return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(origine).hostname);
  } catch {
    return false;
  }
};

const gestisci = async (req, res) => {
  if (!richiestaLocale(req)) {
    res.writeHead(403);
    return res.end("Accesso negato");
  }
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && FILE_STATICI[url.pathname]) {
    const [nome, tipo] = FILE_STATICI[url.pathname];
    res.writeHead(200, { "Content-Type": tipo, "Cache-Control": "no-store" });
    return res.end(fs.readFileSync(path.join(WEB, nome)));
  }

  if (!url.pathname.startsWith("/api/")) {
    res.writeHead(404);
    return res.end("Non trovato");
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/stato")
      return inviaJson(res, 200, { ok: true, ...api.stato() });
    if (req.method === "GET" && url.pathname === "/api/elenco")
      return inviaJson(res, 200, { ok: true, ...api.elenco() });

    if (req.method === "POST" && url.pathname === "/api/upload") {
      const corpo = await leggiCorpo(req, api.MAX_FOTO);
      api.salvaCaricamento(
        url.searchParams.get("sid"),
        url.searchParams.get("cartella"),
        url.searchParams.get("nome"),
        corpo,
      );
      return inviaJson(res, 200, { ok: true });
    }

    if (
      req.method === "POST" &&
      ["/api/anteprima", "/api/conferma"].includes(url.pathname)
    ) {
      const richiesta = JSON.parse((await leggiCorpo(req, 1024 * 1024)).toString("utf8") || "{}");
      const risposta =
        url.pathname === "/api/anteprima"
          ? await api.anteprima(richiesta.azione, richiesta.dati)
          : await api.conferma(richiesta.azione, richiesta.dati);
      return inviaJson(res, 200, risposta);
    }

    return inviaJson(res, 404, { ok: false, errore: "Percorso non trovato." });
  } catch (e) {
    // Errori di compilazione del modulo: messaggio chiaro, 400. Imprevisti: 500.
    const previsto = e instanceof api.ErroreDati || /Esiste già|Non esiste|non trovato|non valido|Non trovo|rimasto/i.test(e.message);
    // nel browser non si usa il terminale: il suggerimento rimanda al menu a sinistra
    const errore = e.message.replace(
      /Crealo prima con: node scripts\/nuovo\.js → "([^"]*)"\./,
      "Crealo prima dal menu a sinistra.",
    );
    return inviaJson(res, previsto ? 400 : 500, { ok: false, errore });
  }
};

const apri = (url) => {
  const comando =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(comando, () => {});
};

const avvia = () => {
  if (!fs.existsSync(path.join(RADICE, "json/Statistiche/History/Storico.json"))) {
    console.error(`Non sembra la cartella di Giri in Bici: ${RADICE}`);
    process.exit(1);
  }
  api.spazzaCaricamenti();

  const porta0 = parseInt(opzione("porta") || process.env.PORT || "3000", 10);
  let porta = porta0;
  const server = http.createServer((req, res) => {
    gestisci(req, res).catch((e) => {
      res.writeHead(500);
      res.end(String(e.message));
    });
  });

  server.on("error", (e) => {
    if (e.code === "EADDRINUSE" && porta < porta0 + 20) {
      porta += 1;
      server.listen(porta, "127.0.0.1");
    } else {
      console.error(`Impossibile avviare il server: ${e.message}`);
      process.exit(1);
    }
  });

  server.on("listening", () => {
    const url = `http://localhost:${porta}`;
    console.log("\n🚴 Giri in Bici — interfaccia web");
    console.log(`   Cartella: ${RADICE}${argomenti.includes("--prova") ? "  (modalità --prova)" : ""}`);
    console.log(`   Apri:     ${url}`);
    console.log("   Per fermare il server: Ctrl+C\n");
    if (!argomenti.includes("--senza-browser")) apri(url);
  });

  server.listen(porta, "127.0.0.1");
};

avvia();
