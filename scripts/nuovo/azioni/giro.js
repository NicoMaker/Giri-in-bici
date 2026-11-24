"use strict";

// Nuovo GIRO: "il giorno X ho fatto un giro di N km".

const { MESI } = require("../base/impostazioni");
const { bandiereMancanti, costruisciPlace } = require("../base/luogo");
const { leggiJson } = require("../base/utilita");
const {
  aggiornaAnno,
  controllaCoerenza,
  inserisciGiro,
  leggiData,
  periodoDelGiro,
} = require("../calcoli/giri-e-statistiche");

// Mesi (0 = Gennaio) in cui di solito cadono i giri di ogni stagione: fuori da qui avviso.
const MESI_USUALI = {
  Primavera: [2, 3, 4, 5],
  Estate: [4, 5, 6, 7, 8, 9],
  Autunno_Inverno: [9, 10, 11, 0, 1, 2, 3],
};

const applicaGiro = async (piano, d) => {
  const { chiave, s, data, luogo, links = [], km } = d;
  const periodo = periodoDelGiro(chiave, data);
  const fileGiri = `json/${s.cartella}/Periodi/${periodo}.json`;
  if (!piano.esiste(fileGiri)) {
    throw new Error(
      `Non esiste ancora il periodo ${s.testo} ${periodo} (${fileGiri}). Crealo prima con: node scripts/nuovo.js → "Una nuova STAGIONE".`,
    );
  }
  const nomeData = `${String(data.giorno).padStart(2, "0")} ${MESI[data.mese]}`;

  // avvisi (non bloccanti, ma l'utente li vede prima di confermare)
  if (!MESI_USUALI[chiave].includes(data.mese)) {
    piano.avvisi.push(
      `${MESI[data.mese]} è insolito per ${s.testo}: controlla di aver scelto la stagione giusta.`,
    );
  }
  if (new Date(data.anno, data.mese, data.giorno) > new Date()) {
    piano.avvisi.push(`La data ${nomeData} ${data.anno} è nel futuro.`);
  }
  const giriEsistenti = leggiJson(piano, fileGiri);
  const doppio = giriEsistenti.find(
    (g) => g.date === nomeData && Number(g.distance) === km,
  );
  if (doppio) {
    piano.avvisi.push(
      `Nel periodo c'è già un giro del ${nomeData} di ${km} km: se è lo stesso, non confermare.`,
    );
  }

  // 1. il giro nel file del periodo, in ordine di data
  const place = costruisciPlace({ luogo, links });
  for (const f of bandiereMancanti(luogo)) piano.crea(f.rel, f.testo); // crea l'immagine mancante in Img/Icons
  const giro = { date: nomeData, place, distance: km };
  const { testo, posizione } = inserisciGiro(
    piano.leggi(fileGiri),
    chiave,
    giro,
    data.giorno,
    data.mese,
  );
  piano.modifica(fileGiri, testo);

  // 2 + 3. km nel mese giusto dell'anno giusto e una corsa in più
  const ris = aggiornaAnno(piano, data.anno, data.mese, km, { corse: 1 });
  controllaCoerenza(piano, data.anno, data.mese, ris.dopo);

  piano.note.push(
    `Il giorno ${nomeData} ${data.anno} (${s.testo} ${periodo}) hai fatto un giro di ${km} km${links.length ? ` con ${links.length === 1 ? "il link" : links.length + " link"} al percorso` : ""}: ${luogo.replace(/\s*\{[A-Z]{2}\}/g, "").trim()}`,
    `• ${fileGiri}: aggiunto in posizione ${posizione + 1} di ${giriEsistenti.length + 1} (in ordine di data)`,
    ris.creato
      ? `• ${ris.file}: ${MESI[data.mese]} non c'era, lo creo con ${km} km`
      : `• ${ris.file}: ${MESI[data.mese]} ${ris.prima} → ${ris.dopo} km (+${km})`,
    `• ${ris.file}: corse dell'anno ${ris.corsePrima} → ${ris.corseDopo} (+1)`,
  );
};

module.exports = { MESI_USUALI, applicaGiro };
