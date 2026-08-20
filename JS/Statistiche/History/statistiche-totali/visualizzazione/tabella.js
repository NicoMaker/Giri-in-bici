// ============================================================
// tabella.js — Tabella mese per mese con anno e percentuale
// Dipendenze: JS/utils.js (formatNumber)
// Richiamato da Statistiche/History/statistiche-totali.js
// ============================================================

window.GraficoTotale = window.GraficoTotale || {};

(function (GT) {
  "use strict";

  GT.createTable = function (mesi, chilometri, percentuali, anni) {
    return `
      <tr class="grassetto">
        <th>Mese</th>
        <th>Distanza (km) <img src="/img/Icons/traguardo.png"></th>
        <th>Percentuale sul totale</th>
       </tr>
      ${mesi.map((mese, index) => `<tr><td class="td-anno">${mese ? `${mese} ${anni[index] || ""}`.trim() : "N/D"}</td><td>${formatNumber(chilometri[index] || 0)}</td><td>${percentuali[index] || "0,00"} %</td></tr>`).join("")}
    `;
  };
})(window.GraficoTotale);
