// ============================================================
// variazioni.js — Calcola la variazione fra due mesi e disegna il distintivo
// Dipendenze: JS/utils.js (formatNumber)
// Richiamato da Statistiche/Js/History/StoricoMensile.js
// ============================================================

window.StoricoMensile = window.StoricoMensile || {};

(function (SM) {
  "use strict";

  SM.calcVariazione = function (valoreAttuale, valorePrecedente) {
    if (valorePrecedente === 0) return null;
    return ((valoreAttuale - valorePrecedente) / valorePrecedente) * 100;
  };

  SM.badgeVariazione = function (perc) {
    if (perc === null) return `<span class="badge badge-neutro">—</span>`;
    const segno = perc > 0 ? "+" : "";
    const cls = perc > 0 ? "badge-su" : perc < 0 ? "badge-giu" : "badge-pari";
    const freccia = perc > 0 ? "▲" : perc < 0 ? "▼" : "●";
    // formatNumber e' l'unico punto in cui si decide come si scrive un
    // numero: virgola per i decimali e punto per le migliaia, cosi' una
    // variazione oltre il mille si legge "+1.250%" e non "+1250%".
    const percStr = formatNumber(Math.abs(perc));
    const meno = perc < 0 ? "-" : "";
    return `<span class="badge ${cls}">${freccia} ${meno}${segno}${percStr}%</span>`;
  };
})(window.StoricoMensile);
