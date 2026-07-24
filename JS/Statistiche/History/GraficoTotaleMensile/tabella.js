// ============================================================
// tabella.js — Tabella dei dodici mesi con medie e percentuali
// Dipendenze: JS/utils.js (formatItalianNumber)
// Richiamato da Statistiche/Js/History/GraficoTotaleMensile.js
// ============================================================

window.GraficoTotaleMensile = window.GraficoTotaleMensile || {};

(function (GTM) {
  "use strict";

  GTM.createTableHTML = (
    kmPerMese,
    chilometri,
    percentuali,
    mesiPercorsi,
  ) => `
    <tr class="grassetto">
      <th>Mese</th>
      <th>km <img src="/img/Icons/traguardo.png"></th>
      <th>Percentuale sul totale</th>
      <th>Mesi di Corsa</th>
      <th>km <img src="/img/Icons/traguardo.png"> medi mensili</th>
     </tr>
    ${kmPerMese
      .map(
        ({ mese, kmMediMese }, index) => `
      <tr>
        <td>${mese}</td>
        <td>${formatItalianNumber(chilometri[index])}</td>
        <td>${percentuali[index]} %</td>
        <td>${formatItalianNumber(mesiPercorsi[index])}</td>
        <td>${kmMediMese}</td>
      </tr>`,
      )
      .join("")}
  `;
})(window.GraficoTotaleMensile);
