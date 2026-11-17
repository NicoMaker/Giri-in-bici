// freccia-indietro.js — La freccia "Torna a ..." (prima voce della barra, se richiesta).

import { escapeHtml } from "../comune/escape-html.js";

export function frecciaIndietro(indirizzo, titolo) {
  if (!indirizzo) return "";
  const t = escapeHtml(titolo || "Indietro");
  return `<a class="colore_apertura" href="${escapeHtml(indirizzo)}" title="${t}" aria-label="${t}"><img src="/img/Icons/freccia.png" alt="" /></a>`;
}
