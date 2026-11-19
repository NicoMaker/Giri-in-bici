// collegamenti.js — Il pannello "Collegamenti" della mappa: per una sezione scelta
// dice da quali sezioni (o pagine) ci si arriva e verso quali porta.
//
// Si apre toccando il bottone ⇄ accanto a una sezione di una scheda.
// I dati sono quelli di indice.collegamentiSezioni (vedi ../sito/scansione.js):
// ogni voce è { da, daSezione, a, aSezione } con pagine in forma "chiave".

import { escapeHtml as e } from "../comune/escape-html.js";
import { chiave } from "../sito/percorsi.js";
import { linkSezione } from "../sito/slug.js";

const NOMI = (indice) => new Map(indice.pagine.map((p) => [chiave(p.url), p]));

const etichetta = (pagina, idSezione) => {
  if (!pagina) return "";
  const s = (pagina.sezioni || []).find((x) => x.id === idSezione);
  return s
    ? `${pagina.titolo} › ${s.titolo}`
    : `${pagina.titolo}${idSezione ? "" : " (pagina intera)"}`;
};

const voce = (pagina, idSezione, k) => {
  const s = (pagina.sezioni || []).find((x) => x.id === idSezione);
  const href = s ? linkSezione(pagina.url, s) : pagina.url;
  return `<li><a href="${e(href)}">${e(etichetta(pagina, idSezione))}</a><button type="button" class="mappa-sez-coll" data-pagina="${e(k)}" data-sezione-id="${e(idSezione || "")}" aria-label="Vedi i collegamenti di ${e(etichetta(pagina, idSezione))}" title="Vedi i suoi collegamenti">⇄</button></li>`;
};

const elenco = (titolo, righe, vuoto) =>
  `<section class="mappa-coll-blocco"><h4>${e(titolo)}</h4>${
    righe.length
      ? `<ul>${righe.join("")}</ul>`
      : `<p class="mappa-coll-vuoto">${e(vuoto)}</p>`
  }</section>`;

// Disegna il pannello per (pagina, sezione). Restituisce l'insieme delle schede coinvolte.
export const pannelloCollegamenti = (radice, indice, k, idSezione) => {
  const pagine = NOMI(indice);
  const pagina = pagine.get(k);
  if (!pagina) return new Set();
  const tutti = indice.collegamentiSezioni || [];

  // Verso la sezione scelta (o, se la pagina ha un solo blocco, verso la pagina)
  const arrivi = tutti.filter(
    (c) =>
      c.a === k && (c.aSezione === idSezione || (!c.aSezione && !idSezione)),
  );
  // Dalla sezione scelta verso altrove
  const uscite = tutti.filter((c) => c.da === k && c.daSezione === idSezione);

  const unici = (lista, latoPagina, latoSezione) => {
    const visti = new Set();
    return lista.filter((c) => {
      const x = `${c[latoPagina]}#${c[latoSezione]}`;
      if (visti.has(x)) return false;
      visti.add(x);
      return true;
    });
  };

  const daDoveArrivi = unici(arrivi, "da", "daSezione")
    .map((c) => ({ p: pagine.get(c.da), s: c.daSezione, k: c.da }))
    .filter((x) => x.p)
    .map((x) => voce(x.p, x.s, x.k));
  const doveVai = unici(uscite, "a", "aSezione")
    .map((c) => ({ p: pagine.get(c.a), s: c.aSezione, k: c.a }))
    .filter((x) => x.p)
    .map((x) => voce(x.p, x.s, x.k));

  // Struttura: la pagina "capofila" da cui questa discende
  const padre = pagina.padre ? pagine.get(chiave(pagina.padre)) : null;
  const struttura = padre
    ? [`<li><a href="${e(padre.url)}">${e(padre.titolo)}</a></li>`]
    : [];

  const el = radice.querySelector(".mappa-collegamenti");
  el.innerHTML = `<header><div><span class="mappa-coll-et">Collegamenti di</span><strong>${e(etichetta(pagina, idSezione))}</strong></div><button type="button" class="mappa-coll-chiudi" data-chiudi-coll aria-label="Chiudi i collegamenti">✕</button></header>
    <div class="mappa-coll-corpo">
      ${elenco("Ci arrivi da", daDoveArrivi, "Nessun'altra sezione porta qui: si raggiunge dal menu.")}
      ${elenco("Porta a", doveVai, "Da qui non parte nessun collegamento verso altre pagine.")}
      ${padre ? elenco("Fa parte di", struttura, "") : ""}
    </div>`;
  el.hidden = false;

  const coinvolte = new Set([k]);
  [...arrivi, ...uscite].forEach((c) => {
    coinvolte.add(c.da);
    coinvolte.add(c.a);
  });
  return coinvolte;
};

export const chiudiCollegamenti = (radice) => {
  const el = radice.querySelector(".mappa-collegamenti");
  if (el) el.hidden = true;
};
