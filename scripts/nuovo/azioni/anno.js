"use strict";

// Nuovo ANNO di Statistiche (con icona/favicon).

const fs = require("fs");
const { MESI, PERCORSO_STORICO_JSON } = require("../base/impostazioni");
const { chiedi, chiediSiNo, chiediValido, giallo, grassetto, grigio, rosso } = require("../base/terminale");
const { chiediColore, leggiJson, ordinaPeriodi, validaPeriodo } = require("../base/utilita");
const { cartellaImg, pulisciPercorso } = require("../immagini/foto");
const { creaIconaAnno } = require("../immagini/icona-anno");
const { aggiungiAArray, aggiungiAOggetto } = require("../json/json-chirurgico");

const raccogliAnno = async (piano, opzioni = {}) => {
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const esistenti = Object.keys(storico.anni).sort(ordinaPeriodi);
  const ultimo = esistenti[esistenti.length - 1];

  console.log(`\n${grassetto("Statistiche 📅")} ${grigio(`(ultimo anno presente: ${ultimo})`)}`);

  const anno =
    opzioni.anno ||
    (await chiediValido("Nuovo anno", String(parseInt(ultimo, 10) + 1), validaPeriodo("anno", esistenti)));
  if (opzioni.anno) {
    const errore = validaPeriodo("anno", esistenti)(anno);
    if (errore) throw new Error(`Statistiche: ${errore}`);
  }

  if ((storico.coloriAnni || []).length !== esistenti.length) {
    console.log(
      giallo(
        `  ⚠ In ${PERCORSO_STORICO_JSON} i colori (${(storico.coloriAnni || []).length}) non sono tanti quanti gli anni (${esistenti.length}): controlla l'ordine dopo la creazione.`,
      ),
    );
  }
  const colore = await chiediColore(
    `Colore dell'anno ${anno}: scrivilo tu (nome CSS, es. gold, oppure #esadecimale)`,
    storico.coloriAnni || [],
  );

  // Icona (favicon) dell'anno: la tua immagine .jpg, oppure la creo io con l'anno sul colore scelto.
  let icona = null;
  let percorsoIcona = await chiedi(
    `Immagine .jpg per l'icona del ${anno} — trascinala qui, oppure invio e la creo io con il colore dell'anno`,
    "",
  );
  while (percorsoIcona) {
    const file = pulisciPercorso(percorsoIcona);
    if (fs.existsSync(file) && fs.statSync(file).isFile() && /\.jpe?g$/i.test(file)) {
      icona = file;
      break;
    }
    console.log(rosso("  ✖ Serve un file .jpg esistente."));
    percorsoIcona = await chiedi("Prova con un altro file (invio = la creo io)", "");
  }

  let mese = "Gennaio";
  let km = 0;
  let corse = 0;
  let esempio = true;
  if (await chiediSiNo("Vuoi inserire subito il primo mese? (altrimenti metto Gennaio a 0 km da sostituire)", false)) {
    mese = await chiediValido("Mese (es. Gennaio)", "Gennaio", (v) =>
      MESI.some((m) => m.toLowerCase() === v.toLowerCase()) ? null : "Scrivi un mese in italiano.",
    );
    mese = MESI.find((m) => m.toLowerCase() === mese.toLowerCase());
    km = parseInt(await chiediValido("Km del mese", "0", (v) => (/^\d+$/.test(v) ? null : "Solo numeri interi.")), 10);
    corse = parseInt(
      await chiediValido("Numero di corse dell'anno finora", "0", (v) => (/^\d+$/.test(v) ? null : "Solo numeri interi.")),
      10,
    );
    esempio = false;
  }

  return { anno, colore, icona, mese, km, corse, esempio, ultimo };
};

const applicaAnno = (piano, d) => {
  // 1. HTML
  const modello = `Statistiche/Anni/${d.ultimo}.html`;
  const html = piano.leggi(modello);
  if (!html.includes(d.ultimo)) throw new Error(`Nel modello ${modello} non compare "${d.ultimo}".`);
  let nuovoHtml = html.split(d.ultimo).join(d.anno);
  if (nuovoHtml.includes(d.ultimo)) throw new Error(`Nel nuovo HTML è rimasto "${d.ultimo}".`);

  // Icona (favicon) dell'anno: il link nella pagina deve puntare a un file che esiste davvero.
  const img = cartellaImg();
  const linkIcona = new RegExp(`(<link\\s+rel="icon"\\s+href="/img/Statistiche/Anni/${d.anno})\\.[a-z]+(")`, "i");
  if (!linkIcona.test(nuovoHtml)) throw new Error(`Nel modello ${modello} non trovo il link dell'icona dell'anno.`);
  if (d.icona) {
    piano.creaBinario(`${img}/Statistiche/Anni/${d.anno}.jpg`, fs.readFileSync(d.icona));
    nuovoHtml = nuovoHtml.replace(linkIcona, "$1.jpg$2");
  } else {
    piano.creaBinario(`${img}/Statistiche/Anni/${d.anno}.png`, creaIconaAnno(d.anno, d.colore));
    nuovoHtml = nuovoHtml.replace(linkIcona, "$1.png$2");
    piano.promemoria.push(
      `Icona del ${d.anno} creata in ${img}/Statistiche/Anni/${d.anno}.png (l'anno scritto sul colore ${d.colore}). Se preferisci una tua foto: salvala come ${d.anno}.jpg nella stessa cartella e nella pagina Statistiche/Anni/${d.anno}.html cambia ".png" in ".jpg" nel link rel="icon".`,
    );
  }
  piano.crea(`Statistiche/Anni/${d.anno}.html`, nuovoHtml);
  if (d.esempio) piano.esempio = true;

  // 2. JSON dell'anno (la nota sui colori si copia dall'ultimo anno, così resta uguale)
  const modelloJson = leggiJson(piano, `json/Statistiche/anni/${d.ultimo}.json`);
  const nuovoJson = {
    year: d.anno,
    numberOfRaces: d.corse,
    data: { [d.mese]: d.km },
  };
  if (modelloJson._notaColori) nuovoJson._notaColori = modelloJson._notaColori;
  piano.crea(`json/Statistiche/anni/${d.anno}.json`, JSON.stringify(nuovoJson, null, 2) + "\n");

  // 3. Storico.json: anni + coloriAnni (coloriMesi non si tocca)
  let storico = piano.leggi(PERCORSO_STORICO_JSON);
  storico = aggiungiAOggetto(storico, "anni", d.anno, `json/Statistiche/anni/${d.anno}.json`);
  storico = aggiungiAArray(storico, "coloriAnni", d.colore);
  piano.modifica(PERCORSO_STORICO_JSON, storico);

};

module.exports = { raccogliAnno, applicaAnno };
