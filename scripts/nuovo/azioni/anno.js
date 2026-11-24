"use strict";

// Nuovo ANNO di Statistiche (con icona/favicon).

const fs = require("fs");
const { MESI, PERCORSO_STORICO_JSON } = require("../base/impostazioni");
const {
  leggiJson,
  ordinaPeriodi,
  validaPeriodo,
} = require("../base/utilita");
const { cartellaImg } = require("../immagini/foto");
const { creaIconaAnno } = require("../immagini/icona-anno");
const { aggiungiAArray, aggiungiAOggetto } = require("../json/json-chirurgico");

const applicaAnno = (piano, d) => {
  // 1. HTML
  const modello = `Statistiche/Anni/${d.ultimo}.html`;
  const html = piano.leggi(modello);
  if (!html.includes(d.ultimo))
    throw new Error(`Nel modello ${modello} non compare "${d.ultimo}".`);
  let nuovoHtml = html.split(d.ultimo).join(d.anno);
  if (nuovoHtml.includes(d.ultimo))
    throw new Error(`Nel nuovo HTML è rimasto "${d.ultimo}".`);

  // Icona (favicon) dell'anno: il link nella pagina deve puntare a un file che esiste davvero.
  const img = cartellaImg();
  const linkIcona = new RegExp(
    `(<link\\s+rel="icon"\\s+href="/img/Statistiche/Anni/${d.anno})\\.[a-z]+(")`,
    "i",
  );
  if (!linkIcona.test(nuovoHtml))
    throw new Error(
      `Nel modello ${modello} non trovo il link dell'icona dell'anno.`,
    );
  if (d.icona) {
    piano.creaBinario(
      `${img}/Statistiche/Anni/${d.anno}.jpg`,
      fs.readFileSync(d.icona),
    );
    nuovoHtml = nuovoHtml.replace(linkIcona, "$1.jpg$2");
  } else {
    piano.creaBinario(
      `${img}/Statistiche/Anni/${d.anno}.png`,
      creaIconaAnno(d.anno, d.colore),
    );
    nuovoHtml = nuovoHtml.replace(linkIcona, "$1.png$2");
    piano.promemoria.push(
      `Icona del ${d.anno} creata in ${img}/Statistiche/Anni/${d.anno}.png (l'anno scritto sul colore ${d.colore}). Se preferisci una tua foto: salvala come ${d.anno}.jpg nella stessa cartella e nella pagina Statistiche/Anni/${d.anno}.html cambia ".png" in ".jpg" nel link rel="icon".`,
    );
  }
  piano.crea(`Statistiche/Anni/${d.anno}.html`, nuovoHtml);
  if (d.esempio) piano.esempio = true;

  // 2. JSON dell'anno (la nota sui colori si copia dall'ultimo anno, così resta uguale)
  const modelloJson = leggiJson(
    piano,
    `json/Statistiche/anni/${d.ultimo}.json`,
  );
  const nuovoJson = {
    year: d.anno,
    numberOfRaces: d.corse,
    data: { [d.mese]: d.km },
  };
  if (modelloJson._notaColori) nuovoJson._notaColori = modelloJson._notaColori;
  piano.crea(
    `json/Statistiche/anni/${d.anno}.json`,
    JSON.stringify(nuovoJson, null, 2) + "\n",
  );

  // 3. Storico.json: anni + coloriAnni (coloriMesi non si tocca)
  let storico = piano.leggi(PERCORSO_STORICO_JSON);
  storico = aggiungiAOggetto(
    storico,
    "anni",
    d.anno,
    `json/Statistiche/anni/${d.anno}.json`,
  );
  storico = aggiungiAArray(storico, "coloriAnni", d.colore);
  piano.modifica(PERCORSO_STORICO_JSON, storico);
};

module.exports = { applicaAnno };
