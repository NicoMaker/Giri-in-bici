// ============================================================
// riepilogo.js — Riquadro con i totali complessivi
// Dipendenze: JS/utils.js (formatItalianNumber)
// Richiamato da Statistiche/Js/History/GraficoTotaleMensile.js
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
        <p class="misuracolore">totale km ${formatItalianNumber(totale)} <img src="../../Icons/traguardo.png"></p>
        <p class="misuracolore">km totali medi per mese ${mediaComplessiva}</p>
        <p class="misuracolore">Totale corse ${formatItalianNumber(totaleCorse)}</p>
        <p class="misuracolore">Medie corse per mese (12 mesi) ${mediacorse}</p>
      </div>
    </a>`;
})(window.GraficoTotaleMensile);
