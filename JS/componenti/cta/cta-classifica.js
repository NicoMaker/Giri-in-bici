// cta-classifica.js — <gib-cta-classifica>: il blocco dei pulsanti "Vedi la classifica ...".
//
// <gib-cta-classifica>
//   <a href="ClassificaMesi.html?vista=mesi">Vedi la classifica dei mesi</a>
// </gib-cta-classifica>
//
// Aggiunge da solo il contenitore .cta-classifica-wrap e la classe
// .cta-classifica ai link (con l'attributo "gruppo" anche
// .cta-classifica-wrap--gruppo, per più pulsanti affiancati). Senza
// JavaScript i link restano comunque cliccabili.

import { avvolgiLink } from "./avvolgi-link.js";

export class GibCtaClassifica extends HTMLElement {
  connectedCallback() {
    if (this.dataset.pronto) return;
    this.dataset.pronto = "1";
    this.style.display = "contents";
    avvolgiLink(this, this.hasAttribute("gruppo"));
  }
}
