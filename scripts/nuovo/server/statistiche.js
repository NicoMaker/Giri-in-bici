"use strict";

// Lettura e aggiornamento palette usate nelle pagine statistiche.
const fs = require("fs");
const path = require("path");
const { RADICE, MESI, PERCORSO_STORICO_JSON } = require("../base/impostazioni");
const { validaColore } = require("../base/utilita");
const CONFIG_MESI = "json/Statistiche/History/config-mesi.json";
const assoluto = (rel) => path.join(RADICE, rel);
const leggi = (rel) => JSON.parse(fs.readFileSync(assoluto(rel), "utf8"));
const salva = (rel, dati) => {
  const file = assoluto(rel);
  const temp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(dati, null, 2)}\n`, "utf8");
  fs.renameSync(temp, file);
};
const controllaColore = (colore) => {
  const errore = validaColore(String(colore || ""));
  if (errore) throw new Error(errore);
};
const leggiColoriStatistiche = () => {
  const storico = leggi(PERCORSO_STORICO_JSON);
  const configurazione = leggi(CONFIG_MESI);
  const anni = Object.keys(storico.anni || {}).sort(
    (a, b) => Number(a) - Number(b),
  );
  return {
    ok: true,
    anni: anni.map((anno, indice) => ({
      anno,
      colore: storico.coloriAnni?.[indice] || "#2dd4bf",
    })),
    mesi: MESI.map((nome) => ({
      nome,
      colore: configurazione.coloriMesi?.[nome] || "#2dd4bf",
    })),
  };
};
const salvaColoreAnno = ({ anno, colore }) => {
  controllaColore(colore);
  const storico = leggi(PERCORSO_STORICO_JSON);
  const anni = Object.keys(storico.anni || {}).sort(
    (a, b) => Number(a) - Number(b),
  );
  const indice = anni.indexOf(String(anno));
  if (indice < 0) throw new Error("Anno statistiche non trovato.");
  storico.coloriAnni = storico.coloriAnni || [];
  storico.coloriAnni[indice] = String(colore).trim();
  salva(PERCORSO_STORICO_JSON, storico);
  return {
    ok: true,
    messaggio: `Colore delle statistiche ${anno} aggiornato.`,
  };
};
const salvaColoreMese = ({ mese, colore }) => {
  controllaColore(colore);
  if (!MESI.includes(mese)) throw new Error("Mese non valido.");
  const configurazione = leggi(CONFIG_MESI);
  configurazione.coloriMesi = configurazione.coloriMesi || {};
  configurazione.coloriMesi[mese] = String(colore).trim();
  salva(CONFIG_MESI, configurazione);
  return {
    ok: true,
    messaggio: `Colore del mese ${mese} aggiornato nelle statistiche.`,
  };
};
module.exports = { leggiColoriStatistiche, salvaColoreAnno, salvaColoreMese };
