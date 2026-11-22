"use strict";

// Modifica "chirurgica" dei JSON: si aggiunge solo la riga nuova, senza riformattare il resto.

// Cerca  "chiave": <apertura>  a partire da `da` e trova la chiusura.
const trovaBlocco = (testo, chiave, apertura, chiusura, da = 0) => {
  const re = new RegExp(`"${chiave}"\\s*:\\s*\\${apertura}`, "g");
  re.lastIndex = da;
  const m = re.exec(testo);
  if (!m) throw new Error(`Chiave "${chiave}" non trovata.`);
  const inizio = m.index + m[0].length;
  const fine = testo.indexOf(chiusura, inizio);
  if (fine === -1) throw new Error(`Chiusura di "${chiave}" non trovata.`);
  return { inizio, fine, posizione: m.index };
};

const accoda = (testo, inizio, fine, voce) => {
  const corpo = testo.slice(inizio, fine);
  const contenuto = corpo.replace(/\s+$/, "");
  const coda = corpo.slice(contenuto.length);
  const multiriga = corpo.includes("\n");
  let separatore = " "; // array su una sola riga: la virgola è già aggiunta sotto
  if (multiriga) {
    const ultima = contenuto.slice(contenuto.lastIndexOf("\n") + 1);
    separatore = `\n${ultima.match(/^[ \t]*/)[0]}`;
  }
  return (
    testo.slice(0, inizio) +
    contenuto +
    "," +
    separatore +
    voce +
    coda +
    testo.slice(fine)
  );
};

const aggiungiAOggetto = (testo, chiave, k, v, da = 0) => {
  const { inizio, fine } = trovaBlocco(testo, chiave, "{", "}", da);
  return accoda(
    testo,
    inizio,
    fine,
    `${JSON.stringify(k)}: ${JSON.stringify(v)}`,
  );
};

const aggiungiAArray = (testo, chiave, valore, da = 0) => {
  const { inizio, fine } = trovaBlocco(testo, chiave, "[", "]", da);
  return accoda(testo, inizio, fine, JSON.stringify(valore));
};

module.exports = { trovaBlocco, accoda, aggiungiAOggetto, aggiungiAArray };
