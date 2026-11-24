"use strict";

// MESE: aggiungere (o correggere) un mese in un anno gia esistente.

const { MESI, PERCORSO_STORICO_JSON } = require("../base/impostazioni");
const { leggiJson, ordinaPeriodi } = require("../base/utilita");
const {
  aggiornaAnno,
  controllaCoerenza,
} = require("../calcoli/giri-e-statistiche");

const applicaMese = (piano, d) => {
  const ris = aggiornaAnno(piano, d.anno, d.mese, d.km, {
    corse: d.corse,
    sostituisci: d.sostituisci,
  });
  piano.note.push(
    `${MESI[d.mese]} ${d.anno}`,
    ris.creato
      ? `• mese nuovo con ${ris.dopo} km`
      : `• ${ris.prima} → ${ris.dopo} km`,
    ...(d.corse
      ? [`• corse dell'anno ${ris.corsePrima} → ${ris.corseDopo}`]
      : []),
  );
  controllaCoerenza(piano, d.anno, d.mese, ris.dopo);
};

module.exports = { applicaMese };
