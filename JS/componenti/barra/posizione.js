// posizione.js — "Sei in Classifica › Mesi migliori" (la scheda la aggiorna selettore-vista.js).

import { escapeHtml } from "../comune/escape-html.js";

export const posizione = (sezione) => {
  if (!sezione) return "";
  return `<p class="site-bar__posizione" aria-live="polite"><span class="site-bar__posizione-etichetta">Sei in</span> <span class="site-bar__posizione-classifica">${escapeHtml(sezione)}</span> <span class="site-bar__posizione-sep" aria-hidden="true">›</span> <strong class="site-bar__posizione-vista" id="posizione-vista">Mesi migliori</strong></p>`;
};
