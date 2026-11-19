// scansione.js — Fase lenta: legge le pagine per trovare le SEZIONI e i COLLEGAMENTI.
//
// Scarica l'HTML di ogni pagina, ne ricava titolo, sezioni (con ancora) e link ad altre
// pagine del sito. Se trova un link a una pagina che il sito ancora non conosce
// (per esempio una pagina nuova collegata da una esistente) la aggiunge da sola.

import { chiave, daRadice, stessoSito } from "./percorsi.js";
import { trovaSezioni } from "./slug.js";
import { FAMIGLIE, gruppoDaPercorso } from "./gruppi.js";

const MAX_PAGINE = 150;
const PARALLELE = 6;

// Tutti i modi in cui una pagina ne indica un'altra: <a>, onclick="location.href=...", "indietro"
const indirizziDa = (doc) => {
  const lista = [];
  doc.querySelectorAll("a[href]").forEach((a) => lista.push(a.getAttribute("href")));
  doc.querySelectorAll("[onclick]").forEach((el) => {
    const m = /location\.href\s*=\s*['"]([^'"]+)['"]/.exec(el.getAttribute("onclick"));
    if (m) lista.push(m[1]);
  });
  const barra = doc.querySelector("gib-barra[indietro]");
  if (barra) lista.push(barra.getAttribute("indietro"));
  return lista;
};

const eUnaPagina = (percorso) => /\.html?$/i.test(percorso);

const padreDi = (percorso) => {
  const f = FAMIGLIE.find((x) => percorso.toLowerCase().startsWith(x.cartella.toLowerCase()));
  return f ? f.padre : "";
};

const leggiPagina = async (pagina) => {
  try {
    const r = await fetch(pagina.url);
    if (!r.ok) return null;
    return new DOMParser().parseFromString(await r.text(), "text/html");
  } catch (e) {
    return null;
  }
};

export const scansiona = async (iniziali) => {
  const mappa = new Map(iniziali.map((p) => [chiave(p.url), p]));
  const coda = [...mappa.values()];
  const collegamenti = new Map();

  const lavora = async (pagina) => {
    const doc = await leggiPagina(pagina);
    if (!doc) return;
    pagina.sezioni = trovaSezioni(doc).map(({ id, titolo, vista }) => ({ id, titolo, vista }));
    const h1 = doc.querySelector("h1");
    if (!pagina.titolo) pagina.titolo = (h1 ? h1.textContent : doc.title).trim().replace(/\s+/g, " ");
    const da = chiave(pagina.url);

    indirizziDa(doc).forEach((href) => {
      if (!href || href.startsWith("#") || !stessoSito(href, `${location.origin}${pagina.url}`)) return;
      const percorso = daRadice(href, `${location.origin}${pagina.url}`);
      const a = chiave(percorso);
      if (!eUnaPagina(a) || a === da) return;
      if (!mappa.has(a) && mappa.size < MAX_PAGINE) {
        const nuova = {
          url: percorso, titolo: "", gruppo: gruppoDaPercorso(percorso),
          padre: padreDi(percorso), sezioni: [], scoperta: true,
        };
        mappa.set(a, nuova);
        coda.push(nuova);
      }
      if (mappa.has(a)) collegamenti.set(`${da}>${a}`, { da, a });
    });
  };

  // Piccola "piscina" di richieste in parallelo: la coda può crescere mentre si lavora
  const operaio = async () => {
    while (coda.length) await lavora(coda.shift());
  };
  await Promise.all(Array.from({ length: PARALLELE }, operaio));

  return { pagine: [...mappa.values()], collegamenti: [...collegamenti.values()] };
};
