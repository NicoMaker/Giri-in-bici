// ============================================================
// grafici.js — I due grafici della pagina stagioni
//
// Andamento a linea e ripartizione a ciambella. Il grafico a linea
// si ridisegna da solo; per la ciambella l'ordine di distruzione e'
// deciso da stagioni.js, che la elimina prima di riscrivere le schede.
//
// Dipendenze: Chart.js (CDN)
//             JS/utils.js (formatItalianNumber, formatNumber)
//             Statistiche/Js/stagioni/dati.js (CHART_CONFIG)
// ============================================================

window.Stagioni = window.Stagioni || {};

(function (S) {
  "use strict";

  // Grafico a linea
  S.disegnaGraficoLinea = function (labels, chartData) {
    const lineCanvas = document.getElementById("line-chart");
    if (!lineCanvas) return;

    if (window.myLineChart) window.myLineChart.destroy();
    window.myLineChart = new Chart(lineCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "km stagioni (andamento)",
            data: chartData,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "transparent",
            borderWidth: 3,
            pointBackgroundColor: "rgba(54, 162, 235, 1)",
            pointBorderColor: "rgba(255, 255, 255, 1)",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.35,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Chilometri" },
            ticks: { callback: (value) => formatItalianNumber(value) },
          },
          x: { title: { display: true } },
        },
        plugins: {
          legend: {
            position: "top",
            labels: { font: { size: 12, weight: "bold" } },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const km = formatNumber(context.raw);
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = formatItalianNumber(
                  total > 0 ? (context.raw / total) * 100 : 0,
                  true,
                );
                return `${context.dataset.label}: ${km} km (${pct}%)`;
              },
            },
          },
        },
      },
    });
  };

  // Grafico a ciambella
  S.disegnaGraficoCiambella = function (canvas, labels, chartData) {
    window.myChart = new Chart(canvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            label: "km totali stagione",
            backgroundColor: S.CHART_CONFIG.colors || [
              "#ff9999",
              "#66b3ff",
              "#99ff99",
            ],
            borderColor: S.CHART_CONFIG.borderColor || "black",
            borderWidth: S.CHART_CONFIG.borderWidth || 1,
            data: chartData,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: { font: { size: 12, weight: "bold" } },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = formatItalianNumber((value / total) * 100, true);
                return `${context.label}: ${formatNumber(value)} km (${pct}%)`;
              },
            },
          },
        },
      },
    });
  };
})(window.Stagioni);
