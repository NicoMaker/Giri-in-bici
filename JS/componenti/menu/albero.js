// albero.js — Dall'indice del sito al markup del menu: gruppi > pagine > sotto-pagine e sezioni.
//
// Ogni pagina con figli (gli anni di una stagione) o con più di una sezione
// ha una freccia che apre l'elenco; le sezioni portano alla pagina#ancora.

import { escapeHtml as e } from "../comune/escape-html.js";
import { GRUPPI } from "../sito/gruppi.js";
import { chiave } from "../sito/percorsi.js";
import { linkSezione } from "../sito/slug.js";
import { VISTE_CLASSIFICA } from "../classifica/viste-classifica.js";

const NOMI_VISTE = Object.fromEntries(VISTE_CLASSIFICA);

const icona = (p) => {
  if (p.immagine && !p.icona)
    return `<span class="ico-tile"><img src="${e(p.immagine)}" alt="" /></span>`;
  if (p.icona && p.icona.endsWith(".svg"))
    return `<span class="ico-tile"><img src="${e(p.icona)}" alt="" /></span>`;
  return `<span class="ico-tile" data-icona="${e(p.icona || "calendario")}"></span>`;
};

const voceSezione = (p, s) =>
  `<li data-nome="${e(s.titolo)}"><a class="menu-sezione" data-sezione="${e(s.id)}" href="${e(linkSezione(p.url, s))}"><span class="menu-flag" aria-hidden="true"></span><span>${e(s.titolo)}</span></a></li>`;

// Le sezioni di una pagina. Nella Classifica sono divise per scheda
// (Mesi migliori, Km mensili, Anni, ... Giri): ogni scheda ha il suo titoletto.
const htmlSezioni = (p, sezioni) => {
  if (!sezioni.length) return "";
  if (sezioni.some((s) => s.vista)) {
    const schede = [...new Set(sezioni.map((s) => s.vista))];
    return schede
      .map((v) => {
        const voci = sezioni.filter((s) => s.vista === v);
        const nome = NOMI_VISTE[v] || "Sezioni";
        return `<li class="menu-sotto-titolo" aria-hidden="true">${e(nome)}</li>${voci.map((s) => voceSezione(p, s)).join("")}`;
      })
      .join("");
  }
  return `<li class="menu-sotto-titolo" aria-hidden="true">In questa pagina</li>${sezioni.map((s) => voceSezione(p, s)).join("")}`;
};

// Le pagine figlie, divise per categoria (es. "History", "Anni", "Stagioni")
const htmlFigli = (figli, ctx) => {
  const categorie = [...new Set(figli.map((f) => f.categoria || ""))];
  if (categorie.length === 1 && !categorie[0])
    return figli.map((f) => htmlPagina(f, ctx)).join("");
  return categorie
    .map((c) => {
      const voci = figli.filter((f) => (f.categoria || "") === c);
      const titolo = c
        ? `<li class="menu-sotto-titolo" aria-hidden="true">${e(c)}</li>`
        : "";
      return titolo + voci.map((f) => htmlPagina(f, ctx)).join("");
    })
    .join("");
};

function htmlPagina(p, ctx) {
  const figli = ctx.figli.get(chiave(p.url)) || [];
  const sezioni = p.sezioni && p.sezioni.length ? p.sezioni : [];
  const qui = chiave(p.url) === ctx.corrente;
  const dentro = qui || ctx.antenati.has(chiave(p.url));
  // Prima le sezioni della pagina, poi le pagine figlie divise per categoria
  const interno =
    htmlSezioni(p, qui && ctx.live.length ? ctx.live : sezioni) +
    htmlFigli(figli, ctx);
  const attr = qui ? ' aria-current="page" class="is-attivo"' : "";
  const classifica = p.classifica ? " data-classifica" : "";
  const freccia = interno
    ? `<button type="button" class="menu-espandi" aria-expanded="${dentro}" aria-label="Mostra o nascondi: ${e(p.titolo)}"><span class="menu-freccia" aria-hidden="true"></span></button>`
    : "";
  const sotto = interno
    ? `<ul class="menu-sotto"${dentro ? "" : " hidden"}>${interno}</ul>`
    : "";
  return `<li class="menu-pagina" data-nome="${e(p.titolo)}"><div class="menu-riga"><a href="${e(p.url)}"${classifica}${attr}>${icona(p)}<span>${e(p.titolo)}</span></a>${freccia}</div>${sotto}</li>`;
}

const htmlEsterno = (x) =>
  `<li data-nome="${e(x.titolo)}"><a href="${e(x.url)}" target="_blank" rel="noopener">${icona(x)}<span>${e(x.titolo)}</span></a></li>`;

// ctx: { corrente, live } -> markup di tutti i gruppi
export const htmlMenu = (indice, ctx) => {
  const figli = new Map();
  const note = new Set(indice.pagine.map((p) => chiave(p.url)));
  const radici = [];
  indice.pagine.forEach((p) => {
    const k = p.padre ? chiave(p.padre) : "";
    if (k && note.has(k)) figli.set(k, [...(figli.get(k) || []), p]);
    else radici.push(p);
  });
  const antenati = new Set();
  indice.pagine.forEach((p) => {
    if (chiave(p.url) === ctx.corrente && p.padre)
      antenati.add(chiave(p.padre));
  });
  const piano = { ...ctx, figli, antenati };

  return GRUPPI.map((g) => {
    const pagine = radici.filter((p) => (p.gruppo || "altro") === g.id);
    const esterni = g.id === "altro" ? indice.esterni || [] : [];
    if (!pagine.length && !esterni.length) return "";
    const aperto =
      g.id === "principale" ||
      pagine.some(
        (p) =>
          chiave(p.url) === ctx.corrente ||
          (figli.get(chiave(p.url)) || []).some(
            (f) => chiave(f.url) === ctx.corrente,
          ),
      );
    return `<details class="menu-gruppo" data-gruppo="${g.id}"${aperto ? " open" : ""}><summary><span class="menu-gruppo-pallino" style="background:${g.colore}"></span>${e(g.titolo)}</summary><ul>${pagine.map((p) => htmlPagina(p, piano)).join("")}${esterni.map(htmlEsterno).join("")}</ul></details>`;
  }).join("");
};
