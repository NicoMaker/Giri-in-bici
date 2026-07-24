// ============================================================
// riepilogo.js — Riquadro con i totali di tutti gli anni
// Dipendenze: JS/utils.js (formatItalianNumber)
// Richiamato da Statistiche/Js/generaleStatistiche.js
// ============================================================

window.StatGenerali = window.StatGenerali || {};

(function (SG) {
  "use strict";

  SG.renderSummary = (
    totalekm,
    avgkmPerRace,
    avgkmPerYear,
    avgkmPerMonth,
    totaleCorse,
    avgRacesPerYear,
    avgRacesPerMonth,
    totalMonths,
    totalYears,
  ) => {
    const totaleElement = document.getElementById("totale");
    if (totaleElement) {
      totaleElement.innerHTML = `
        <a href="Statistiche/History/Statistiche_Totali.html">
          <div class="colore">
            <p class="misuracolore">Totale km ${formatItalianNumber(totalekm)} <img src="Icons/traguardo.png"></p>
            <p class="misuracolore">km medi per giro ${avgkmPerRace}</p>
            <p class="misuracolore">km medi per anno ${avgkmPerYear}</p>
            <p class="misuracolore">km medi per mese ${avgkmPerMonth}</p>
            <p class="misuracolore">Totale corse ${formatItalianNumber(totaleCorse)}</p>
            <p class="misuracolore">Corse medie per anno ${avgRacesPerYear}</p>
            <p class="misuracolore">Corse medie per mese ${avgRacesPerMonth}</p>
            <p class="misuracolore">Totale anni di corsa ${formatItalianNumber(totalYears)}</p>
            <p class="misuracolore">Totale mesi di corsa ${formatItalianNumber(totalMonths)}</p>
          </div>
        </a>`;
    }
  };
})(window.StatGenerali);
