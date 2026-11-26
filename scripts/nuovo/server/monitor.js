"use strict";

// Aggiornamenti in tempo reale: controlla le cartelle Img e json e avvisa le pagine aperte
// (Server-Sent Events su /api/eventi) appena qualcosa cambia, senza ricaricare la pagina.
// Funziona anche quando un'immagine o un JSON viene creato a mano o da codice, fuori dal gestionale.

const fs = require("fs");
const path = require("path");
const { RADICE } = require("../base/impostazioni");

const CARTELLE = ["Img", "json"];
const ATTESA_MS = 250; // raggruppa più modifiche ravvicinate in un solo avviso
const CONTROLLO_MS = 3000; // rete di sicurezza se fs.watch non vede una modifica
const BATTITO_MS = 20000; // tiene viva la connessione

const clienti = new Set();
let versione = 0;
let istantanea = new Map();
let inAttesa = new Set();
let timer = null;
let sincronizza = () => false;

const temporaneo = (nome) =>
  /\.tmp-\d+$|~$|\.swp$|\.crdownload$|\.part$/i.test(nome);

const scansiona = (cartella = RADICE, trovati = new Map()) => {
  for (const nome of CARTELLE) {
    const base = path.join(cartella, nome);
    if (fs.existsSync(base)) visita(base, trovati);
  }
  return trovati;
};
const visita = (cartella, trovati) => {
  let voci;
  try {
    voci = fs.readdirSync(cartella, { withFileTypes: true });
  } catch {
    return;
  }
  for (const voce of voci) {
    const completo = path.join(cartella, voce.name);
    if (voce.isDirectory()) visita(completo, trovati);
    else if (voce.isFile() && !temporaneo(voce.name)) {
      try {
        const st = fs.statSync(completo);
        trovati.set(
          path.relative(RADICE, completo).split(path.sep).join("/"),
          `${st.size}:${Math.round(st.mtimeMs)}`,
        );
      } catch {
        /* file sparito nel frattempo */
      }
    }
  }
};

const area = (rel) => {
  if (/^Img\/Icons\/Bandiere\//i.test(rel) || /^json\/Bandiere-/i.test(rel))
    return "bandiere";
  if (/^(Img|json)\/About_US\//i.test(rel)) return "utenti";
  if (/^json\/Statistiche\//i.test(rel)) return "statistiche";
  if (/^json\//i.test(rel)) return "giri";
  return "immagini";
};

const invia = (cliente, evento, dati) =>
  cliente.write(`event: ${evento}\ndata: ${JSON.stringify(dati)}\n\n`);

const annuncia = (aree) => {
  versione += 1;
  const dati = { v: versione, aree: [...aree], t: Date.now() };
  for (const c of clienti) {
    try {
      invia(c, "cambiato", dati);
    } catch {
      clienti.delete(c);
    }
  }
};

const elabora = () => {
  timer = null;
  const percorsi = inAttesa;
  inAttesa = new Set();
  const aree = new Set([...percorsi].map(area));
  if (aree.has("bandiere")) {
    try {
      // un'immagine nuova in Img/Icons/Bandiere entra da sola nel catalogo
      if (sincronizza()) aree.add("bandiere");
    } catch (e) {
      console.error(`Catalogo bandiere non sincronizzato: ${e.message}`);
    }
  }
  istantanea = scansiona();
  if (aree.size) annuncia(aree);
};

const segnala = (rel) => {
  if (!rel || temporaneo(rel)) return;
  inAttesa.add(rel.split(path.sep).join("/"));
  if (!timer) timer = setTimeout(elabora, ATTESA_MS);
};

const controllaDifferenze = () => {
  const nuova = scansiona();
  for (const [rel, firma] of nuova)
    if (istantanea.get(rel) !== firma) segnala(rel);
  for (const rel of istantanea.keys()) if (!nuova.has(rel)) segnala(rel);
};

const iscrivi = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-store, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("retry: 2000\n\n");
  invia(res, "pronto", { v: versione, t: Date.now() });
  clienti.add(res);
  const battito = setInterval(() => {
    try {
      res.write(": battito\n\n");
    } catch {
      /* chiusa: la pulizia avviene su "close" */
    }
  }, BATTITO_MS);
  req.on("close", () => {
    clearInterval(battito);
    clienti.delete(res);
  });
};

const avvia = (funzioneSincronizza) => {
  if (typeof funzioneSincronizza === "function")
    sincronizza = funzioneSincronizza;
  istantanea = scansiona();
  for (const nome of CARTELLE) {
    const base = path.join(RADICE, nome);
    if (!fs.existsSync(base)) continue;
    try {
      const guardia = fs.watch(base, { recursive: true }, (_evento, file) =>
        segnala(file ? path.join(nome, String(file)) : nome),
      );
      guardia.on("error", () => {
        /* resta il controllo periodico */
      });
      guardia.unref();
    } catch {
      /* fs.watch ricorsivo non disponibile: basta il controllo periodico */
    }
  }
  setInterval(controllaDifferenze, CONTROLLO_MS).unref();
};

module.exports = { avvia, iscrivi, annuncia };
