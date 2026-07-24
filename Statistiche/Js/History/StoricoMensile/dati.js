// ============================================================
// dati.js — Trasforma i dati di un anno nei dodici valori mensili
// Dipendenze: History/comune/config-mesi.js
// Richiamato da Statistiche/Js/History/StoricoMensile.js
// ============================================================

window.StoricoMensile = window.StoricoMensile || {};

(function (SM) {
  "use strict";

  SM.createDataset = function (yearData, yearLabel, yearColor) {
    const data = new Array(12).fill(0);
    for (const [month, value] of Object.entries(yearData.data)) {
      const monthIndex = ConfigMesi.elenco.indexOf(month);
      if (monthIndex !== -1) data[monthIndex] = value;
    }
    return {
      label: yearLabel,
      backgroundColor: yearColor,
      borderColor: yearColor,
      borderWidth: 3,
      data: data,
    };
  };
})(window.StoricoMensile);
