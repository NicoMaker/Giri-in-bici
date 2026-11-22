"use strict";

// Terminale: colori, lettura delle risposte e domande (chiedi, scegli, si/no).

const readline = require("readline");

const colori = process.stdout.isTTY && !process.env.NO_COLOR;

const c = (codice, t) => (colori ? `\x1b[${codice}m${t}\x1b[0m` : t);

const grassetto = (t) => c("1", t);

const verde = (t) => c("32", t);

const giallo = (t) => c("33", t);

const rosso = (t) => c("31", t);

const grigio = (t) => c("90", t);

const ciano = (t) => c("36", t);

// Le risposte arrivano da una coda di righe: funziona sia scrivendo a mano
// sia con input "incollato" o da file (nessuna riga si perde).
const rl = readline.createInterface({ input: process.stdin, terminal: false });

const righe = [];

const inAttesa = [];

let chiuso = false;

rl.on("line", (riga) => {
  if (inAttesa.length) inAttesa.shift()(riga);
  else righe.push(riga);
});

rl.on("close", () => {
  chiuso = true;
  while (inAttesa.length) inAttesa.shift()(null);
});

const leggiRiga = () =>
  new Promise((risolvi) => {
    if (righe.length) return risolvi(righe.shift());
    if (chiuso) return risolvi(null);
    inAttesa.push(risolvi);
  });

class Uscita extends Error {}

const chiedi = async (domanda, predefinito = "") => {
  const suggerimento = predefinito !== "" ? grigio(` [${predefinito}]`) : "";
  process.stdout.write(`${ciano("?")} ${domanda}${suggerimento}: `);
  const riga = await leggiRiga();
  if (riga === null) {
    process.stdout.write("\n");
    throw new Uscita("Input terminato.");
  }
  if (!process.stdin.isTTY) process.stdout.write(`${riga}\n`);
  const t = riga.trim();
  return t === "" ? predefinito : t;
};

const chiediValido = async (domanda, predefinito, valida) => {
  for (;;) {
    const r = await chiedi(domanda, predefinito);
    const errore = valida(r);
    if (!errore) return r;
    console.log(rosso(`  ✖ ${errore}`));
  }
};

const chiediSiNo = async (domanda, predefinito = true) => {
  const r = (await chiedi(`${domanda} (s/n)`, predefinito ? "s" : "n")).toLowerCase();
  return ["s", "si", "sì", "y", "yes"].includes(r);
};

const scegli = async (titolo, opzioni) => {
  console.log(`\n${grassetto(titolo)}`);
  opzioni.forEach((o, i) => console.log(`  ${grassetto(String(o.tasto ?? i + 1))}) ${o.testo}`));
  const tasti = opzioni.map((o, i) => String(o.tasto ?? i + 1));
  const r = await chiediValido("Scelta", "", (v) => (tasti.includes(v) ? null : "Scelta non valida."));
  return opzioni[tasti.indexOf(r)];
};

module.exports = { grassetto, verde, giallo, rosso, grigio, ciano, rl, Uscita, chiedi, chiediValido, chiediSiNo, scegli, rl };
