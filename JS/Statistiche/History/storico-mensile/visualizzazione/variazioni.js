// ============================================================
// variazioni.js — Calcola la variazione fra due mesi e disegna il distintivo
// Dipendenze: JS/utils.js (formatNumber)
// Richiamato da Statistiche/History/storico-mensile.js
// ============================================================

window.StoricoMensile = window.StoricoMensile || {};

(function (SM) {
  "use strict";

  // Un mese senza uscite l'anno prima vale 0 km (non "dato mancante"):
  // da 0 a qualcosa e' un aumento del 100% (la base zero non permette un
  // calcolo vero, si usa la convenzione +100%), da 0 a 0 e' invariato,
  // da qualcosa a 0 e' il solito -100%.
  SM.calcVariazione = function (valoreAttuale, valorePrecedente) {
    const attuale = valoreAttuale || 0;
    const precedente = valorePrecedente || 0;
    if (precedente === 0) return attuale === 0 ? 0 : 100;
    return ((attuale - precedente) / precedente) * 100;
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
