// hamburger.js — Il pulsante del menu a tendina (pagine Home e Bici).

import { escapeHtml } from "../comune/escape-html.js";

export function hamburger(icona, etichetta) {
  if (!icona) return "";
  return `<button class="hamburger" type="button" aria-label="${escapeHtml(etichetta || "Apri il menu")}"><i class="MenuIcon"><span data-icona="${escapeHtml(icona)}"></span></i><i class="CloseIcon"><span data-icona="chiudi"></span></i></button>`;
}
