"use strict";

// Nuovo GIRO: "il giorno X ho fatto un giro di N km".

const { MESI, SI, STAGIONI, opzione } = require("../base/impostazioni");
const { chiediValido, grassetto, scegli } = require("../base/terminale");
const { leggiJson } = require("../base/utilita");
const { aggiornaAnno, controllaCoerenza, inserisciGiro, leggiData, periodoDelGiro } = require("../calcoli/giri-e-statistiche");

const ALIAS_STAGIONI = {
  primavera: "Primavera",
  estate: "Estate",
  autunno: "Autunno_Inverno",
  inverno: "Autunno_Inverno",
  autunno_inverno: "Autunno_Inverno",
  "autunno-inverno": "Autunno_Inverno",
  "autunno - inverno": "Autunno_Inverno",
  "autunno inverno": "Autunno_Inverno",
};

// Mesi (0 = Gennaio) in cui di solito cadono i giri di ogni stagione: fuori da qui avviso.
const MESI_USUALI = {
  Primavera: [2, 3, 4, 5],
  Estate: [4, 5, 6, 7, 8, 9],
  Autunno_Inverno: [9, 10, 11, 0, 1, 2, 3],
};

const trovaStagione = (testo) => ALIAS_STAGIONI[String(testo || "").trim().toLowerCase().replace(/[_·]/g, "-")] || null;

const raccogliGiro = async (piano) => {
  const oggi = new Date();
  const annoOggi = oggi.getFullYear();

  let chiave = opzione("stagione") !== undefined ? trovaStagione(opzione("stagione")) : null;
  if (opzione("stagione") !== undefined && !chiave) {
    throw new Error(`Stagione "${opzione("stagione")}" non riconosciuta (usa Primavera, Estate o Autunno_Inverno).`);
  }
  if (!chiave) {
    chiave = (
      await scegli(
        "In quale stagione è il giro?",
        Object.entries(STAGIONI).map(([k, v]) => ({ chiave: k, testo: v.etichetta })),
      )
    ).chiave;
  }
  const s = STAGIONI[chiave];

  const sceltaData = async () => {
    const dataOpt = opzione("data");
    if (dataOpt !== undefined) {
      const r = leggiData(dataOpt, annoOggi);
      if (typeof r === "string") throw new Error(r);
      return r;
    }
    const oggiTesto = `${oggi.getDate()} ${MESI[oggi.getMonth()]} ${annoOggi}`;
    const r = await chiediValido("Data del giro (es. 22 Novembre 2026)", oggiTesto, (v) => {
      const x = leggiData(v, annoOggi);
      return typeof x === "string" ? x : null;
    });
    return leggiData(r, annoOggi);
  };
  const data = await sceltaData();

  const luogo =
    opzione("luogo") ?? (await chiediValido("Luogo (come comparirà nella tabella)", "", (v) => (v ? null : "Il luogo è obbligatorio.")));
  if (!luogo.trim()) throw new Error("Il luogo è obbligatorio.");

  const validaLink = (v) => (!v ? null : /^https?:\/\/[^\s"<>]+$/i.test(v) ? null : "Il link deve iniziare con http:// o https:// e non avere spazi.");
  let link = opzione("link");
  if (link === undefined && SI) link = ""; // con --si non faccio domande
  if (link === undefined) link = await chiediValido("Link al percorso (Komoot, invio per non metterlo)", "", validaLink);
  const erroreLink = validaLink(link);
  if (erroreLink) throw new Error(erroreLink);

  const validaKm = (v) => (/^\d+$/.test(String(v)) && Number(v) > 0 ? null : "Scrivi i km come numero intero maggiore di 0 (es. 95).");
  let kmTesto = opzione("km");
  if (kmTesto === undefined) kmTesto = await chiediValido("Distanza in km", "", validaKm);
  const erroreKm = validaKm(kmTesto);
  if (erroreKm) throw new Error(erroreKm);

  return { chiave, s, data, luogo: luogo.trim(), link: link.trim(), km: parseInt(kmTesto, 10) };
};

const applicaGiro = async (piano, d) => {
  const { chiave, s, data, luogo, link, km } = d;
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
    piano.avvisi.push(`${MESI[data.mese]} è insolito per ${s.testo}: controlla di aver scelto la stagione giusta.`);
  }
  if (new Date(data.anno, data.mese, data.giorno) > new Date()) {
    piano.avvisi.push(`La data ${nomeData} ${data.anno} è nel futuro.`);
  }
  const giriEsistenti = leggiJson(piano, fileGiri);
  const doppio = giriEsistenti.find((g) => g.date === nomeData && Number(g.distance) === km);
  if (doppio) {
    piano.avvisi.push(`Nel periodo c'è già un giro del ${nomeData} di ${km} km: se è lo stesso, non confermare.`);
  }

  // 1. il giro nel file del periodo, in ordine di data
  const place = link ? `<a href="${link}" target="_blank">${luogo}</a>` : luogo;
  const giro = { date: nomeData, place, distance: km };
  const { testo, posizione } = inserisciGiro(piano.leggi(fileGiri), chiave, giro, data.giorno, data.mese);
  piano.modifica(fileGiri, testo);

  // 2 + 3. km nel mese giusto dell'anno giusto e una corsa in più
  const ris = aggiornaAnno(piano, data.anno, data.mese, km, { corse: 1 });
  controllaCoerenza(piano, data.anno, data.mese, ris.dopo);

  piano.note.push(
    grassetto(`Il giorno ${nomeData} ${data.anno} (${s.testo} ${periodo}) hai fatto un giro di ${km} km${link ? " con il link al percorso" : ""}: ${luogo}`),
    `• ${fileGiri}: aggiunto in posizione ${posizione + 1} di ${giriEsistenti.length + 1} (in ordine di data)`,
    ris.creato
      ? `• ${ris.file}: ${MESI[data.mese]} non c'era, lo creo con ${km} km`
      : `• ${ris.file}: ${MESI[data.mese]} ${ris.prima} → ${ris.dopo} km (+${km})`,
    `• ${ris.file}: corse dell'anno ${ris.corsePrima} → ${ris.corseDopo} (+1)`,
  );
};

module.exports = { ALIAS_STAGIONI, MESI_USUALI, trovaStagione, raccogliGiro, applicaGiro };
