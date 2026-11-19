// legenda.js — La legenda della mappa, con "Sei in ..." sempre aggiornato.

import { escapeHtml as e } from "../comune/escape-html.js";
import { GRUPPI } from "../sito/gruppi.js";
import { chiave } from "../sito/percorsi.js";

export const htmlLegenda = () => `
  <div class="mappa-dove" aria-live="polite"><span class="mappa-dove-et">Sei in</span> <strong data-dove>…</strong><span data-dove-sezione></span></div>
  <details class="mappa-leg" open><summary>Legenda</summary>
  <ul class="mappa-chiave">
    ${GRUPPI.map((g) => `<li><span class="mappa-pallino" style="background:${e(g.colore)}"></span>${e(g.titolo)}</li>`).join("")}
    <li><span class="mappa-qui mappa-qui--es">Sei qui</span>la pagina in cui ti trovi</li>
    <li><span class="mappa-linea"></span>fa parte di (struttura)</li>
    <li><span class="mappa-linea mappa-linea--link"></span>link nel contenuto</li>
    <li><span class="mappa-conta">5 sezioni</span>sezioni della pagina: toccale per saltarci</li>
  </ul>
  <p class="mappa-aiuto">Tocca il titolo per aprire la pagina, una sezione per andarci direttamente, <b>⇄</b> per vedere i collegamenti.</p></details>`;

// "Estate › Estate 2022" + la sezione che stai leggendo
export const aggiornaDove = (radice, indice) => {
  const dove = radice.querySelector("[data-dove]");
  const sezione = radice.querySelector("[data-dove-sezione]");
  if (!dove) return;
  const qui = chiave(window.location.href);
  const pagina = indice.pagine.find((p) => chiave(p.url) === qui);
  if (!pagina) {
    dove.textContent = document.title || "questa pagina";
  } else {
    const padre = pagina.padre ? indice.pagine.find((p) => chiave(p.url) === chiave(pagina.padre)) : null;
    dove.textContent = (padre ? `${padre.titolo} › ` : "") + pagina.titolo;
  }
  const attiva = window.GibSezioneAttiva;
  sezione.textContent = attiva ? ` · sezione: ${attiva.titolo}` : "";
};
