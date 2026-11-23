"use strict";

// CRUD dell'interfaccia locale: aggiorna i JSON dei giri e le statistiche correlate.
const fs = require("fs");
const path = require("path");
const { RADICE, STAGIONI, MESI, PERCORSO_STORICO_JSON, PERCORSO_STAGIONI_JSON } = require("../base/impostazioni");
const { validaColore } = require("../base/utilita");

const assoluto = (rel) => path.join(RADICE, rel);
const leggi = (rel) => JSON.parse(fs.readFileSync(assoluto(rel), "utf8"));
const formattaJson = (x) => `${JSON.stringify(x, null, 2)}\n`;
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const dataSalvata = (g) => {
  const m = String(g.date || "").match(/^(\d{1,2})\s+([A-Za-zàèéìòù]+)$/i);
  const mese = m && MESI.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  return m && mese >= 0 ? { giorno: Number(m[1]), mese } : null;
};
const annoPeriodo = (chiave, periodo, mese) => {
  if (STAGIONI[chiave].formato === "anno") return Number(periodo);
  const [inizio, fine] = periodo.split("-").map(Number);
  return mese >= 8 ? inizio : fine;
};
const elencoGiri = () => {
  const out = [];
  for (const [chiave, s] of Object.entries(STAGIONI)) {
    const generale = leggi(`json/${s.cartella}/generale.json`);
    for (const [periodo, file] of Object.entries(generale.subPeriods)) {
      leggi(file).forEach((g, index) => {
        const d = dataSalvata(g);
        if (!d) return;
        let luogo = String(g.place || "");
        let link = "";
        const a = luogo.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
        if (a) { link = a[1]; luogo = a[2].replace(/<[^>]*>/g, " "); }
        luogo = luogo.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
        const anno = annoPeriodo(chiave, periodo, d.mese);
        out.push({ id: `${encodeURIComponent(chiave)}|${encodeURIComponent(periodo)}|${index}`, stagione: chiave, etichetta: s.testo, periodo, data: `${anno}-${String(d.mese + 1).padStart(2, "0")}-${String(d.giorno).padStart(2, "0")}`, luogo, link, km: Number(g.distance) || 0 });
      });
    }
  }
  return out.sort((a, b) => b.data.localeCompare(a.data));
};
const stagioneDaId = (id) => {
  const [k, p, i] = String(id || "").split("|").map(decodeURIComponent);
  if (!STAGIONI[k] || !/^\d{4}(?:-\d{4})?$/.test(p || "") || !/^\d+$/.test(i || "")) throw new Error("Identificativo giro non valido.");
  return { chiave: k, periodo: p, index: Number(i), s: STAGIONI[k] };
};
const parseData = (iso) => {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new Error("Inserisci una data valida.");
  const [anno, mese, giorno] = m.slice(1).map(Number);
  const d = new Date(Date.UTC(anno, mese - 1, giorno));
  if (d.getUTCFullYear() !== anno || d.getUTCMonth() !== mese - 1 || d.getUTCDate() !== giorno) throw new Error("La data inserita non esiste.");
  return { anno, mese: mese - 1, giorno };
};
const periodoGiro = (chiave, d) => STAGIONI[chiave].formato === "anno" ? String(d.anno) : d.mese >= 8 ? `${d.anno}-${d.anno + 1}` : `${d.anno - 1}-${d.anno}`;
const nomeFileGiri = (chiave, periodo) => `json/${STAGIONI[chiave].cartella}/Periodi/${periodo}.json`;
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
const jsonInModifiche = (map, rel) => map.has(rel) ? JSON.parse(map.get(rel)) : leggi(rel);
const stagioneConfig = (map, chiave) => {
  const s = STAGIONI[chiave];
  const file = `json/${s.cartella}/generale.json`;
  const generale = jsonInModifiche(map, file);
  const statistiche = jsonInModifiche(map, PERCORSO_STAGIONI_JSON);
  const voce = statistiche.seasons.find((x) => x.name === chiave || x.name === s.testo);
  if (!voce) throw new Error(`Configurazione statistiche non trovata per ${s.testo}.`);
  return { s, file, generale, statistiche, voce };
};
const garantisciPeriodo = (map, chiave, periodo) => {
  const { s, file, generale, statistiche, voce } = stagioneConfig(map, chiave);
  const periodFile = nomeFileGiri(chiave, periodo);
  if (!generale.subPeriods[periodo]) {
    generale.subPeriods[periodo] = periodFile;
    voce.subPeriods[periodo] = periodFile;
    map.set(file, formattaJson(generale));
    map.set(PERCORSO_STAGIONI_JSON, formattaJson(statistiche));
    map.set(periodFile, "[]\n");
    const html = path.join(RADICE, s.cartella, `${periodo}.html`);
    // La pagina stagione legge le sotto-pagine dai metadati; non si genera HTML arbitrario.
    if (!fs.existsSync(html)) map.set(path.relative(RADICE, html).split(path.sep).join("/"), `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=../${s.cartella}.html">\n`);
  }
};
const stagionePerData = (d) => d.mese >= 2 && d.mese <= 4 ? "Primavera" : d.mese >= 5 && d.mese <= 7 ? "Estate" : "Autunno_Inverno";
const regolaStagione = (scelta, d) => {
  if (!STAGIONI[scelta]) throw new Error("Scegli una stagione valida.");
  const attesa = stagionePerData(d);
  if (scelta !== attesa) return; // stagioni personalizzabili per scelta: non imporre il calendario.
};
const aggiornaStatistica = (map, anno, mese, deltaKm, deltaGiri) => {
  const storico = jsonInModifiche(map, PERCORSO_STORICO_JSON);
  const file = storico.anni[String(anno)] || `json/Statistiche/anni/${anno}.json`;
  let dati;
  if (map.has(file)) dati = JSON.parse(map.get(file));
  else if (fs.existsSync(assoluto(file))) dati = leggi(file);
  else {
    dati = { year: String(anno), numberOfRaces: 0, data: {} };
    storico.anni[String(anno)] = file;
    const colori = ["#2dd4bf", "#60a5fa", "#f59e0b", "#a78bfa"];
    storico.coloriAnni = storico.coloriAnni || [];
    storico.coloriAnni.push(colori[(anno - 1) % colori.length]);
    map.set(PERCORSO_STORICO_JSON, formattaJson(storico));
  }
  const meseNome = MESI[mese];
  const nuovoKm = (Number(dati.data[meseNome]) || 0) + deltaKm;
  if (novoNonNegativo(nuovoKm)) dati.data[meseNome] = nuovoKm;
  else throw new Error(`La modifica produrrebbe km negativi in ${meseNome} ${anno}.`);
  dati.numberOfRaces = (Number(dati.numberOfRaces) || 0) + deltaGiri;
  if (dati.numberOfRaces < 0) throw new Error(`Il totale delle corse di ${anno} non può diventare negativo.`);
  map.set(file, formattaJson(dati));
};
const novoNonNegativo = (n) => Number.isFinite(n) && n >= 0;
const normalize = (data) => {
  const d = parseData(data.data);
  const stagione = String(data.stagione || "");
  regolaStagione(stagione, d);
  const luogo = String(data.luogo || "").trim();
  if (!luogo || /[<>]/.test(luogo)) throw new Error("Inserisci un luogo senza tag HTML.");
  const link = String(data.link || "").trim();
  if (link && !/^https?:\/\/[^\s"<>]+$/i.test(link)) throw new Error("Il link deve iniziare con http:// o https://.");
  const km = Number(data.km);
  if (!Number.isInteger(km) || km <= 0) throw new Error("I km devono essere un numero intero maggiore di zero.");
  const periodo = periodoGiro(stagione, d);
  return { d, stagione, periodo, luogo, link, km };
};
const salvaGiro = (body) => {
  const changes = new Map();
  let old = null;
  if (body.id) {
    const ref = stagioneDaId(body.id);
    const oldFile = nomeFileGiri(ref.chiave, ref.periodo);
    const list = leggi(oldFile);
    if (!list[ref.index]) throw new Error("Il giro da modificare non esiste più.");
    const oldDate = dataSalvata(list[ref.index]);
    if (!oldDate) throw new Error("La data del giro esistente non è leggibile.");
    const oldYear = annoPeriodo(ref.chiave, ref.periodo, oldDate.mese);
    old = { ref, oldFile, list, ride: list[ref.index], date: { ...oldDate, anno: oldYear } };
  }
  const n = normalize(body);
  const targetFile = nomeFileGiri(n.stagione, n.periodo);
  garantisciPeriodo(changes, n.stagione, n.periodo);
  if (old) {
    if (old.oldFile === targetFile) {
      const list = changes.has(targetFile) ? JSON.parse(changes.get(targetFile)) : old.list;
      // Periodo appena creato non può essere il vecchio file dello stesso giro.
      list.splice(old.ref.index, 1);
      changes.set(targetFile, formattaJson(list));
    } else {
      old.list.splice(old.ref.index, 1);
      changes.set(old.oldFile, formattaJson(old.list));
    }
  }
  const list = changes.has(targetFile) ? JSON.parse(changes.get(targetFile)) : leggi(targetFile);
  const nomeData = `${String(n.d.giorno).padStart(2, "0")} ${MESI[n.d.mese]}`;
  const place = n.link ? `<a href="${escapeHtml(n.link)}" target="_blank" rel="noopener">${escapeHtml(n.luogo)}</a>` : escapeHtml(n.luogo);
  list.push({ date: nomeData, place, distance: n.km });
  list.sort((a, b) => {
    const da = dataSalvata(a), db = dataSalvata(b);
    if (!da || !db) return 0;
    const idx = (x) => STAGIONI[n.stagione].formato === "biennio" ? (x.mese >= 8 ? x.mese - 8 : x.mese + 4) : x.mese;
    return idx(da) - idx(db) || da.giorno - db.giorno;
  });
  changes.set(targetFile, formattaJson(list));
  if (old) {
    aggiornaStatistica(changes, old.date.anno, old.date.mese, -Number(old.ride.distance || 0), 0);
    aggiornaStatistica(changes, n.d.anno, n.d.mese, n.km, 0);
  } else aggiornaStatistica(changes, n.d.anno, n.d.mese, n.km, 1);
  scriviTransazione(changes);
  return { ok: true, messaggio: old ? "Giro modificato e statistiche aggiornate." : "Giro aggiunto e statistiche aggiornate." };
};
const eliminaGiro = ({ id }) => {
  const ref = stagioneDaId(id);
  const file = nomeFileGiri(ref.chiave, ref.periodo);
  const list = leggi(file);
  const ride = list[ref.index];
  if (!ride) throw new Error("Il giro da eliminare non esiste più.");
  const d = dataSalvata(ride);
  if (!d) throw new Error("La data del giro non è leggibile.");
  const anno = annoPeriodo(ref.chiave, ref.periodo, d.mese);
  list.splice(ref.index, 1);
  const changes = new Map([[file, formattaJson(list)]]);
  aggiornaStatistica(changes, anno, d.mese, -Number(ride.distance || 0), -1);
  scriviTransazione(changes);
  return { ok: true, messaggio: "Giro eliminato e statistiche aggiornate." };
};
const listaStagioni = () => Object.entries(STAGIONI).flatMap(([chiave, s]) => {
  const g = leggi(`json/${s.cartella}/generale.json`);
  return Object.keys(g.subPeriods).sort().map((periodo) => ({ chiave, etichetta: s.testo, periodo, colore: (g.colors || [])[Object.keys(g.subPeriods).sort().indexOf(periodo)] || "#2dd4bf" }));
});
const salvaColore = ({ stagione, periodo, colore }) => {
  const s = STAGIONI[stagione];
  if (!s) throw new Error("Stagione non valida.");
  const errore = validaColore(colore);
  if (errore) throw new Error(errore);
  const changes = new Map();
  const { file, generale, statistiche, voce } = stagioneConfig(changes, stagione);
  if (!generale.subPeriods[periodo]) throw new Error("Periodo non trovato.");
  const periodi = Object.keys(generale.subPeriods).sort();
  generale.colors = generale.colors || [];
  generale.colors[periodi.indexOf(periodo)] = String(colore).trim();
  voce.subPeriods = generale.subPeriods;
  changes.set(file, formattaJson(generale));
  changes.set(PERCORSO_STAGIONI_JSON, formattaJson(statistiche));
  scriviTransazione(changes);
  return { ok: true, messaggio: `Colore aggiornato per ${s.testo} ${periodo}.` };
};
module.exports = { elencoGiri, listaStagioni, salvaGiro, eliminaGiro, salvaColore };
