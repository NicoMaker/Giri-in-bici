"use strict";

// Nuova STAGIONE (Primavera / Estate / Autunno-Inverno).

const fs = require("fs");
const {
  MESI,
  PERCORSO_STAGIONI_JSON,
  STAGIONI,
} = require("../base/impostazioni");
const {
  leggiJson,
  normalizzaData,
  ordinaPeriodi,
  periodoSuccessivo,
  validaPeriodo,
} = require("../base/utilita");
const {
  aggiornaAnno,
  annoDelGiroInPeriodo,
  controllaCoerenza,
  leggiDataSalvata,
} = require("../calcoli/giri-e-statistiche");
const { cartellaImg, elencaFoto } = require("../immagini/foto");
const { aggiungiAArray, aggiungiAOggetto } = require("../json/json-chirurgico");

const costruisciGalleria = (html, vecchio, s, periodo, nFoto) => {
  const gal = html.match(/(<div class="gallery">)([\s\S]*?)(<\/div>)/);
  if (!gal)
    throw new Error('Nel modello HTML non trovo <div class="gallery">.');
  const rientroDiv = html.slice(
    html.lastIndexOf("\n", gal.index) + 1,
    gal.index,
  );
  const rientroFigli = `${rientroDiv}  `;

  let nuovo;
  if (nFoto === 0) {
    nuovo = `\n${rientroFigli}<!-- Foto: aggiungi qui un blocco <a class="shot"> per ogni foto (vedi gli altri periodi).\n${rientroFigli}     Le immagini vanno in /img/${s.cartella}/${periodo}/1.jpg, 2.jpg, ... -->\n${rientroDiv}`;
  } else {
    const modello = gal[2].match(/<a\s+class="shot"[\s\S]*?<\/a>/);
    if (!modello)
      throw new Error('Nel modello HTML non trovo il blocco <a class="shot">.');
    const blocco = modello[0].split(vecchio).join(periodo);
    const rientroBlocco = gal[2].match(/\n([ \t]*)<a\s+class="shot"/)[1];
    const copie = [];
    for (let i = 1; i <= nFoto; i++) {
      copie.push(
        `${rientroBlocco}${blocco.replace(/\/1\.jpg/g, `/${i}.jpg`).replace(/numero 1\b/g, `numero ${i}`)}`,
      );
    }
    nuovo = `\n${copie.join("\n")}\n${rientroDiv}`;
  }
  return (
    html.slice(0, gal.index) +
    gal[1] +
    nuovo +
    gal[3] +
    html.slice(gal.index + gal[0].length)
  );
};

// Il primo giro inserito insieme alla nuova stagione va contato anche nelle statistiche
// dell'anno (km del mese + 1 corsa), come per ogni altro giro.
const contaGiroInStatistiche = (piano, chiave, periodo, giro) => {
  const data = leggiDataSalvata(giro.date);
  const anno = annoDelGiroInPeriodo(chiave, periodo, data.mese);
  const file = `json/Statistiche/anni/${anno}.json`;
  if (!piano.esiste(file) || piano.creati.has(file)) {
    piano.avvisi.push(
      `Il giro del ${giro.date} (${giro.distance} km) NON è ancora nelle statistiche del ${anno}${piano.creati.has(file) ? " (anno appena creato: scrivi tu i km del mese)" : " (l'anno non esiste)"}. Dopo averlo creato usa "Aggiungere un MESE".`,
    );
    return;
  }
  const ris = aggiornaAnno(piano, anno, data.mese, giro.distance, { corse: 1 });
  controllaCoerenza(piano, anno, data.mese, ris.dopo);
  piano.note.push(
    `• ${file}: ${MESI[data.mese]} ${ris.creato ? `creato con ${ris.dopo}` : `${ris.prima} → ${ris.dopo}`} km, corse ${ris.corsePrima} → ${ris.corseDopo} (per il primo giro inserito)`,
  );
};

const applicaStagione = (piano, d) => {
  const s = STAGIONI[d.chiave];
  const modello = `${s.cartella}/${d.ultimo}.html`;
  const html = piano.leggi(modello);
  if (!html.includes(d.ultimo))
    throw new Error(`Nel modello ${modello} non compare "${d.ultimo}".`);

  // 1. HTML: copia dell'ultimo periodo con il nuovo periodo, galleria svuotata
  let nuovoHtml = html.split(d.ultimo).join(d.periodo);
  nuovoHtml = costruisciGalleria(nuovoHtml, d.periodo, s, d.periodo, d.nFoto);
  // la galleria è già stata portata al nuovo periodo: il vecchio non deve restare da nessuna parte
  if (nuovoHtml.includes(d.ultimo))
    throw new Error(`Nel nuovo HTML è rimasto "${d.ultimo}".`);
  piano.crea(`${s.cartella}/${d.periodo}.html`, nuovoHtml);

  // 2. JSON del periodo: un solo giro con le caratteristiche giuste
  if (!d.giro) piano.esempio = true;
  const giro = d.giro || {
    date: `01 ${s.meseIniziale}`,
    place:
      '<a href="https://www.komoot.com/it-it" target="_blank">Nome del luogo</a>',
    distance: 0,
  };
  piano.crea(
    `json/${s.cartella}/Periodi/${d.periodo}.json`,
    JSON.stringify([giro], null, 2) + "\n",
  );

  // 3. generale.json: subPeriods + colors
  const fileGenerale = `json/${s.cartella}/generale.json`;
  let generale = piano.leggi(fileGenerale);
  generale = aggiungiAOggetto(
    generale,
    "subPeriods",
    d.periodo,
    `json/${s.cartella}/Periodi/${d.periodo}.json`,
  );
  generale = aggiungiAArray(generale, "colors", d.colore);
  piano.modifica(fileGenerale, generale);

  // 4. stagioni.json: solo il blocco della stagione giusta
  let stagioni = piano.leggi(PERCORSO_STAGIONI_JSON);
  const punto = stagioni.search(new RegExp(`"name"\\s*:\\s*"${s.cartella}"`));
  if (punto === -1)
    throw new Error(
      `Stagione "${s.cartella}" non trovata in ${PERCORSO_STAGIONI_JSON}.`,
    );
  stagioni = aggiungiAOggetto(
    stagioni,
    "subPeriods",
    d.periodo,
    `json/${s.cartella}/Periodi/${d.periodo}.json`,
    punto,
  );
  piano.modifica(PERCORSO_STAGIONI_JSON, stagioni);

  // 4b. il primo giro inserito conta anche nelle statistiche dell'anno (dopo aver registrato il periodo)
  if (d.giro) contaGiroInStatistiche(piano, d.chiave, d.periodo, d.giro);
  // 5. foto: copiate come 1.jpg, 2.jpg... (così i blocchi della galleria puntano a file veri)
  if (d.fotoDaCopiare && d.fotoDaCopiare.length) {
    const img = cartellaImg();
    d.fotoDaCopiare.forEach((origine, i) => {
      piano.creaBinario(
        `${img}/${s.cartella}/${d.periodo}/${i + 1}.jpg`,
        fs.readFileSync(origine),
      );
    });
  } else if (d.nFoto > 0) {
    piano.cartella(`${cartellaImg()}/${s.cartella}/${d.periodo}`);
    piano.promemoria.push(
      `Aggiungi le ${d.nFoto} foto in ${cartellaImg()}/${s.cartella}/${d.periodo}/ (1.jpg … ${d.nFoto}.jpg)`,
    );
  } else {
    piano.promemoria.push(
      `Quando hai le foto: ${cartellaImg()}/${s.cartella}/${d.periodo}/1.jpg, 2.jpg… e un blocco <a class="shot"> per ognuna nella pagina ${s.cartella}/${d.periodo}.html`,
    );
  }
};
