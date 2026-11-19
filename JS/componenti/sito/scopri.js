// scopri.js — Fase veloce: l'elenco delle pagine del sito (senza scaricarle).
//
// 1. Le pagine fisse arrivano da json/Menu.json (una riga per pagina).
// 2. Le pagine per anno/periodo arrivano dall'elenco JSON di ogni famiglia
//    (generale.json, Storico.json) E da una prova sugli anni successivi:
//    creare Estate/2027.html basta perché compaia, anche prima di toccare il JSON.

import { caricaVoci } from "../menu/voci-menu.js";
import { FAMIGLIE } from "./gruppi.js";
import { chiave, daRadice } from "./percorsi.js";

const leggiJson = async (url) => {
  try {
    const r = await fetch(url);
    return r.ok ? await r.json() : null;
  } catch (e) {
    return null;
  }
};

// La pagina esiste davvero? (HEAD leggero; scarta le risposte "di riserva" con HTML altrui)
const esiste = async (url) => {
  try {
    const r = await fetch(url, { method: "HEAD" });
    const tipo = r.headers.get("content-type") || "";
    return r.ok && /html/i.test(tipo) && chiave(r.url) === chiave(url);
  } catch (e) {
    return false;
  }
};

const paginaFissa = (voce) => ({
  url: daRadice(voce.link),
  titolo: voce.nome,
  gruppo: voce.gruppo,
  padre: voce.padre,
  categoria: voce.categoria,
  icona: voce.icona,
  immagine: voce.immagine,
  classifica: voce.classifica,
  sezioni: [],
});

// Le chiavi dei periodi di una famiglia (es. "2020", "2021"...), dal JSON + prova in avanti
const chiaviFamiglia = async (f) => {
  const dati = await leggiJson(f.json);
  const note = dati && dati[f.chiavi] ? Object.keys(dati[f.chiavi]) : [];
  const ultimo = note.length ? Math.max(...note.map(f.anno)) : 2019;
  const limite = new Date().getFullYear() + 1;
  const prove = [];
  for (let a = ultimo + 1; a <= limite; a++) prove.push(f.chiave(a));
  const trovate = await Promise.all(
    prove.map(async (k) =>
      (await esiste(`${f.cartella}${k}.html`)) ? k : null,
    ),
  );
  return [...note, ...trovate.filter(Boolean)];
};

export const scopriPagine = async () => {
  const voci = await caricaVoci();
  const pagine = new Map();
  const esterni = [];

  voci.forEach((v) => {
    if (v.fuori)
      esterni.push({
        titolo: v.nome,
        url: v.link,
        icona: v.icona,
        immagine: v.immagine,
      });
    else pagine.set(chiave(v.link), paginaFissa(v));
  });

  const periodi = await Promise.all(FAMIGLIE.map(chiaviFamiglia));
  FAMIGLIE.forEach((f, i) => {
    periodi[i].forEach((k) => {
      const url = `${f.cartella}${k}.html`;
      if (pagine.has(chiave(url))) return;
      pagine.set(chiave(url), {
        url,
        titolo: f.etichetta(k),
        gruppo: f.gruppo,
        padre: f.padre,
        categoria: f.categoria,
        icona: f.icona,
        sezioni: [],
        figlia: true,
      });
    });
  });

  return { pagine: [...pagine.values()], esterni };
};
