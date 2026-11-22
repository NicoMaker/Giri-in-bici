"use strict";

// API del server web: legge lo stato, riceve i file e costruisce il Piano per ogni caso.
// Usa le stesse funzioni "applica" del terminale: cambia solo il modo di raccogliere i dati.

const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  COLORI_CSS,
  MESI,
  PERCORSO_STORICO_JSON,
  PROVA,
  RADICE,
  STAGIONI,
} = require("../base/impostazioni");
const { Piano } = require("../base/piano");
const {
  leggiJson,
  normalizzaData,
  ordinaPeriodi,
  periodoSuccessivo,
  validaColore,
  validaPeriodo,
} = require("../base/utilita");
const { applicaAnno } = require("../azioni/anno");
const { applicaFoto } = require("../azioni/foto-stagione");
const { applicaGiro } = require("../azioni/giro");
const { applicaMese } = require("../azioni/mese");
const { applicaStagione } = require("../azioni/stagione");
const { leggiData } = require("../calcoli/giri-e-statistiche");
const { elencaFoto } = require("../immagini/foto");
const { leggiElenco } = require("../programma/elenco");
const { casi } = require("../programma/casi.json");

const CARTELLA_CARICAMENTI = path.join(os.tmpdir(), "giri-in-bici-upload");
const MAX_FOTO = 60 * 1024 * 1024; // 60 MB per file

// ---------- utilità ----------

class ErroreDati extends Error {}

const pulisci = (t) => String(t).replace(/\x1b\[[0-9;]*m/g, "");

const validaSid = (sid) => /^[A-Za-z0-9-]{8,64}$/.test(String(sid || ""));

const nuovoPiano = () => new Piano();

const normalizzaColore = (v) => {
  const t = String(v || "").trim();
  return COLORI_CSS[t.toLowerCase()] ? t.toLowerCase() : t;
};

const interoNonNegativo = (v, nome) => {
  const t = String(v ?? "").trim();
  if (!/^\d+$/.test(t)) throw new ErroreDati(`${nome}: solo numeri interi.`);
  return parseInt(t, 10);
};

const oggiIso = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

// ---------- caricamenti (foto e icona) ----------

const dirCaricamento = (sid, cartella) => {
  if (!validaSid(sid)) throw new ErroreDati("Identificativo di caricamento non valido.");
  if (!["foto", "icona"].includes(cartella))
    throw new ErroreDati("Cartella di caricamento non valida.");
  return path.join(CARTELLA_CARICAMENTI, sid, cartella);
};

const salvaCaricamento = (sid, cartella, nome, buffer) => {
  const pulito = path.basename(String(nome || "")).replace(/[^\w.\- ]/g, "_");
  if (!/\.jpe?g$/i.test(pulito))
    throw new ErroreDati("Sono accettati solo file .jpg / .jpeg.");
  const dir = dirCaricamento(sid, cartella);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, pulito), buffer);
};

const fotoCaricate = (sid, cartella) => {
  if (!sid) return [];
  const dir = dirCaricamento(sid, cartella);
  return fs.existsSync(dir) ? elencaFoto(dir).foto : [];
};

const pulisciCaricamenti = (...sid) => {
  for (const s of sid)
    if (validaSid(s))
      fs.rmSync(path.join(CARTELLA_CARICAMENTI, s), {
        recursive: true,
        force: true,
      });
};

// Cancella i caricamenti più vecchi di un giorno (rimasti da sessioni interrotte).
const spazzaCaricamenti = () => {
  if (!fs.existsSync(CARTELLA_CARICAMENTI)) return;
  for (const n of fs.readdirSync(CARTELLA_CARICAMENTI)) {
    const p = path.join(CARTELLA_CARICAMENTI, n);
    try {
      if (Date.now() - fs.statSync(p).mtimeMs > 24 * 3600 * 1000)
        fs.rmSync(p, { recursive: true, force: true });
    } catch {
      /* ignoro */
    }
  }
};

// ---------- stato (sola lettura) ----------

const stato = () => {
  const piano = nuovoPiano();
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const anni = Object.keys(storico.anni).sort(ordinaPeriodi);
  const stagioni = {};
  for (const [chiave, s] of Object.entries(STAGIONI)) {
    const g = leggiJson(piano, `json/${s.cartella}/generale.json`);
    const periodi = Object.keys(g.subPeriods).sort(ordinaPeriodi);
    const ultimo = periodi[periodi.length - 1];
    stagioni[chiave] = {
      etichetta: s.etichetta,
      testo: s.testo,
      formato: s.formato,
      meseIniziale: s.meseIniziale,
      periodi,
      colori: g.colors || [],
      ultimo,
      prossimo: periodoSuccessivo(s.formato, ultimo),
    };
  }
  const ultimoAnno = anni[anni.length - 1];
  return {
    radice: RADICE,
    prova: PROVA,
    oggi: oggiIso(),
    mesi: MESI,
    casi,
    anni,
    ultimoAnno,
    prossimoAnno: String(parseInt(ultimoAnno, 10) + 1),
    coloriAnni: storico.coloriAnni || [],
    stagioni,
  };
};

const elenco = () => leggiElenco(nuovoPiano());

// ---------- dati di ogni caso ----------

const controllaColore = (piano, colore, usati, nome) => {
  const errore = validaColore(colore);
  if (errore) throw new ErroreDati(errore);
  const c = normalizzaColore(colore);
  if (usati.some((u) => String(u).toLowerCase() === c.toLowerCase()))
    piano.avvisi.push(`${nome}: il colore ${c} è già usato da un altro periodo.`);
  return c;
};

const datiGiro = (d) => {
  const chiave = d.stagione;
  if (!STAGIONI[chiave]) throw new ErroreDati("Scegli una stagione.");
  const data = leggiData(d.data, new Date().getFullYear());
  if (typeof data === "string") throw new ErroreDati(data);
  const luogo = String(d.luogo || "").trim();
  if (!luogo) throw new ErroreDati("Il luogo è obbligatorio.");
  if (/[<>]/.test(luogo))
    throw new ErroreDati("Il luogo non può contenere i simboli < e >.");
  const link = String(d.link || "").trim();
  if (link && !/^https?:\/\/[^\s"<>]+$/i.test(link))
    throw new ErroreDati(
      "Il link deve iniziare con http:// o https:// e non avere spazi.",
    );
  const km = String(d.km ?? "").trim();
  if (!/^\d+$/.test(km) || Number(km) <= 0)
    throw new ErroreDati("Scrivi i km come numero intero maggiore di 0 (es. 95).");
  return { chiave, s: STAGIONI[chiave], data, luogo, link, km: parseInt(km, 10) };
};

const datiMese = (piano, d) => {
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const anno = String(d.anno || "");
  if (!storico.anni[anno]) throw new ErroreDati(`L'anno ${anno || "?"} non esiste.`);
  const mese = MESI.findIndex(
    (m) => m.toLowerCase() === String(d.mese || "").toLowerCase(),
  );
  if (mese === -1) throw new ErroreDati("Scegli un mese.");
  return {
    anno: parseInt(anno, 10),
    mese,
    km: interoNonNegativo(d.km, "Km"),
    corse: interoNonNegativo(d.corse ?? 0, "Corse"),
    sostituisci: !!d.sostituisci,
  };
};

const datiFoto = (piano, d) => {
  const s = STAGIONI[d.stagione];
  if (!s) throw new ErroreDati("Scegli una stagione.");
  const periodi = Object.keys(
    leggiJson(piano, `json/${s.cartella}/generale.json`).subPeriods,
  );
  if (!periodi.includes(d.periodo))
    throw new ErroreDati(`Periodo non valido: scegli tra ${periodi.join(", ")}.`);
  const foto = fotoCaricate(d.sid, "foto");
  if (!foto.length) throw new ErroreDati("Carica almeno una foto .jpg.");
  return { chiave: d.stagione, s, periodo: d.periodo, foto };
};

const datiPrimoGiro = (s, g) => {
  if (!g) return null;
  const data = leggiData(String(g.data || ""), new Date().getFullYear());
  if (typeof data === "string") throw new ErroreDati(`Primo giro: ${data}`);
  const luogo = String(g.luogo || "").trim();
  if (!luogo) throw new ErroreDati("Primo giro: il luogo è obbligatorio.");
  if (/[<>]/.test(luogo))
    throw new ErroreDati("Primo giro: il luogo non può contenere < o >.");
  const link = String(g.link || "").trim();
  if (link && !/^https?:\/\/[^\s"<>]+$/i.test(link))
    throw new ErroreDati("Primo giro: il link deve iniziare con http:// o https://");
  const km = interoNonNegativo(g.km, "Primo giro, km");
  return {
    date: normalizzaData(`${data.giorno} ${MESI[data.mese]}`),
    place: link ? `<a href="${link}" target="_blank">${luogo}</a>` : luogo,
    distance: km,
  };
};

const datiStagione = (piano, chiave, d, periodoForzato) => {
  const s = STAGIONI[chiave];
  if (!s) throw new ErroreDati("Scegli una stagione.");
  const generale = leggiJson(piano, `json/${s.cartella}/generale.json`);
  const esistenti = Object.keys(generale.subPeriods).sort(ordinaPeriodi);
  const ultimo = esistenti[esistenti.length - 1];
  const periodo = String(periodoForzato || d.periodo || "").trim();
  const errore = validaPeriodo(s.formato, esistenti)(periodo);
  if (errore) throw new ErroreDati(`${s.testo}: ${errore}`);
  const colore = controllaColore(
    piano,
    d.colore,
    generale.colors || [],
    `${s.testo} ${periodo}`,
  );
  const fotoDaCopiare = fotoCaricate(d.sid, "foto");
  const nFoto = fotoDaCopiare.length || interoNonNegativo(d.nFoto ?? 0, "Numero di foto");
  if (nFoto > 300) throw new ErroreDati("Troppe foto (massimo 300).");
  return {
    chiave,
    periodo,
    colore,
    nFoto,
    fotoDaCopiare,
    giro: datiPrimoGiro(s, d.primoGiro),
    ultimo,
  };
};

const datiAnno = (piano, d) => {
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const esistenti = Object.keys(storico.anni).sort(ordinaPeriodi);
  const ultimo = esistenti[esistenti.length - 1];
  const anno = String(d.anno || "").trim();
  const errore = validaPeriodo("anno", esistenti)(anno);
  if (errore) throw new ErroreDati(`Statistiche: ${errore}`);
  const colore = controllaColore(
    piano,
    d.colore,
    storico.coloriAnni || [],
    `Anno ${anno}`,
  );
  const icona = fotoCaricate(d.iconaSid, "icona")[0] || null;

  let mese = "Gennaio";
  let km = 0;
  let corse = 0;
  let esempio = true;
  if (d.primoMese) {
    const trovato = MESI.find(
      (m) => m.toLowerCase() === String(d.primoMese.mese || "").toLowerCase(),
    );
    if (!trovato) throw new ErroreDati("Primo mese: scegli un mese.");
    mese = trovato;
    km = interoNonNegativo(d.primoMese.km, "Km del mese");
    corse = interoNonNegativo(d.primoMese.corse, "Corse dell'anno");
    esempio = false;
  }
  return { anno, colore, icona, mese, km, corse, esempio, ultimo };
};

// ---------- costruzione del piano ----------

const costruisciPiano = async (azione, d) => {
  const piano = nuovoPiano();
  d = d || {};
  switch (azione) {
    case "giro":
      await applicaGiro(piano, datiGiro(d));
      break;
    case "mese":
      applicaMese(piano, datiMese(piano, d));
      break;
    case "foto":
      applicaFoto(piano, datiFoto(piano, d));
      break;
    case "stagione":
      applicaStagione(piano, datiStagione(piano, d.stagione, d));
      break;
    case "anno":
      applicaAnno(piano, datiAnno(piano, d));
      break;
    case "anno-completo": {
      const dati = datiAnno(piano, d);
      const n = parseInt(dati.anno, 10);
      const periodi = {
        Primavera: String(n),
        Estate: String(n),
        Autunno_Inverno: `${n}-${n + 1}`,
      };
      const stagioni = Object.keys(periodi).map((chiave) =>
        datiStagione(piano, chiave, (d.stagioni || {})[chiave] || {}, periodi[chiave]),
      );
      applicaAnno(piano, dati);
      stagioni.forEach((x) => applicaStagione(piano, x));
      break;
    }
    default:
      throw new ErroreDati("Azione sconosciuta.");
  }
  piano.valida();
  return piano;
};

const riepilogo = (piano) => ({
  note: piano.note.map(pulisci),
  avvisi: piano.avvisi.map(pulisci),
  creati: [...piano.creati],
  modificati: [...piano.modificati],
  cartelle: [...piano.cartelle],
  promemoria: piano.promemoria.map(pulisci),
  esempio: piano.esempio,
});

const anteprima = async (azione, dati) => ({
  ok: true,
  prova: PROVA,
  ...riepilogo(await costruisciPiano(azione, dati)),
});

// Le scritture una alla volta, per non far litigare due conferme ravvicinate.
let coda = Promise.resolve();

const conferma = (azione, dati) => {
  const lavoro = coda.then(async () => {
    if (PROVA) throw new ErroreDati("Modalità --prova: non scrivo nessun file.");
    const piano = await costruisciPiano(azione, dati);
    piano.scrivi();
    pulisciCaricamenti(dati && dati.sid, dati && dati.iconaSid);
    return { ok: true, ...riepilogo(piano) };
  });
  coda = lavoro.catch(() => {});
  return lavoro;
};

module.exports = {
  ErroreDati,
  MAX_FOTO,
  anteprima,
  conferma,
  elenco,
  salvaCaricamento,
  spazzaCaricamenti,
  stato,
};
