// ============================================================
// tabella.js — Tabella mese per mese con anno e percentuale
// Dipendenze: JS/utils.js (formatNumber)
// Richiamato da Statistiche/Js/History/GraficoTotale.js
// ============================================================

window.GraficoTotale = window.GraficoTotale || {};

(function (GT) {
  "use strict";

  GT.createTable = function (mesi, chilometri, percentuali, anni) {
    return `
      <tr class="grassetto">
        <th>Mese</th>
        <th>km <img src="../../Icons/traguardo.png"></th>
        <th>Percentuale sul totale</th>
        <th>Anno</th>
       </tr>
      ${mesi
        .map(
          (mese, index) => `
         <tr>
           <td>${mese || "N/D"}</td>
           <td>${formatNumber(chilometri[index] || 0)}</td>
           <td>${percentuali[index] || "0,00"} %</td>
           <td>${anni[index] || "N/D"}</td>
         </tr>`,
        )
        .join("")}
    `;
  };
})(window.GraficoTotale);
