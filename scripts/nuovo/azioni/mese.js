"use strict";

// MESE: aggiungere (o correggere) un mese in un anno gia esistente.

const { MESI, PERCORSO_STORICO_JSON } = require("../base/impostazioni");
const {
  chiediValido,
  grassetto,
  grigio,
  scegli,
} = require("../base/terminale");
const { leggiJson, ordinaPeriodi } = require("../base/utilita");
const {
  aggiornaAnno,
  controllaCoerenza,
} = require("../calcoli/giri-e-statistiche");

const raccogliMese = async (piano) => {
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const anni = Object.keys(storico.anni).sort(ordinaPeriodi);
  const anno = await chiediValido("Anno", anni[anni.length - 1], (v) =>
    anni.includes(v) ? null : `Anni disponibili: ${anni.join(", ")}.`,
  );
  const dati = leggiJson(piano, `json/Statistiche/anni/${anno}.json`).data;
  console.log(
    grigio(
      `  Mesi già presenti nel ${anno}: ${Object.keys(dati).join(", ") || "nessuno"}`,
    ),
  );
  const nome = await chiediValido("Mese (es. Dicembre)", "", (v) =>
    MESI.some((m) => m.toLowerCase() === v.toLowerCase())
      ? null
      : "Scrivi un mese in italiano.",
  );
  const mese = MESI.findIndex((m) => m.toLowerCase() === nome.toLowerCase());

  let sostituisci = false;
  if (Object.prototype.hasOwnProperty.call(dati, MESI[mese])) {
    const modo = await scegli(
      `${MESI[mese]} ${anno} c'è già (${dati[MESI[mese]]} km). Cosa faccio?`,
      [
        { tasto: 1, testo: "Sommo i km a quelli che ci sono" },
        { tasto: 2, testo: "Sostituisco i km con il nuovo valore" },
      ],
    );
    sostituisci = modo.tasto === 2;
  } else {
    console.log(grigio(`  ${MESI[mese]} non c'è ancora: lo creo.`));
  }
  const km = parseInt(
    await chiediValido("Km", "", (v) =>
      /^\d+$/.test(v) ? null : "Solo numeri interi.",
    ),
    10,
  );
  const corse = parseInt(
    await chiediValido(
      "Corse da aggiungere al totale dell'anno (0 = non cambiare)",
      "0",
      (v) => (/^\d+$/.test(v) ? null : "Solo numeri interi."),
    ),
    10,
  );
  return { anno: parseInt(anno, 10), mese, km, corse, sostituisci };
};

const applicaMese = (piano, d) => {
  const ris = aggiornaAnno(piano, d.anno, d.mese, d.km, {
    corse: d.corse,
    sostituisci: d.sostituisci,
  });
  piano.note.push(
    grassetto(`${MESI[d.mese]} ${d.anno}`),
    ris.creato
      ? `• mese nuovo con ${ris.dopo} km`
      : `• ${ris.prima} → ${ris.dopo} km`,
    ...(d.corse
      ? [`• corse dell'anno ${ris.corsePrima} → ${ris.corseDopo}`]
      : []),
  );
  controllaCoerenza(piano, d.anno, d.mese, ris.dopo);
};

module.exports = { raccogliMese, applicaMese };
