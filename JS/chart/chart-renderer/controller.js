// ============================================================
// chart-renderer.js — Avvio del renderer universale per grafici
//
// Solo l'istanza globale. La classe e i suoi metodi stanno in
// chart-renderer/:
//   nucleo.js              costruttore e metodi generali
//   data/pagine.js         dati di stagione, statistiche generali, anno
//   data/storico.js        dati dello storico (totale e mensile)
//
// Dipendenze: chart-configs.js, Chart.js, chart-renderer/nucleo.js,
//             chart-renderer/data/pagine.js,
//             chart-renderer/data/storico.js
// ============================================================

window.chartRenderer = new UniversalChartRenderer();

if (typeof module !== "undefined" && module.exports) {
  module.exports = UniversalChartRenderer;
}
