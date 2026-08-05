// ============================================================
// chart-renderer.js — Avvio del renderer universale per grafici
//
// Solo l'istanza globale. La classe e i suoi metodi stanno in
// chart-renderer/:
//   nucleo.js              costruttore e metodi generali
//   processori-pagine.js   dati di stagione, statistiche generali, anno
//   processori-storico.js  dati dello storico (totale e mensile)
//
// Dipendenze: chart-configs.js, Chart.js, chart-renderer/nucleo.js,
//             chart-renderer/processori-pagine.js,
//             chart-renderer/processori-storico.js
// ============================================================

window.chartRenderer = new UniversalChartRenderer();

if (typeof module !== "undefined" && module.exports) {
  module.exports = UniversalChartRenderer;
}
