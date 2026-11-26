"use strict";

// Strumenti CRUD locali: le statistiche vengono aggiornate insieme ai JSON dei giri.
const fs = require("fs");
const path = require("path");
const {
  RADICE,
  STAGIONI,
  MESI,
  PERCORSO_STORICO_JSON,
  PERCORSO_STAGIONI_JSON,
} = require("../base/impostazioni");
const { validaColore } = require("../base/utilita");
const {
  verificaBandiere,
  nomeCartella,
  CARTELLA_BANDIERE,
  normalizzaLuogo,
  costruisciPlace,
  leggiPlace,
  elencoPaesi: leggiElencoPaesi,
  leggiBandierePersonalizzate,
  sincronizzaBandiere,
} = require("../base/luogo");

const { parseData } = require("./date");

const assoluto = (rel) => path.join(RADICE, rel);
const FILE_BANDIERE_PERSONALIZZATE = "json/Bandiere-personalizzate.json";
const leggi = (rel) => JSON.parse(fs.readFileSync(assoluto(rel), "utf8"));
const formattaJson = (x) => `${JSON.stringify(x, null, 2)}\n`;
const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const dataSalvata = (g) => {
  const m = String(g.date || "").match(/^(\d{1,2})\s+([A-Za-zàèéìòù]+)$/i);
  const mese =
    m && MESI.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  return m && mese >= 0 ? { giorno: Number(m[1]), mese } : null;
};
const annoPeriodo = (chiave, periodo, mese) => {
  if (STAGIONI[chiave].formato === "anno") return Number(periodo);
  const [inizio, fine] = periodo.split("-").map(Number);
  return mese >= 8 ? inizio : fine;
};
const estraiLuogoLink = (place) => {
  let luogo = String(place || "");
  let link = "";
  const a = luogo.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
  if (a) {
    link = a[1];
    luogo = a[2];
  }
  luogo = luogo
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return { luogo, link };
};
const elencoGiri = () => {
  const out = [];
  for (const [chiave, s] of Object.entries(STAGIONI)) {
    const generale = leggi(`json/${s.cartella}/generale.json`);
    for (const [periodo, file] of Object.entries(generale.subPeriods)) {
      leggi(file).forEach((g, index) => {
        const d = dataSalvata(g);
        if (!d) return;
        const { luogo, links, flags } = leggiPlace(g.place);
        const anno = annoPeriodo(chiave, periodo, d.mese);
        out.push({
          id: `${encodeURIComponent(chiave)}|${encodeURIComponent(periodo)}|${index}`,
          stagione: chiave,
          etichetta: s.testo,
          periodo,
          data: `${anno}-${String(d.mese + 1).padStart(2, "0")}-${String(d.giorno).padStart(2, "0")}`,
          luogo,
          links,
          flags,
          link: (links[0] || {}).url || "",
          km: Number(g.distance) || 0,
        });
      });
    }
  }
  return out.sort((a, b) => b.data.localeCompare(a.data));
};
const stagioneDaId = (id) => {
  const [k, p, i] = String(id || "")
    .split("|")
    .map(decodeURIComponent);
  if (
    !STAGIONI[k] ||
    !/^\d{4}(?:-\d{4})?$/.test(p || "") ||
    !/^\d+$/.test(i || "")
  )
    throw new Error("Identificativo giro non valido.");
  return { chiave: k, periodo: p, index: Number(i), s: STAGIONI[k] };
};
const periodoGiro = (chiave, d) =>
  STAGIONI[chiave].formato === "anno"
    ? String(d.anno)
    : d.mese >= 8
      ? `${d.anno}-${d.anno + 1}`
      : `${d.anno - 1}-${d.anno}`;
const nomeFileGiri = (chiave, periodo) =>
  `json/${STAGIONI[chiave].cartella}/Periodi/${periodo}.json`;
const scriviTransazione = (modifiche) => {
  const prima = new Map();
  try {
    for (const [rel, contenuto] of modifiche) {
      const file = assoluto(rel);
      prima.set(rel, fs.existsSync(file) ? fs.readFileSync(file) : null);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const temp = `${file}.tmp-${process.pid}`;
      fs.writeFileSync(temp, contenuto);
      fs.renameSync(temp, file);
    }
  } catch (e) {
    for (const [rel, bytes] of [...prima].reverse()) {
      const file = assoluto(rel);
      if (bytes === null) fs.rmSync(file, { force: true });
      else fs.writeFileSync(file, bytes);
    }
    throw e;
  }
};
