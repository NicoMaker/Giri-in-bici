// ============================================================
// comune.js — Medaglie e riga totale
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  CM.MEDAGLIE = ["🥇", "🥈", "🥉"];

  CM.creaRigaTotale = function (totaleKm, etichetta) {
    return `
      <li class="classifica-riga classifica-riga--totale">
        <span class="classifica-riga__posizione" aria-hidden="true">&sum;</span>
        <span class="classifica-riga__mese">Totale ${etichetta}</span>
        <span class="classifica-riga__barra"></span>
        <span class="classifica-riga__km">${formatItalianNumber(totaleKm)} km</span>
        <span class="classifica-riga__percentuale">100 %</span>
      </li>`;
  };
})(window.ClassificaMesi);
