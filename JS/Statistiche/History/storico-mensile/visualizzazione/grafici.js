// ============================================================
// grafici.js — Riquadri dei grafici e impostazioni di Chart.js
// Dipendenze: Chart.js, JS/utils.js, storico-mensile/tabella.js, comune/config-mesi.js
// Richiamato da Statistiche/History/storico-mensile.js
// ============================================================

window.StoricoMensile = window.StoricoMensile || {};

((SM) => {
  "use strict";

  SM.createConfig = (type, datasets, labels) => ({
    type: type,
    data: { labels: labels || ConfigMesi.elenco, datasets: datasets },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (value) => formatNumber(value) },
        },
        x: {
          title: { display: true, text: "Mesi" },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || "";
              const value = context.parsed.y;
              return `${label}: ${formatNumber(value)}`;
            },
          },
        },
      },
    },
  });

  // Pagina completa: filtri, tabella e grafici. Ogni filtro ridisegna tutto
  // (totali, variazioni, percentuali, grafici) solo su quello che si vede.
  SM.renderCharts = (datasets, yearLabels) => {
    const graficiDiv = document.getElementById("Grafici");
    graficiDiv.innerHTML = "";

    const tabellaBox = document.createElement("div");
    const canvasWrapper = document.createElement("div");
    canvasWrapper.innerHTML = `
      <div class="grafico"><canvas id="line-chart"></canvas></div>
      <div class="grafico"><canvas id="bar-chart"></canvas></div>
    `;
    let chartLinea = null;
    let chartBarre = null;

    const ridisegna = () => {
      const vista = SM.applicaFiltri(datasets, yearLabels, filtri.stato);
      filtri.elemento.aggiornaSintesi({
        anni: vista.yearLabels.length,
        mesi: vista.mesi.length,
        totale: vista.totale,
        riferimento: vista.riferimento,
      });
      tabellaBox.replaceChildren(
        SM.renderTable(vista.datasets, vista.yearLabels, {
          mesi: vista.mesi,
          min: vista.min,
          max: vista.max,
        }),
      );
      for (const grafico of [chartLinea, chartBarre]) {
        if (!grafico) continue;
        grafico.data.labels = vista.etichetteMesi;
        grafico.data.datasets = vista.perGrafico;
        grafico.update();
      }
    };

    const filtri = SM.creaFiltri(yearLabels, ridisegna);
    graficiDiv.append(filtri.elemento, tabellaBox, canvasWrapper);

    const vista = SM.applicaFiltri(datasets, yearLabels, filtri.stato);
    const ctxline = document.getElementById("line-chart").getContext("2d");
    const ctxbar = document.getElementById("bar-chart").getContext("2d");
    chartLinea = new Chart(
      ctxline,
      SM.createConfig("line", vista.perGrafico, vista.etichetteMesi),
    );
    chartBarre = new Chart(
      ctxbar,
      SM.createConfig("bar", vista.perGrafico, vista.etichetteMesi),
    );
    ridisegna();
  };
})(window.StoricoMensile);
