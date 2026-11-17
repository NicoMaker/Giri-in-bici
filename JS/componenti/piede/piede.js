// piede.js — <gib-piede>: il piede pagina, assemblato dai pezzi qui accanto.

import { copyright } from "./copyright.js";
import { tricolore } from "./tricolore.js";
import { collegamenti } from "./collegamenti.js";

export class GibPiede extends HTMLElement {
  connectedCallback() {
    if (this.dataset.pronto) return;
    this.dataset.pronto = "1";
    this.style.display = "contents";

    this.innerHTML = `<footer class="site-foot">
  <div class="wrap">
    ${copyright()}
    ${tricolore()}
    ${collegamenti()}
  </div>
</footer>`;
  }
}
