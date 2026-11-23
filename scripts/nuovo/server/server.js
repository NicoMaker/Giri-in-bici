"use strict";

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { RADICE, argomenti, opzione } = require("../base/impostazioni");
const api = require("./api");
const gestione = require("./gestione");
const WEB = path.join(__dirname, "..", "web");
const FILE_STATICI = {
  "/": ["index.html", "text/html; charset=utf-8"], "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/stile.css": ["stile.css", "text/css; charset=utf-8"], "/app.js": ["app.js", "text/javascript; charset=utf-8"],
  "/gestione.js": ["gestione.js", "text/javascript; charset=utf-8"],
};
const inviaJson = (res, codice, corpo) => { res.writeHead(codice, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(corpo)); };
const leggiCorpo = (req, massimo) => new Promise((ok, no) => {
  const pezzi = []; let totale = 0;
  req.on("data", (p) => { totale += p.length; if (totale > massimo) { no(new api.ErroreDati("Richiesta troppo grande.")); req.destroy(); return; } pezzi.push(p); });
  req.on("end", () => ok(Buffer.concat(pezzi))); req.on("error", no);
});
const ipv4Privato = (ip) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.)/.test(ip);
const richiestaAutorizzata = (req) => {
  const host = String(req.headers.host || "").replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
  const origin = req.headers.origin;
  if (["localhost", "127.0.0.1", "::1"].includes(host)) return !origin || ["localhost", "127.0.0.1", "::1"].includes(new URL(origin).hostname);
  const remote = String(req.socket.remoteAddress || "").replace(/^::ffff:/, "");
  if (!ipv4Privato(remote)) return false;
  if (!origin) return false;
  try { const u = new URL(origin); return u.hostname === host && (u.protocol === "http:" || u.protocol === "https:"); } catch { return false; }
};
const gestisci = async (req, res) => {
  if (!richiestaAutorizzata(req)) { res.writeHead(403); return res.end("Accesso consentito solo da localhost o dalla rete locale (stessa origine)."); }
  const url = new URL(req.url, "http://localhost");
  if (req.method === "GET" && FILE_STATICI[url.pathname]) { const [nome, tipo] = FILE_STATICI[url.pathname]; res.writeHead(200, { "Content-Type": tipo, "Cache-Control": "no-store" }); return res.end(fs.readFileSync(path.join(WEB, nome))); }
  if (!url.pathname.startsWith("/api/")) { res.writeHead(404); return res.end("Non trovato"); }
  try {
    if (req.method === "GET" && url.pathname === "/api/stato") return inviaJson(res, 200, { ok: true, ...api.stato() });
    if (req.method === "GET" && url.pathname === "/api/elenco") return inviaJson(res, 200, { ok: true, ...api.elenco() });
    if (req.method === "GET" && url.pathname === "/api/gestione/giri") return inviaJson(res, 200, { ok: true, giri: gestione.elencoGiri() });
    if (req.method === "GET" && url.pathname === "/api/gestione/stagioni") return inviaJson(res, 200, { ok: true, stagioni: gestione.listaStagioni() });
    if (req.method === "POST" && url.pathname === "/api/gestione/giri/salva") return inviaJson(res, 200, gestione.salvaGiro(JSON.parse((await leggiCorpo(req, 1024 * 256)).toString("utf8") || "{}")));
    if (req.method === "POST" && url.pathname === "/api/gestione/giri/elimina") return inviaJson(res, 200, gestione.eliminaGiro(JSON.parse((await leggiCorpo(req, 1024 * 64)).toString("utf8") || "{}")));
    if (req.method === "POST" && url.pathname === "/api/gestione/stagioni/colore") return inviaJson(res, 200, gestione.salvaColore(JSON.parse((await leggiCorpo(req, 1024 * 64)).toString("utf8") || "{}")));
    if (req.method === "POST" && url.pathname === "/api/upload") { const corpo = await leggiCorpo(req, api.MAX_FOTO); api.salvaCaricamento(url.searchParams.get("sid"), url.searchParams.get("cartella"), url.searchParams.get("nome"), corpo); return inviaJson(res, 200, { ok: true }); }
    if (req.method === "POST" && ["/api/anteprima", "/api/conferma"].includes(url.pathname)) { const r = JSON.parse((await leggiCorpo(req, 1024 * 1024)).toString("utf8") || "{}"); const result = url.pathname.endsWith("anteprima") ? await api.anteprima(r.azione, r.dati) : await api.conferma(r.azione, r.dati); return inviaJson(res, 200, result); }
    return inviaJson(res, 404, { ok: false, errore: "Percorso non trovato." });
  } catch (e) {
    const previsto = e instanceof api.ErroreDati || /non esiste|non valido|non trov|obbligatorio|inserisci|deve|km negativi|non può/i.test(e.message);
    return inviaJson(res, previsto ? 400 : 500, { ok: false, errore: e.message });
  }
};
const ipv4Locali = () => Object.values(os.networkInterfaces()).flat().filter((x) => x && x.family === "IPv4" && !x.internal).map((x) => x.address);
const avvia = () => {
  if (!fs.existsSync(path.join(RADICE, "json/Statistiche/History/Storico.json"))) { console.error(`Non sembra la cartella di Giri in Bici: ${RADICE}`); process.exit(1); }
  api.spazzaCaricamenti();
  const base = parseInt(opzione("porta") || process.env.PORT || "3000", 10); let porta = base;
  const server = http.createServer((req, res) => gestisci(req, res).catch((e) => { if (!res.headersSent) res.writeHead(500); res.end(String(e.message)); }));
  server.on("error", (e) => { if (e.code === "EADDRINUSE" && porta < base + 20) { porta++; server.listen(porta, "0.0.0.0"); } else { console.error(`Impossibile avviare il server: ${e.message}`); process.exit(1); } });
  server.on("listening", () => {
    console.log(`\n🚴 Giri in Bici — interfaccia web${argomenti.includes("--prova") ? " (modalità prova)" : ""}`);
    console.log(`📊 Gestionale Bilanci avviato → http://localhost:${porta}`);
    const ips = ipv4Locali();
    console.log(`🌐 IP Pubblico: non esposto (interfaccia limitata alla rete locale)`);
    ips.forEach((ip) => console.log(`🏠 IP Locale:   http://${ip}:${porta}`));
    console.log(`📍 Localhost:   http://localhost:${porta}`);
    console.log("\n--------------------------------------");
    console.log("Da telefono collegato alla stessa rete Wi-Fi, apri l'indirizzo IP Locale.");
    console.log("Per fermare il server: Ctrl+C\n");
  });
  server.listen(porta, "0.0.0.0");
};
avvia();
