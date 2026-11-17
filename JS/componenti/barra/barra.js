// barra.js — <gib-barra>: la barra in alto, assemblata dai pezzi qui accanto.
//
// Contiene il logo, il link "Stagioni" (se richiesto) e il pulsante hamburger.
// La navigazione del sito sta tutta nel menu a tendina (vedi ../menu/pannello.js).
//
// Attributi: stagioni, posizione, indietro, indietro-titolo.
//   indietro / indietro-titolo  -> "Torna a ..." in cima al menu (pagine di dettaglio)
//
// Il markup è quello di prima (niente Shadow DOM): CSS e script esistenti
// (.site-bar, .hamburger, .menu, data-classifica) continuano a funzionare.

import { logo } from "./logo.js";
import { linkStagioni } from "./link-stagioni.js";
import { hamburger } from "./hamburger.js";
import { posizione } from "./posizione.js";
import { creaPannello, collegaPannello } from "../menu/pannello.js";

export class GibBarra extends HTMLElement {
  connectedCallback() {
    if (this.dataset.pronto) return;
    this.dataset.pronto = "1";
    this.style.display = "contents"; // conta solo il <header> interno

    this.innerHTML = `<header class="site-bar">
  ${logo()}
  ${linkStagioni(this.hasAttribute("stagioni"))}${hamburger()}${posizione(this.getAttribute("posizione"))}
</header>`;

    // Il pannello sta accanto all'<header>, non dentro: la barra ha un filtro
    // di sfocatura e così il pannello resterebbe agganciato a lei invece che alla finestra.
    const pannello = creaPannello({
      indietro: this.getAttribute("indietro"),
      indietroTitolo: this.getAttribute("indietro-titolo"),
    });
    this.appendChild(pannello);

    // La barra lascia il posto all'hamburger (vedi css .con-hamburger)
    document.body.classList.add("con-hamburger");

    collegaPannello(pannello, this.querySelector(".hamburger"));
  }
}
