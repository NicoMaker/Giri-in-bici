// ============================================================
// calcoli.js — Totali, percentuali e medie mensili
// Dipendenze: JS/utils.js (formatNumber, formatPercentage, formatItalianNumber)
// Richiamato da Statistiche/Js/History/GraficoTotaleMensile.js
// ============================================================

window.GraficoTotaleMensile = window.GraficoTotaleMensile || {};

(function (GTM) {
  "use strict";

  GTM.getTotale = (chilometri) =>
    chilometri.reduce((acc, curr) => acc + curr, 0);
  GTM.getPercentuali = (chilometri, totale) =>
    chilometri.map((km) => formatPercentage((km / totale) * 100));
  GTM.getMediaPer12 = (totale) => formatNumber(totale / 12);

  GTM.getkmPerMese = (mesi, chilometri, mesiPercorsi) =>
    mesi.map((mese, index) => ({
      mese,
      kmMediMese:
        mesiPercorsi[index] > 0
          ? formatItalianNumber(chilometri[index] / mesiPercorsi[index], true)
          : "0,00",
    }));

  GTM.getTotaleCorse = (allData) =>
    allData.reduce((total, json) => total + (json.numberOfRaces || 0), 0);
})(window.GraficoTotaleMensile);
