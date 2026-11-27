"use strict";

const fs = require("fs");
const path = require("path");

const WEB = path.join(__dirname, "..", "www");
const PACCHETTI = {
  "app.js": {
    cartella: "app",
    file: [
      "avvio-e-servizi.js",
      "supporto-dom.js",
      "icone-ui.js",
      "date-e-selezioni.js",
      "select-e-bandiere.js",
      "editor-link-e-upload.js",
      "moduli-stagione-e-mese.js",
      "moduli-giro-e-foto.js",
      "moduli-anno-e-stagione.js",
      "anteprima-e-conferma.js",
      "interazioni-moduli.js",
      "tema-colore.js",
    ],
  },
  "gestione.js": {
    cartella: "gestione",
    // I file contengono solo istruzioni: l'involucro che le isola (stato condiviso) lo aggiunge il server.
    involucro: [
      '"use strict";\n// Sezioni Archivio giri, Utenti, Bandiere, Colori e periodi. Usa $, el, api, paesi e i componenti di app.js.\n(() => {\n',
      "\n})();\n",
    ],
    file: [
      "utilita-modali-archivio.js",
      "selezione-multipla.js",
      "filtri-e-ricerca.js",
      "ordinamento-archivio.js",
      "utenti.js",
      "bandiere.js",
      "riepilogo.js",
      "esperienza.js",
      "colori-e-periodi.js",
      "aggiornamenti-live.js",
      "azioni-gestione.js",
    ],
  },
  "styles.css": {
    cartella: "stili",
    file: ["interfaccia.css"],
  },
};

const leggiBundle = (nome) => {
  const pacchetto = PACCHETTI[nome];
  if (!pacchetto) throw new Error("Risorsa modulare non riconosciuta.");
  const cartella = path.join(WEB, pacchetto.cartella);
  const sorgenti = pacchetto.file.map((file) => path.join(cartella, file));
  const mancante = sorgenti.find((sorgente) => !fs.existsSync(sorgente));
  if (mancante) throw new Error(`Sorgente mancante per ${nome}: ${mancante}.`);
  const corpo = sorgenti
    .map((percorso) => fs.readFileSync(percorso, "utf8"))
    .join("");
  const [testa, piede] = pacchetto.involucro || ["", ""];
  return `${testa}${corpo}${piede}`;
};

module.exports = { leggiBundle };
