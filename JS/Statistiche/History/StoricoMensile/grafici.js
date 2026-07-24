// ============================================================
// grafici.js — Riquadri dei grafici e impostazioni di Chart.js
// Dipendenze: Chart.js, JS/utils.js, StoricoMensile/tabella.js, comune/config-mesi.js
// Richiamato da Statistiche/Js/History/StoricoMensile.js
// ============================================================

window.StoricoMensile = window.StoricoMensile || {};

(function (SM) {
  "use strict";

  SM.createConfig = (type, datasets) => ({
    type: type,
    data: { labels: ConfigMesi.elenco, datasets: datasets },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (value) => formatNumber(value) },
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

  SM.renderCharts = function (datasets, yearLabels) {
    const graficiDiv = document.getElementById("Grafici");
    graficiDiv.innerHTML = "";

    graficiDiv.appendChild(SM.renderTable(datasets, yearLabels));

    const canvasWrapper = document.createElement("div");
    canvasWrapper.innerHTML = `
      <div class="grafico"><canvas id="line-chart"></canvas></div>
      <div class="grafico"><canvas id="bar-chart"></canvas></div>
    `;
    graficiDiv.appendChild(canvasWrapper);

    const ctxline = document.getElementById("line-chart").getContext("2d");
    const ctxbar = document.getElementById("bar-chart").getContext("2d");
    new Chart(ctxline, SM.createConfig("line", datasets));
    new Chart(ctxbar, SM.createConfig("bar", datasets));
  };
})(window.StoricoMensile);
