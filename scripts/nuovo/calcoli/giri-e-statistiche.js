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
  if (d.getFullYear() !== anno || d.getMonth() !== mese || d.getDate() !== giorno) {
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
  const m = STAGIONI[chiave].formato === "biennio" ? (mese >= 8 ? mese - 8 : mese + 4) : mese;
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
  if (inizioArray === -1) throw new Error("Il file dei giri non è un elenco [ ... ].");
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

// Inserisce il giro nel testo del JSON del periodo, al posto giusto per data,
// senza toccare il resto del file. Ritorna { testo, posizione }.
const inserisciGiro = (testo, chiave, giro, giorno, mese) => {
  const { inizioArray, oggetti } = oggettiDellArray(testo);
  const blocco = JSON.stringify(giro, null, 2);
  if (!oggetti.length) {
    const dentro = blocco.split("\n").map((r) => `  ${r}`).join("\n");
    return { testo: `${testo.slice(0, inizioArray)}[\n${dentro}\n]${testo.slice(testo.indexOf("]", inizioArray) + 1)}`, posizione: 0 };
  }
  const nuovo = ordineNelPeriodo(chiave, giorno, mese);
  let indice = oggetti.length; // di default in fondo
  for (let i = 0; i < oggetti.length; i++) {
    const salvato = JSON.parse(testo.slice(oggetti[i].inizio, oggetti[i].fine + 1));
    const d = leggiDataSalvata(salvato.date);
    if (d && ordineNelPeriodo(chiave, d.giorno, d.mese) > nuovo) {
      indice = i;
      break;
    }
  }
  const rientroDi = (pos) => testo.slice(testo.lastIndexOf("\n", pos - 1) + 1, pos).match(/^[ \t]*/)[0];
  // rientro "normale" del file = quello più frequente (così un giro scritto a mano storto non fa scuola)
  const conteggio = {};
  oggetti.forEach((o) => {
    const r = rientroDi(o.inizio);
    conteggio[r] = (conteggio[r] || 0) + 1;
  });
  const rientro = Object.keys(conteggio).sort((a, b) => conteggio[b] - conteggio[a])[0];
  const corpo = blocco.split("\n").join(`\n${rientro}`);
  if (indice < oggetti.length) {
    // inserisco una riga intera prima del giro successivo: il suo rientro non cambia
    const p = oggetti[indice].inizio;
    const inizioRiga = testo.lastIndexOf("\n", p - 1) + 1;
    return { testo: `${testo.slice(0, inizioRiga)}${rientro}${corpo},\n${testo.slice(inizioRiga)}`, posizione: indice };
  }
  const ultimo = oggetti[oggetti.length - 1];
  return { testo: `${testo.slice(0, ultimo.fine + 1)},\n${rientro}${corpo}${testo.slice(ultimo.fine + 1)}`, posizione: oggetti.length };
};

// Km di un mese di un anno secondo i giri salvati (somma di tutte le stagioni).
const kmDaiGiri = (piano, anno, mese) => {
  let totale = 0;
  let numero = 0;
  for (const chiave of Object.keys(STAGIONI)) {
    const generale = leggiJson(piano, `json/${STAGIONI[chiave].cartella}/generale.json`);
    for (const [periodo, file] of Object.entries(generale.subPeriods)) {
      for (const giro of leggiJson(piano, file)) {
        const d = leggiDataSalvata(giro.date);
        if (d && d.mese === mese && annoDelGiroInPeriodo(chiave, periodo, d.mese) === anno) {
          totale += Number(giro.distance) || 0;
          numero++;
        }
      }
    }
  }
  return { km: totale, giri: numero };
};

// Aggiorna il JSON dell'anno: somma (o imposta) i km del mese — creandolo se non c'è —
// e aggiunge `corse` alle corse dell'anno. Cambia solo le righe necessarie.
const aggiornaAnno = (piano, anno, mese, km, { corse = 0, sostituisci = false } = {}) => {
  const file = `json/Statistiche/anni/${anno}.json`;
  if (!piano.esiste(file)) {
    throw new Error(`Non esiste ancora l'anno ${anno} (${file}). Crealo prima con: node scripts/nuovo.js → "Un nuovo ANNO di Statistiche".`);
  }
  let testo = piano.leggi(file);
  const dati = JSON.parse(testo);
  const nome = MESI[mese];
  const prima = Object.prototype.hasOwnProperty.call(dati.data, nome) ? Number(dati.data[nome]) : null;
  const dopo = sostituisci || prima === null ? km : prima + km;

  if (prima !== null) {
    const { inizio, fine } = trovaBlocco(testo, "data", "{", "}");
    const corpo = testo.slice(inizio, fine).replace(new RegExp(`("${nome}"\\s*:\\s*)-?\\d+(\\.\\d+)?`), `$1${dopo}`);
    testo = testo.slice(0, inizio) + corpo + testo.slice(fine);
  } else {
    // Mese nuovo: lo metto al suo posto nell'ordine del calendario.
    const successivo = Object.keys(dati.data)
      .map((k) => ({ k, i: MESI.indexOf(k) }))
      .filter((x) => x.i > mese)
      .sort((a, b) => a.i - b.i)[0];
    if (successivo) {
      const re = new RegExp(`"${successivo.k}"\\s*:`);
      const m = re.exec(testo);
      const rientro = testo.slice(testo.lastIndexOf("\n", m.index - 1) + 1, m.index);
      const sep = /^[ \t]*$/.test(rientro) && testo.lastIndexOf("\n", m.index - 1) !== -1 ? `\n${rientro}` : " ";
      testo = `${testo.slice(0, m.index)}"${nome}": ${dopo},${sep}${testo.slice(m.index)}`;
    } else {
      const { inizio, fine } = trovaBlocco(testo, "data", "{", "}");
      testo = accoda(testo, inizio, fine, `"${nome}": ${dopo}`);
    }
  }

  const corseDopo = Number(dati.numberOfRaces) + corse;
  if (corse) testo = testo.replace(/("numberOfRaces"\s*:\s*)\d+/, `$1${corseDopo}`);
  piano.modifica(file, testo);
  return { file, prima, dopo, creato: prima === null, corsePrima: Number(dati.numberOfRaces), corseDopo };
};

const controllaCoerenza = (piano, anno, mese, kmMeseAnno) => {
  const { km, giri } = kmDaiGiri(piano, anno, mese);
  if (km !== kmMeseAnno) {
    piano.avvisi.push(
      `${MESI[mese]} ${anno}: nelle statistiche ci sono ${kmMeseAnno} km, ma i giri salvati (${giri}) ne sommano ${km}. Può essere una differenza che c'era già: controlla.`,
    );
  }
};

module.exports = { leggiData, periodoDelGiro, annoDelGiroInPeriodo, ordineNelPeriodo, leggiDataSalvata, oggettiDellArray, inserisciGiro, kmDaiGiri, aggiornaAnno, controllaCoerenza };
