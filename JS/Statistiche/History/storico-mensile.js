// ============================================================
// storico-mensile.js — Avvio della pagina Storico Mensile
//
// Solo l'avvio. I pezzi stanno in History/storico-mensile/:
//   dati.js        i dodici valori mensili di ogni anno
//   variazioni.js  confronto mese su mese e distintivi colorati
//   tabella.js     tabella dello storico
//   grafici.js     riquadri e impostazioni dei grafici
// L'ordine dei mesi arriva da History/comune/config-mesi.js
//
// Dati letti da json/Statistiche/History/Storico.json (anni +
// coloriAnni): un tempo questa pagina aveva un file a parte,
// StoricoMensile.json, che ripeteva la stessa mappa anno->percorso
// e la stessa lista di colori già presenti in Generale.json.
//
// Dipendenze: Chart.js, JS/utils.js
// ============================================================

const SM = window.StoricoMensile;

document.addEventListener("DOMContentLoaded", () => {
  // Carica la configurazione, poi carica i dati e disegna
  ConfigMesi.carica().then(() => {
    Json.leggi("json/Statistiche/History/Storico.json")
      .then((storico) => {
        const anni = Object.keys(storico.anni);
        const datasetsPromises = anni.map((anno, indice) =>
          Json.leggi(storico.anni[anno]).then((datiAnno) =>
            SM.createDataset(datiAnno, anno, storico.coloriAnni[indice]),
          ),
        );
        return Promise.all(datasetsPromises).then((datasets) => ({
          datasets,
          yearLabels: anni,
        }));
      })
      .then(({ datasets, yearLabels }) => SM.renderCharts(datasets, yearLabels))
      .catch((error) => console.error(`Error loading the data:, ${error}`));
  });
});
