// ============================================================
// tabella.js — Tabella dei dodici mesi con medie e percentuali
// Dipendenze: JS/utils.js (formatItalianNumber)
// Richiamato da Statistiche/History/statistiche-mensili.js
// ============================================================

window.GraficoTotaleMensile = window.GraficoTotaleMensile || {};

(function (GTM) {
  "use strict";

  GTM.createTableHTML = (kmPerMese, chilometri, percentuali, mesiPercorsi) => `
    <tr class="grassetto">
      <th>Mese</th>
      <th>Distanza (km) <img src="/img/Icons/traguardo.png"></th>
      <th>Percentuale sul totale</th>
      <th>Mesi di Corsa</th>
      <th>Media mensile (km)</th>
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
