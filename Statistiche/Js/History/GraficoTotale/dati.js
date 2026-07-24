// ============================================================
// dati.js — Legge i dati di ogni anno e li ordina per anno e mese
// Dipendenze: JS/json.js, JS/utils.js, History/comune/config-mesi.js
// Richiamato da Statistiche/Js/History/GraficoTotale.js
// ============================================================

window.GraficoTotale = window.GraficoTotale || {};

(function (GT) {
  "use strict";

  // Un anno che non si carica non deve far sparire tutti gli altri.
  GT.fetchYearData = async function (url, year) {
    const data = await Json.leggiOppureNull(url);
    if (!data || typeof data !== "object") return null;
    if (!data.year && year) data.year = year;
    return data;
  };

  GT.calculateTotals = function (yearlyData) {
    const combinedData = [];
    yearlyData.forEach((item) => {
      if (!item || !item.data) return;
      const year = item.year || "Sconosciuto";
      for (const mese in item.data) {
        if (item.data.hasOwnProperty(mese)) {
          combinedData.push({ mese, chilometri: item.data[mese], year });
        }
      }
    });

    combinedData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return (ConfigMesi.ordine[a.mese] || 0) - (ConfigMesi.ordine[b.mese] || 0);
    });

    const totale = combinedData.reduce((acc, item) => acc + item.chilometri, 0);
    const chilometri = [],
      mesi = [],
      anni = [],
      percentuali = [];

    combinedData.forEach(({ chilometri: km, mese, year }) => {
      chilometri.push(km);
      mesi.push(mese);
      anni.push(year);
      percentuali.push(formatPercentage(totale > 0 ? (km / totale) * 100 : 0));
    });

    return { totale, chilometri, mesi, anni, percentuali };
  };
})(window.GraficoTotale);
