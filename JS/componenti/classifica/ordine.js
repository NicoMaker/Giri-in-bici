// ordine.js — I pulsanti "Ordina la classifica" (il primo parte attivo).

import { escapeHtml } from "../comune/escape-html.js";
import {
  ORDINE_BASE,
  ORDINE_EXTRA,
  TESTI_LUNGHEZZA,
} from "./opzioni-ordine.js";

export const ordine = (etichetta, gruppiExtra, perLunghezza) => {
  const voci = [...ORDINE_BASE];
  gruppiExtra.forEach((g) => voci.push(...(ORDINE_EXTRA[g] || [])));

  const pulsanti = voci
    .map(([codice, testo], i) => {
      const t =
        perLunghezza && TESTI_LUNGHEZZA[codice]
          ? TESTI_LUNGHEZZA[codice]
          : testo;
      const attivo = i === 0;
      return `<button type="button" class="classifica-ordine__pulsante${attivo ? " attivo" : ""}" data-ordine="${codice}" aria-pressed="${attivo}">${t}</button>`;
    })
    .join("\n              ");

  return `<div class="classifica-ordine" role="group" aria-label="${escapeHtml(etichetta)}">
              ${pulsanti}
            </div>`;
};
