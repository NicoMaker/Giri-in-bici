"use strict";

// API del server web: legge lo stato, riceve i file e costruisce il Piano per ogni caso.
// Raccoglie i dati dal modulo web e li passa alle funzioni "applica" di scripts/nuovo/azioni.

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
const { normalizzaLuogo, costruisciPlace } = require("../base/luogo");
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
  if (!validaSid(sid))
    throw new ErroreDati("Identificativo di caricamento non valido.");
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
