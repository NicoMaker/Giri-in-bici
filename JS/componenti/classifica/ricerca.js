// ricerca.js — Il campo "Cerca" in cima ai controlli della classifica.

import { escapeHtml } from "../comune/escape-html.js";

export function ricerca(scheda, etichetta) {
  const e = escapeHtml(etichetta);
  return `<label class="classifica-ricerca">
              <span class="classifica-ricerca__etichetta">Cerca</span>
              <span class="classifica-ricerca__campo">
                <input type="search" id="ricerca-${escapeHtml(scheda)}" data-ricerca placeholder="${e}…" aria-label="${e}" />
              </span>
            </label>`;
}
