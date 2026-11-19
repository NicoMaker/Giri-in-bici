// schede.js — Le "schede" della mappa: una per pagina, con tutte le sue sezioni cliccabili.

import { escapeHtml as e } from "../comune/escape-html.js";
import { chiave } from "../sito/percorsi.js";
import { linkSezione } from "../sito/slug.js";
import { VISTE_CLASSIFICA } from "../classifica/viste-classifica.js";

const NOMI_VISTE = Object.fromEntries(VISTE_CLASSIFICA);

const sezioniDi = (p, corrente) => {
  const live =
    chiave(p.url) === corrente && window.GibSezioni && window.GibSezioni.length;
  return live ? window.GibSezioni : p.sezioni || [];
};

const voceSezione = (p, s) =>
  `<li class="mappa-sez"><a href="${e(linkSezione(p.url, s))}" data-sezione="${e(s.id)}"><span class="menu-flag" aria-hidden="true"></span>${e(s.titolo)}</a><button type="button" class="mappa-sez-coll" data-pagina="${e(chiave(p.url))}" data-sezione-id="${e(s.id)}" aria-label="Mostra come è collegata la sezione ${e(s.titolo)}" title="Collegamenti di questa sezione">⇄</button></li>`;

// Nella Classifica le sezioni sono divise per scheda, con un titoletto ciascuna
const htmlSezioni = (p, corrente) => {
  const sezioni = sezioniDi(p, corrente);
  if (!sezioni.length) return "";
  let voci;
  if (sezioni.some((s) => s.vista)) {
    const schede = [...new Set(sezioni.map((s) => s.vista))];
    voci = schede
      .map(
        (v) =>
          `<li class="mappa-sezioni-titolo">${e(NOMI_VISTE[v] || "Sezioni")}</li>${sezioni
            .filter((s) => s.vista === v)
            .map((s) => voceSezione(p, s))
            .join("")}`,
      )
      .join("");
  } else {
    voci = sezioni.map((s) => voceSezione(p, s)).join("");
  }
  return `<ul class="mappa-sezioni" aria-label="Sezioni di ${e(p.titolo)}">${voci}</ul>`;
};

export const htmlScheda = (p, { corrente, colori, piccola }) => {
  const k = chiave(p.url);
  const qui = k === corrente;
  const n = sezioniDi(p, corrente).length;
  const badge = n > 0 ? `<span class="mappa-conta">${n} ${n === 1 ? "sezione" : "sezioni"}</span>` : "";
  const pin = qui
    ? '<span class="mappa-qui" title="Sei qui">Sei qui</span>'
    : "";
  return `<article class="mappa-scheda${piccola ? " mappa-scheda--piccola" : ""}${qui ? " is-qui" : ""}" data-k="${e(k)}" style="--c:${colori[p.gruppo] || colori.altro}">
    <header>
      <a class="mappa-titolo" href="${e(p.url)}"${qui ? ' aria-current="page"' : ""}>${e(p.titolo || p.url)}</a>
      <button type="button" class="mappa-coll" aria-pressed="false" aria-label="Mostra i collegamenti di ${e(p.titolo)}" title="Mostra i collegamenti">⇄</button>
    </header>
    ${pin}${badge}${htmlSezioni(p, corrente)}
  </article>`;
};

// Le pagine figlie, divise per categoria ("History", "Anni", "Stagioni", ...)
const htmlFigli = (figli, ctx) => {
  const categorie = [...new Set(figli.map((f) => f.categoria || ""))];
  return categorie
    .map((c) => {
      const schede = figli
        .filter((f) => (f.categoria || "") === c)
        .map((f) => htmlScheda(f, { ...ctx, piccola: true }))
        .join("");
      return c
        ? `<div class="mappa-categoria"><h4>${e(c)}</h4><div class="mappa-categoria-schede">${schede}</div></div>`
        : schede;
    })
    .join("");
};

export const htmlTela = (modello, corrente) => {
  const ctx = { corrente, colori: modello.colori };
  const home = modello.home
    ? `<div class="mappa-home">${htmlScheda(modello.home, ctx)}</div>`
    : "";
  const corsie = modello.corsie
    .map(({ gruppo, righe }) => {
      const html = righe
        .map(
          ({ hub, figli }) =>
            `<div class="mappa-riga">${htmlScheda(hub, ctx)}<div class="mappa-figli" data-k="figli:${e(chiave(hub.url))}">${htmlFigli(figli, ctx)}</div></div>`,
        )
        .join("");
      return `<section class="mappa-corsia" style="--c:${gruppo.colore}"><h3>${e(gruppo.titolo)}</h3>${html}</section>`;
    })
    .join("");
  return `<svg class="mappa-fili" aria-hidden="true"></svg><div class="mappa-griglia">${home}<div class="mappa-corsie">${corsie}</div></div>`;
};
