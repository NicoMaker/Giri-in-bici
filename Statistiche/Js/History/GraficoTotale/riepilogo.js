// ============================================================
// riepilogo.js — Riquadro con i totali di tutti gli anni
// Dipendenze: JS/utils.js (formatItalianNumber)
// Richiamato da Statistiche/Js/History/GraficoTotale.js
// ============================================================

window.GraficoTotale = window.GraficoTotale || {};

(function (GT) {
  "use strict";

  GT.createSummary = function (
    totale,
    kmMediPerCorsa,
    kmMediPerMese,
    totaleCorse,
    racesPerYear,
    racesPerMonth,
    mesi,
  ) {
    return `
      <a href="Statistiche_Mensili.html">
        <div class="colore">
          <p class="misuracolore">Totale km ${formatItalianNumber(totale)} <img src="../../Icons/traguardo.png"></p>
          <p class="misuracolore">km medi per corsa ${kmMediPerCorsa}</p>
          <p class="misuracolore">Km medi per mese ${kmMediPerMese}</p>
          <p class="misuracolore">Totale corse ${formatItalianNumber(totaleCorse)}</p>
          <p class="misuracolore">Corse medie per anno ${racesPerYear}</p>
          <p class="misuracolore">Corse medie per mese ${racesPerMonth}</p>
          <p class="misuracolore">Totale mesi di corsa ${formatItalianNumber(mesi.length)}</p>
        </div>
      </a>`;
  };
})(window.GraficoTotale);
