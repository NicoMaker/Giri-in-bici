// barra.js — <gib-barra>: la barra in alto, assemblata dai pezzi qui accanto.
//
// Attributi: indietro, indietro-titolo, stagioni, menu, menu-etichetta, posizione.
// Il markup è identico a quello di prima (niente Shadow DOM): CSS e script
// esistenti (.site-bar, .Icons a, data-classifica, .hamburger) continuano a funzionare.

import { logo } from "./logo.js";
import { iconeNavigazione } from "./icone-navigazione.js";
import { linkStagioni } from "./link-stagioni.js";
import { hamburger } from "./hamburger.js";
import { posizione } from "./posizione.js";

export class GibBarra extends HTMLElement {
  connectedCallback() {
    if (this.dataset.pronto) return;
    this.dataset.pronto = "1";
    this.style.display = "contents"; // conta solo il <header> interno

    this.innerHTML = `<header class="site-bar">
  ${logo()}
  ${iconeNavigazione(this.getAttribute("indietro"), this.getAttribute("indietro-titolo"))}
  ${linkStagioni(this.hasAttribute("stagioni"))}${hamburger(this.getAttribute("menu"), this.getAttribute("menu-etichetta"))}${posizione(this.getAttribute("posizione"))}
</header>`;
  }
}
