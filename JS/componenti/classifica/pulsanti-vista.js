// pulsanti-vista.js — Le "pillole" per scegliere la scheda (schermi larghi).

import { escapeHtml } from "../comune/escape-html.js";
import { VISTE_CLASSIFICA } from "./viste-classifica.js";

export function pulsantiVista(etichetta) {
  const pulsanti = VISTE_CLASSIFICA.map(
    ([codice, testo]) =>
      `<button type="button" class="selettore-metrica__pulsante" data-vista="${codice}">${testo}</button>`,
  ).join("\n          ");
  return `<div class="selettore-metrica" id="selettore-vista" role="tablist" aria-label="${escapeHtml(etichetta)}">
          ${pulsanti}
        </div>`;
}
