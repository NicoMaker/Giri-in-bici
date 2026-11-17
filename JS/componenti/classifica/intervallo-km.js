// intervallo-km.js — Il filtro "Da ... A ... km" con le scorciatoie Min / Max.

import { escapeHtml } from "../comune/escape-html.js";

function campo(nome, etichetta, segnaposto, ariaLabel, azione, testoAzione) {
  return `<label class="classifica-range__campo">
                <span class="classifica-range__etichetta">${etichetta}</span>
                <input type="number" inputmode="numeric" min="0" step="1" data-range="${nome}" placeholder="${escapeHtml(segnaposto)}" aria-label="${ariaLabel}" />
                <span class="classifica-range__unita">km</span>
                <button type="button" class="classifica-range__rapido" data-azione="${azione}">${testoAzione}</button>
              </label>`;
}

export function intervalloKm(esempioMax) {
  return `${campo("min", "Da", "0", "Chilometri minimi", "min", "Min")}
              ${campo("max", "A", esempioMax, "Chilometri massimi", "max", "Max")}`;
}
