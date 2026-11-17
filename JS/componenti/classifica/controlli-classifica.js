// controlli-classifica.js — <gib-controlli-classifica>: Cerca + Ordine + km + Reset.
//
// <gib-controlli-classifica scheda="mesi"
//    ricerca-etichetta="Cerca per nome del mese"
//    ordine-etichetta="Ordina la classifica dei mesi"
//    ordini="media corse mediamese"   (gruppi di ordinamento in più, facoltativo)
//    lunghezza                        (testi "più lungo", scheda Giri)
//    max-esempio="300"></gib-controlli-classifica>
//
// Genera lo stesso markup di prima (<div class="classifica-controlli" id="controlli-<scheda>">):
// classifica-controlli.js e stato-url.js lo trovano come sempre.

import { escapeHtml } from "../comune/escape-html.js";
import { ricerca } from "./ricerca.js";
import { ordine } from "./ordine.js";
import { intervalloKm } from "./intervallo-km.js";
import { azzera } from "./azzera.js";

export class GibControlliClassifica extends HTMLElement {
  connectedCallback() {
    if (this.dataset.pronto) return;
    this.dataset.pronto = "1";
    this.style.display = "contents";

    const scheda = this.getAttribute("scheda") || "";
    const extra = (this.getAttribute("ordini") || "")
      .split(/\s+/)
      .filter(Boolean);

    this.innerHTML = `<div class="classifica-controlli" id="controlli-${escapeHtml(scheda)}">
            ${ricerca(scheda, this.getAttribute("ricerca-etichetta") || "Cerca")}
            ${ordine(this.getAttribute("ordine-etichetta") || "Ordina la classifica", extra, this.hasAttribute("lunghezza"))}
            <div class="classifica-range">
              ${intervalloKm(this.getAttribute("max-esempio") || "300")}
              ${azzera()}
            </div>
          </div>`;
  }
}
