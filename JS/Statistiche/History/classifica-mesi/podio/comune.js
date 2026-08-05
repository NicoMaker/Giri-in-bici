// ============================================================
// comune.js — Markup condiviso da tutte le schede della pagina
// Classifica dei mesi: le medaglie del podio e la riga di totale
// in fondo a ogni classifica.
// Dipendenze: JS/utils.js (formatItalianNumber)
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  CM.MEDAGLIE = ["🥇", "🥈", "🥉"];

  // Riga di chiusura con il totale: uguale nell'aspetto alle righe
  // normali, ma senza numero di posizione né barra, cosi' si legge
  // subito come somma finale e non come un'altra voce in classifica.
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
