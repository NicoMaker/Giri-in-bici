// selettore-vista.js — <gib-selettore-vista>: la barra per scegliere la scheda
// della Classifica (pillole + menu mobile). Il comportamento (mostra/nascondi
// schede) resta in nucleo/selettore-vista.js.
//
// <gib-selettore-vista etichetta="Scegli cosa vedere"></gib-selettore-vista>

import { pulsantiVista } from "./pulsanti-vista.js";
import { menuVistaMobile } from "./menu-vista-mobile.js";

export class GibSelettoreVista extends HTMLElement {
  connectedCallback() {
    if (this.dataset.pronto) return;
    this.dataset.pronto = "1";
    this.style.display = "contents";

    const etichetta = this.getAttribute("etichetta") || "Scegli cosa vedere";
    this.innerHTML = `<div class="selettore-vista-barra" id="barra-selettore">
        ${pulsantiVista(etichetta)}
        ${menuVistaMobile(etichetta)}
      </div>`;
  }
}
