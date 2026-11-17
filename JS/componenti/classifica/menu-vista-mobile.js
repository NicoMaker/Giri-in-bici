// menu-vista-mobile.js — Lo stesso elenco di schede come menu a tendina (schermi stretti).
// autocomplete="off": il browser non deve rimettere un valore vecchio
// (vedi il riallineamento in nucleo/selettore-vista.js).

import { escapeHtml } from "../comune/escape-html.js";
import { VISTE_CLASSIFICA } from "./viste-classifica.js";

export function menuVistaMobile(etichetta) {
  const opzioni = VISTE_CLASSIFICA.map(
    ([codice, testo]) => `<option value="${codice}">${testo}</option>`,
  ).join("\n            ");
  return `<div class="selettore-vista-mobile-wrap">
          <select id="selettore-vista-mobile" autocomplete="off" class="selettore-vista-mobile" aria-label="${escapeHtml(etichetta)}">
            ${opzioni}
          </select>
        </div>`;
}
