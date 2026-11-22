"use strict";

// Utilita: ordinamento periodi, lettura JSON, validazione di periodi e colori.

const { COLORI_CSS, MESI } = require("./impostazioni");
const { chiediSiNo, chiediValido, grigio, scegli } = require("./terminale");

const ordinaPeriodi = (a, b) =>
  parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b);

const leggiJson = (piano, rel) => JSON.parse(piano.leggi(rel));

const periodoSuccessivo = (formato, ultimo) => {
  const anno = parseInt(ultimo, 10);
  return formato === "biennio" ? `${anno + 1}-${anno + 2}` : String(anno + 1);
};

const validaPeriodo = (formato, esistenti) => (v) => {
  if (formato === "anno") {
    if (!/^\d{4}$/.test(v)) return "Scrivi l'anno con 4 cifre, es. 2027.";
  } else {
    const m = v.match(/^(\d{4})-(\d{4})$/);
    if (!m) return "Scrivi il periodo come 2027-2028.";
    if (parseInt(m[2], 10) !== parseInt(m[1], 10) + 1)
      return "Il secondo anno deve seguire il primo (es. 2027-2028).";
  }
  if (esistenti.includes(v)) return `${v} esiste già.`;
  return null;
};

// Un colore è valido se è un nome CSS noto (gold, tomato...) o un esadecimale.
const validaColore = (v) => {
  if (!v)
    return "Il colore lo scegli tu: scrivi un nome CSS (es. gold) oppure un esadecimale (es. #ff0060).";
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return null;
  if (COLORI_CSS[v.toLowerCase()]) return null;
  return `"${v}" non è un colore valido: usa un nome CSS inglese (es. gold, tomato, teal) oppure un esadecimale (es. #ff0060).`;
};

// Chiede il colore SENZA suggerirne nessuno: lo scrivi tu nel terminale.
const chiediColore = async (domanda, usati = []) => {
  if (usati.length)
    console.log(grigio(`  Colori già usati: ${usati.join(", ")}`));
  for (;;) {
    let colore = await chiediValido(domanda, "", validaColore);
    if (COLORI_CSS[colore.toLowerCase()]) colore = colore.toLowerCase();
    const doppio = usati.some(
      (u) => String(u).toLowerCase() === colore.toLowerCase(),
    );
    if (
      !doppio ||
      (await chiediSiNo(
        `  ${colore} è già usato da un altro: lo vuoi usare lo stesso?`,
        false,
      ))
    )
      return colore;
  }
};

const coloreInRgb = (colore) => {
  let hex = colore.startsWith("#") ? colore : COLORI_CSS[colore.toLowerCase()];
  hex = hex.slice(1);
  if (hex.length <= 4) hex = [...hex].map((x) => x + x).join("");
  return [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16));
};

const normalizzaData = (v) => {
  const m = v.match(/^(\d{1,2})\s+([A-Za-zàèéìòù]+)$/);
  if (!m) return null;
  const giorno = parseInt(m[1], 10);
  const mese = MESI.find((x) => x.toLowerCase() === m[2].toLowerCase());
  if (!mese || giorno < 1 || giorno > 31) return null;
  return `${String(giorno).padStart(2, "0")} ${mese}`;
};

module.exports = {
  ordinaPeriodi,
  leggiJson,
  periodoSuccessivo,
  validaPeriodo,
  validaColore,
  chiediColore,
  coloreInRgb,
  normalizzaData,
};
