"use strict";

// MESE: aggiungere (o correggere) un mese in un anno gia esistente.
// CLI: node scripts/nuovo.js --mese --anno=2026 --mese=Novembre --km=120 [--corse=2] [--sostituisci] [--si]

const { MESI, PERCORSO_STORICO_JSON, opzione, flag } = require("../base/impostazioni");
const { chiediValido, grassetto, grigio, scegli } = require("../base/terminale");
const { leggiJson, ordinaPeriodi } = require("../base/utilita");
const { aggiornaAnno, controllaCoerenza } = require("../calcoli/giri-e-statistiche");

const raccogliMese = async (piano) => {
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const anni = Object.keys(storico.anni).sort(ordinaPeriodi);

  let anno = opzione("anno");
  if (anno === undefined) {
    anno = await chiediValido("Anno", anni[anni.length - 1], (v) =>
      anni.includes(v) ? null : `Anni disponibili: ${anni.join(", ")}.`,
    );
  } else if (!anni.includes(anno)) {
    throw new Error(`Anno ${anno} non esiste. Disponibili: ${anni.join(", ")}.`);
  }

  const dati = leggiJson(piano, `json/Statistiche/anni/${anno}.json`).data;
  console.log(
    grigio(`  Mesi già presenti nel ${anno}: ${Object.keys(dati).join(", ") || "nessuno"}`),
  );

  let nome = opzione("mese");
  if (nome === undefined) {
    nome = await chiediValido("Mese (es. Dicembre)", "", (v) =>
      MESI.some((m) => m.toLowerCase() === v.toLowerCase())
        ? null : "Scrivi un mese in italiano.",
    );
  }
  const mese = MESI.findIndex((m) => m.toLowerCase() === nome.toLowerCase());
  if (mese === -1) throw new Error(`"${nome}" non è un mese italiano.`);

  let sostituisci = flag("sostituisci");
  const esiste = Object.prototype.hasOwnProperty.call(dati, MESI[mese]);
  if (esiste && !sostituisci && opzione("km") !== undefined) {
    // se i km sono stati passati da CLI e il mese esiste: sommo (default) salvo --sostituisci
  } else if (esiste) {
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

  let kmTesto = opzione("km");
  if (kmTesto === undefined) {
    kmTesto = await chiediValido("Km", "", (v) =>
      /^\d+$/.test(v) ? null : "Solo numeri interi.",
    );
  }
  const km = parseInt(kmTesto, 10);
  if (!Number.isInteger(km)) throw new Error("--km deve essere un numero intero.");

  let corseTesto = opzione("corse");
  if (corseTesto === undefined) {
    corseTesto = await chiediValido(
      "Corse da aggiungere al totale dell'anno (0 = non cambiare)",
      "0",
      (v) => (/^\d+$/.test(v) ? null : "Solo numeri interi."),
    );
  }
  const corse = parseInt(corseTesto, 10);

  return { anno: parseInt(anno, 10), mese, km, corse, sostituisci };
};

const applicaMese = (piano, d) => {
  const ris = aggiornaAnno(piano, d.anno, d.mese, d.km, {
    corse: d.corse,
    sostituisci: d.sostituisci,
  });
  piano.note.push(
    grassetto(`${MESI[d.mese]} ${d.anno}`),
    ris.creato ? `• mese nuovo con ${ris.dopo} km` : `• ${ris.prima} → ${ris.dopo} km`,
    ...(d.corse ? [`• corse dell'anno ${ris.corsePrima} → ${ris.corseDopo}`] : []),
  );
  controllaCoerenza(piano, d.anno, d.mese, ris.dopo);
};

module.exports = { raccogliMese, applicaMese };