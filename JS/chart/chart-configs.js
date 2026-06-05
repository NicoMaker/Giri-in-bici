// chart-configs.js — Configurazione centralizzata per tutti i grafici
// Dipendenze: JS/utils.js (caricato prima in HTML)

const ChartConfigs = {
  // Alias per compatibilità con StoricoMensile.js che chiama ChartConfigs.formatItalianNumber
  formatItalianNumber: (num, forceDecimals = false) =>
    formatItalianNumber(num, forceDecimals),

  formatNumber: (value) => formatNumber(value),

  // Doughnut
  doughnut: {
    type: "doughnut",
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top",
          labels: { font: { size: 12, weight: "bold" }, padding: 15 },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = formatItalianNumber((value / total) * 100);
              return `${label}: ${formatItalianNumber(value)} km (${pct}%)`;
            },
          },
        },
      },
    },
  },

  // Bar
  bar: {
    type: "bar",
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Chilometri" },
          ticks: { callback: (value) => formatItalianNumber(value) },
        },
        x: { title: { display: true } },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const km = formatItalianNumber(context.raw);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? formatNumber((context.raw / total) * 100) : "0";
              return `${context.dataset.label}: ${km} km (${pct}%)`;
            },
          },
        },
      },
    },
  },

  // Line
  line: {
    type: "line",
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Chilometri" },
          ticks: { callback: (value) => formatItalianNumber(value) },
        },
        x: { title: { display: true } },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const km = formatItalianNumber(context.raw);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? formatNumber((context.raw / total) * 100) : "0";
              return `${context.dataset.label}: ${km} km (${pct}%)`;
            },
          },
        },
      },
    },
  },

  // Pagine
  pages: {
    stagioni: {
      chartType: "doughnut",
      containerId: "doughnut-chart",
      dataProcessor: "processSeasonData",
    },
    stagioniLine: {
      chartType: "line",
      containerId: "line-chart",
      dataProcessor: "processSeasonData",
    },
    generaleStatistiche: {
      chartType: "doughnut",
      containerId: "doughnut-chart",
      dataProcessor: "processGeneralStatsData",
    },
    generaleStatisticheLine: {
      chartType: "line",
      containerId: "line-chart",
      dataProcessor: "processGeneralStatsData",
    },
    anni: {
      chartType: "bar",
      containerId: "bar-chart",
      dataProcessor: "processYearData",
    },
    anniLine: {
      chartType: "line",
      containerId: "line-chart",
      dataProcessor: "processYearData",
    },
    graficoTotale: {
      chartType: "line",
      containerId: "line-chart",
      dataProcessor: "processTotalHistoryData",
    },
    graficoTotaleMensile: {
      chartType: "bar",
      containerId: "bar-chart",
      dataProcessor: "processMonthlyHistoryData",
    },
    graficoTotaleMensileLine: {
      chartType: "line",
      containerId: "line-chart",
      dataProcessor: "processMonthlyHistoryData",
    },
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = ChartConfigs;
} else {
  window.ChartConfigs = ChartConfigs;
}
