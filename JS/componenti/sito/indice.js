// indice.js — L'indice del sito, condiviso da menu e mappa.
//
//   ottieniIndice()   subito: elenco delle pagine (veloce)
//   completaIndice()  poi: sezioni e collegamenti di ogni pagina (lento, una volta a sessione)
//   paginaCorrente()  la pagina in cui ci si trova
//
// Quando l'indice completo è pronto parte l'evento window "sito:indice".
// Il risultato resta in sessionStorage per 10 minuti: cambiando pagina non si rifà nulla.

import { scopriPagine } from "./scopri.js";
import { scansiona } from "./scansione.js";
import { chiave } from "./percorsi.js";

const CACHE = "gib-indice-v2";
const DURATA = 10 * 60 * 1000;
let base = null;
let completo = null;

const daCache = () => {
  try {
    const dati = JSON.parse(sessionStorage.getItem(CACHE));
    return dati && Date.now() - dati.t < DURATA ? dati : null;
  } catch (e) {
    return null;
  }
};

const inCache = (dati) => {
  try {
    sessionStorage.setItem(CACHE, JSON.stringify({ ...dati, t: Date.now() }));
  } catch (e) {
    /* memoria piena o bloccata: si rifà alla prossima pagina */
  }
};

export const ottieniIndice = () => {
  if (!base) {
    const salvato = daCache();
    base = salvato ? Promise.resolve(salvato) : scopriPagine();
  }
  return base;
};

export const completaIndice = () => {
  if (!completo) {
    completo = ottieniIndice().then(async (indice) => {
      if (indice.collegamenti) return indice;
      const { pagine, collegamenti, collegamentiSezioni } = await scansiona(
        indice.pagine,
      );
      const pronto = {
        pagine,
        esterni: indice.esterni,
        collegamenti,
        collegamentiSezioni,
      };
      inCache(pronto);
      window.dispatchEvent(new CustomEvent("sito:indice", { detail: pronto }));
      return pronto;
    });
  }
  return completo;
};

export const paginaCorrente = (indice) => {
  const qui = chiave(window.location.href);
  return indice.pagine.find((p) => chiave(p.url) === qui) || null;
};
