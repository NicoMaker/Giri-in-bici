// ============================================================
// StoricoMensile.js — Avvio della pagina Storico Mensile
//
// Solo l'avvio. I pezzi stanno in History/StoricoMensile/:
//   dati.js        i dodici valori mensili di ogni anno
//   variazioni.js  confronto mese su mese e distintivi colorati
//   tabella.js     tabella dello storico
//   grafici.js     riquadri e impostazioni dei grafici
// L'ordine dei mesi arriva da History/comune/config-mesi.js
//
// Dipendenze: Chart.js, JS/utils.js
// ============================================================

const SM = window.StoricoMensile;

document.addEventListener("DOMContentLoaded", () => {
  // Carica la configurazione, poi carica i dati e disegna
  ConfigMesi.carica().then(() => {
    Json.leggi("json/Statistiche/History/StoricoMensile.json")
      .then((yearsData) => {
        const yearLabels = Object.values(yearsData).map((y) => y.label);
        const datasetsPromises = Object.values(yearsData).map((yearInfo) =>
          Json.leggi(yearInfo.data).then((yearData) =>
            SM.createDataset(yearData, yearInfo.label, yearInfo.color),
          ),
        );
        return Promise.all(datasetsPromises).then((datasets) => ({
          datasets,
          yearLabels,
        }));
      })
      .then(({ datasets, yearLabels }) => SM.renderCharts(datasets, yearLabels))
      .catch((error) => console.error(`Error loading the data:, ${error}`));
  });
});
