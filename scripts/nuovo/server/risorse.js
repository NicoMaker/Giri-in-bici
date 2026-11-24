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
      "date-e-selezioni.js",
      "select-e-bandiere.js",
      "editor-link-e-upload.js",
      "moduli-stagione-e-mese.js",
      "moduli-giro-e-foto.js",
      "moduli-anno-e-stagione.js",
      "anteprima-e-conferma.js",
      "interazioni-moduli.js",
    ],
  },
  "gestione.js": {
    cartella: "gestione",
    file: [
      "utilita-modali-archivio.js",
      "filtri-e-ricerca.js",
      "ordinamento-archivio.js",
      "utenti.js",
      "colori-e-periodi.js",
      "azioni-gestione.js",
    ],
  },
  "styles.css": {
    cartella: "stili",
    file: [
      "tema.css",
      "intestazione.css",
      "impaginazione.css",
      "campi-form.css",
      "campi-avanzati.css",
      "selettore-stagione.css",
      "sezioni-espandibili.css",
      "caricamento-foto.css",
      "pulsanti.css",
      "risultati.css",
      "elenchi.css",
      "stato-caricamento.css",
      "responsive.css",
      "navigazione-menu.css",
      "archivio-giri.css",
      "colori-periodi-notifiche.css",
      "schede-link-utenti.css",
      "filtri-multipli.css",
      "filtri-e-ricerca.css",
      "modali-e-bandiere.css",
      "upload-bandiere-menu.css",
      "responsive-menu.css",
      "moderno.css",
      "ricerca-menu.css",
    ],
  },
};

const leggiBundle = (nome) => {
  const pacchetto = PACCHETTI[nome];
  if (!pacchetto) throw new Error("Risorsa modulare non riconosciuta.");
  const cartella = path.join(WEB, pacchetto.cartella);
  const sorgenti = pacchetto.file.map((file) => path.join(cartella, file));
  const mancante = sorgenti.find((sorgente) => !fs.existsSync(sorgente));
  if (mancante) throw new Error(`Sorgente mancante per ${nome}: ${mancante}.`);
  return sorgenti
    .map((percorso) => fs.readFileSync(percorso, "utf8"))
    .join("");
};

module.exports = { leggiBundle };
