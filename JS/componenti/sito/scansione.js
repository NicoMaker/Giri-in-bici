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

// Tutti i modi in cui una pagina ne indica un'altra: <a> e onclick="location.href=..."
// Restituisce [{ href, el }]: l'elemento serve a sapere in quale sezione sta il link
const indirizziDa = (doc) => {
  const lista = [];
  doc
    .querySelectorAll("a[href]")
    .forEach((a) => lista.push({ href: a.getAttribute("href"), el: a }));
  doc.querySelectorAll("[onclick]").forEach((el) => {
    const m = /location\.href\s*=\s*['"]([^'"]+)['"]/.exec(
      el.getAttribute("onclick"),
    );
    if (m) lista.push({ href: m[1], el });
  });
  return lista;
};

// Quale sezione di quella pagina contiene l'elemento? (id della sezione o "")
const sezioneDi = (el, sezioni) => {
  const dentro = sezioni.find((s) => s.el.contains(el));
  return dentro ? dentro.id : "";
};

// Verso quale sezione punta un indirizzo? #ancora, oppure ?vista=...&modo=...
// (la Classifica ha una sezione per scheda); altrimenti nessuna in particolare.
const sezioneVerso = (href, pagina) => {
  let u;
  try {
    u = new URL(href, `${location.origin}${pagina.url}`);
  } catch (e) {
    return "";
  }
  const sezioni = pagina.sezioni || [];
  const ancora = decodeURIComponent(u.hash.slice(1));
  if (ancora && sezioni.some((x) => x.id === ancora)) return ancora;
  const vista = u.searchParams.get("vista");
  if (vista) {
    const modo = u.searchParams.get("modo") === "anni" ? "anni" : "";
    const trovate = sezioni.filter((x) => x.vista === vista);
    const giusta = trovate.find((x) => (x.modo || "") === modo) || trovate[0];
    if (giusta) return giusta.id;
  }
  return "";
};

const eUnaPagina = (percorso) => /\.html?$/i.test(percorso);

const padreDi = (percorso) => {
  const f = FAMIGLIE.find((x) =>
    percorso.toLowerCase().startsWith(x.cartella.toLowerCase()),
  );
  return f ? f.padre : "";
};

const categoriaDi = (percorso) => {
  const f = FAMIGLIE.find((x) =>
    percorso.toLowerCase().startsWith(x.cartella.toLowerCase()),
  );
  return f ? f.categoria : "";
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
  const grezzi = [];

  const lavora = async (pagina) => {
    const doc = await leggiPagina(pagina);
    if (!doc) return;
    const trovate = trovaSezioni(doc);
    pagina.sezioni = trovate.map(({ id, titolo, vista, modo }) => ({
      id,
      titolo,
      vista,
      modo,
    }));
    const h1 = doc.querySelector("h1");
    if (!pagina.titolo)
      pagina.titolo = (h1 ? h1.textContent : doc.title)
        .trim()
        .replace(/\s+/g, " ");
    const da = chiave(pagina.url);

    indirizziDa(doc).forEach(({ href, el }) => {
      if (
        !href ||
        href.startsWith("#") ||
        !stessoSito(href, `${location.origin}${pagina.url}`)
      )
        return;
      const percorso = daRadice(href, `${location.origin}${pagina.url}`);
      const a = chiave(percorso);
      if (!eUnaPagina(a) || a === da) return;
      if (!mappa.has(a) && mappa.size < MAX_PAGINE) {
        const nuova = {
          url: percorso,
          titolo: "",
          gruppo: gruppoDaPercorso(percorso),
          padre: padreDi(percorso),
          categoria: categoriaDi(percorso),
          sezioni: [],
          scoperta: true,
        };
        mappa.set(a, nuova);
        coda.push(nuova);
      }
      if (mappa.has(a)) {
        collegamenti.set(`${da}>${a}`, { da, a });
        // Dettaglio a livello di sezione, risolto a fine scansione
        grezzi.push({
          da,
          a,
          daSezione: sezioneDi(el, trovate),
          href,
          base: pagina.url,
        });
      }
    });
  };

  // Piccola "piscina" di richieste in parallelo: la coda può crescere mentre si lavora
  const operaio = async () => {
    while (coda.length) await lavora(coda.shift());
  };
  await Promise.all(Array.from({ length: PARALLELE }, operaio));

  // Ora che tutte le pagine hanno le loro sezioni si sa dove punta ogni link
  const perSezione = new Map();
  grezzi.forEach((g) => {
    const dest = mappa.get(g.a);
    const aSezione = dest
      ? sezioneVerso(new URL(g.href, `${location.origin}${g.base}`).href, dest)
      : "";
    perSezione.set(`${g.da}#${g.daSezione}>${g.a}#${aSezione}`, {
      da: g.da,
      daSezione: g.daSezione,
      a: g.a,
      aSezione,
    });
  });

  return {
    pagine: [...mappa.values()],
    collegamenti: [...collegamenti.values()],
    collegamentiSezioni: [...perSezione.values()],
  };
};
