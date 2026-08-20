// ============================================================
// riepilogo.js — Riquadro con i totali complessivi
// Dipendenze: JS/utils.js (formatItalianNumber)
// Richiamato da Statistiche/History/statistiche-mensili.js
// ============================================================

window.GraficoTotaleMensile = window.GraficoTotaleMensile || {};

(function (GTM) {
  "use strict";

  GTM.createSummaryHTML = (
    totale,
    mediaComplessiva,
    totaleCorse,
    mediacorse,
  ) => `
    <a href="StoricoMensile.html">
      <div class="colore">
        <p class="misuracolore">Totale km ${formatItalianNumber(totale)} <img src="/img/Icons/traguardo.png"></p>
        <p class="misuracolore">km medi per mese ${mediaComplessiva}</p>
        <p class="misuracolore">Totale corse ${formatItalianNumber(totaleCorse)}</p>
        <p class="misuracolore">Medie corse per mese (12 mesi) ${mediacorse}</p>
        <span class="colore__vai-a">Vai allo storico mensile <span class="freccia" aria-hidden="true">→</span></span>
      </div>
    </a>`;
})(window.GraficoTotaleMensile);
