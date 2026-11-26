"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { createRequire } = require("module");

const RADICE = __dirname;
const cache = new Map();
const SORGENTI = {
  "azioni/stagione": ["crea-stagione.js", "copia-foto.js"],
  "base/impostazioni": ["opzioni-avvio.js", "palette-colori.js"],
  "base/luogo": [
    "paesi-e-codici.js",
    "formattazione-luogo.js",
    "esportazioni.js",
  ],
  "calcoli/giri-e-statistiche": [
    "date-e-periodi.js",
    "inserimento-ordinato.js",
    "statistiche-mensili.js",
  ],
  "server/api": [
    "richieste-e-caricamenti.js",
    "stato-e-dati.js",
    "piano-modifiche.js",
    "conferma-salvataggio.js",
  ],
  "server/gestione": [
    "archivio-giri.js",
    "transazioni.js",
    "periodi-e-colori.js",
    "backup-e-utenti.js",
    "bandiere-personalizzate.js",
  ],
  "server/server": ["configurazione.js", "tipi-richiesta.js", "avvio.js"],
};

const caricaModulo = (nome) => {
  if (!/^[a-z0-9/-]+$/i.test(nome)) throw new Error("Modulo non valido.");
  if (cache.has(nome)) return cache.get(nome).exports;

  const elenco = SORGENTI[nome];
  if (!elenco) throw new Error(`Modulo non riconosciuto: ${nome}.`);

  const file = path.join(RADICE, `${nome}.js`);
  const cartella = path.join(RADICE, nome);
  const sorgenti = elenco.map((nomeFile) => path.join(cartella, nomeFile));
  const mancante = sorgenti.find((sorgente) => !fs.existsSync(sorgente));
  if (mancante) throw new Error(`Sorgente mancante: ${mancante}.`);

  const modulo = { exports: {} };
  cache.set(nome, modulo);
  const codice = sorgenti
    .map((sorgente) => fs.readFileSync(sorgente, "utf8"))
    .join("");
  const esegui = vm.compileFunction(
    codice,
    ["require", "module", "exports", "__filename", "__dirname"],
    { filename: file },
  );
  esegui(createRequire(file), modulo, modulo.exports, file, path.dirname(file));
  return modulo.exports;
};

module.exports = caricaModulo;
