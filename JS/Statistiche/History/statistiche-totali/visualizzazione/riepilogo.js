// ============================================================
// riepilogo.js — Riquadro con i totali di tutti gli anni
// Dipendenze: JS/utils.js (formatItalianNumber)
// Richiamato da Statistiche/History/statistiche-totali.js
// ============================================================

window.GraficoTotale = window.GraficoTotale || {};

((GT) => {
  "use strict";

  GT.createSummary = (
    totale,
    kmMediPerCorsa,
    kmMediPerMese,
    totaleCorse,
    racesPerYear,
    racesPerMonth,
    mesi,
  ) => {
    // null = dato non calcolabile perché i filtri nascondono parte dei mesi
    const nd = (v) => (v == null ? "n/d" : v);
    return `
      <a href="Statistiche_Mensili.html">
        <div class="colore">
          <p class="misuracolore">Totale km ${formatItalianNumber(totale)} <img src="/img/Icons/traguardo.png"></p>
          <p class="misuracolore">km medi per corsa ${kmMediPerCorsa}</p>
          <p class="misuracolore">Km medi per mese ${kmMediPerMese}</p>
          <p class="misuracolore">Totale corse ${totaleCorse == null ? "n/d" : formatItalianNumber(totaleCorse)}</p>
          <p class="misuracolore">Corse medie per anno ${nd(racesPerYear)}</p>
          <p class="misuracolore">Corse medie per mese ${nd(racesPerMonth)}</p>
          <p class="misuracolore">Totale mesi di corsa ${formatItalianNumber(mesi.length)}</p>
          <span class="colore__vai-a">Vai ai totali per mese <span class="freccia" aria-hidden="true">→</span></span>
        </div>
      </a>`;
  };
})(window.GraficoTotale);
