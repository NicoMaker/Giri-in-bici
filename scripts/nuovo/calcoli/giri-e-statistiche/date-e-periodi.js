"use strict";

// Giri e statistiche: date, periodo giusto, inserimento in ordine, km del mese e corse dell'anno.

const { MESI, STAGIONI } = require("../base/impostazioni");
const { leggiJson } = require("../base/utilita");
const { accoda, trovaBlocco } = require("../json/json-chirurgico");

// Accetta: "22 Novembre", "22 novembre 2026", "22/11", "22/11/2026", "2026-11-22".
// Ritorna { giorno, mese (0-11), anno } oppure un messaggio d'errore (stringa).
const leggiData = (testo, annoPredefinito) => {
  const t = String(testo || "").trim();
  let giorno, mese, anno;
  let m;
  if ((m = t.match(/^(\d{1,2})\s+([A-Za-zàèéìòù]+)(?:\s+(\d{4}))?$/))) {
    giorno = parseInt(m[1], 10);
    mese = MESI.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
    anno = m[3] ? parseInt(m[3], 10) : annoPredefinito;
    if (mese === -1) return `"${m[2]}" non è un mese italiano.`;
  } else if ((m = t.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{4}))?$/))) {
    giorno = parseInt(m[1], 10);
    mese = parseInt(m[2], 10) - 1;
    anno = m[3] ? parseInt(m[3], 10) : annoPredefinito;
  } else if ((m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) {
    anno = parseInt(m[1], 10);
    mese = parseInt(m[2], 10) - 1;
    giorno = parseInt(m[3], 10);
  } else {
    return "Scrivi la data come 22 Novembre, 22 Novembre 2026 oppure 22/11/2026.";
  }
  const d = new Date(anno, mese, giorno);
  if (
    d.getFullYear() !== anno ||
    d.getMonth() !== mese ||
    d.getDate() !== giorno
  ) {
    return `Il ${giorno} ${MESI[mese] || "?"} ${anno} non esiste.`;
  }
  return { giorno, mese, anno };
};

// Periodo (nome del file) in cui cade un giro di una certa stagione.
// Primavera/Estate: l'anno. Autunno-Inverno: da Settembre in poi è il primo anno
// del biennio (2026-2027), fino ad Agosto è il secondo (Gennaio 2027 -> 2026-2027).
const periodoDelGiro = (chiave, { mese, anno }) => {
  if (STAGIONI[chiave].formato === "anno") return String(anno);
  return mese >= 8 ? `${anno}-${anno + 1}` : `${anno - 1}-${anno}`;
};

// Anno "vero" (di calendario) di un giro già salvato in un periodo.
const annoDelGiroInPeriodo = (chiave, periodo, mese) => {
  if (STAGIONI[chiave].formato === "anno") return parseInt(periodo, 10);
  const [a, b] = periodo.split("-").map((x) => parseInt(x, 10));
  return mese >= 8 ? a : b;
};

// Posizione cronologica dentro il periodo (per tenere i giri in ordine di data).
const ordineNelPeriodo = (chiave, giorno, mese) => {
  const m =
    STAGIONI[chiave].formato === "biennio"
      ? mese >= 8
        ? mese - 8
        : mese + 4
      : mese;
  return m * 100 + giorno;
};

const leggiDataSalvata = (testo) => {
  const m = String(testo).match(/^(\d{1,2})\s+(\S+)/);
  if (!m) return null;
  const mese = MESI.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  return mese === -1 ? null : { giorno: parseInt(m[1], 10), mese };
};

// Trova gli oggetti { ... } di primo livello dentro l'array JSON (sapendo saltare le stringhe).
const oggettiDellArray = (testo) => {
  const inizioArray = testo.indexOf("[");
  if (inizioArray === -1)
    throw new Error("Il file dei giri non è un elenco [ ... ].");
  const out = [];
  let profondita = 0;
  let inStringa = false;
  let inizio = -1;
  for (let i = inizioArray + 1; i < testo.length; i++) {
    const ch = testo[i];
    if (inStringa) {
      if (ch === "\\") i++;
      else if (ch === '"') inStringa = false;
      continue;
    }
    if (ch === '"') inStringa = true;
    else if (ch === "{") {
      if (profondita === 0) inizio = i;
      profondita++;
    } else if (ch === "}") {
      profondita--;
      if (profondita === 0) out.push({ inizio, fine: i });
    } else if (ch === "]" && profondita === 0) break;
  }
  return { inizioArray, oggetti: out };
};
