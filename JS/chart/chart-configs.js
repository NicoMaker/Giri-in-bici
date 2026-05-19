// File di configurazione centralizzato per tutti i grafici
const ChartConfigs = {
  formatNumber: (value) => {
    return ChartConfigs.formatItalianNumber(value);
  },

  formatItalianNumber: (num, forceDecimals = false, isPercentage = false) => {
    if (typeof num === "string") num = parseFloat(num);
    if (isNaN(num)) return "0";

    const numStr = num.toString();
    const parts = numStr.split(".");
    let integerPart = parts[0];
    let decimalPart = parts[1] || "";
    let decimalString = "";

    if (forceDecimals || isPercentage || !Number.isInteger(num)) {
      decimalPart = num.toFixed(2).split(".")[1];
      decimalString = decimalPart !== "00" ? "," + decimalPart : "";
    } else if (decimalPart !== "") {
      decimalString = "," + decimalPart;
    }

    if (integerPart.length > 3) {
      const groups = [];
      let i = integerPart.length;
      while (i > 0) {
        const start = Math.max(0, i - 3);
        groups.unshift(integerPart.substring(start, i));
        i -= 3;
      }
      integerPart = groups.join(".");
    }

    return integerPart + decimalString;
  },

  // Doughnut
  doughnut: {
    type: "doughnut",
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: { size: 12, weight: "bold" },
            padding: 15,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentageRaw = (value / total) * 100;
              const percentage =
                ChartConfigs.formatItalianNumber(percentageRaw);
              return `${label}: ${ChartConfigs.formatItalianNumber(value)} km (${percentage}%)`;
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
          ticks: {
            callback: function (value) {
              return ChartConfigs.formatItalianNumber(value);
            },
          },
        },
        x: {
          title: { display: true },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const km = ChartConfigs.formatItalianNumber(context.raw);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentageRaw = total > 0 ? (context.raw / total) * 100 : 0;
              const percentage = ChartConfigs.formatItalianNumber(
                percentageRaw,
                true,
              );
              return `${context.dataset.label}: ${km} km (${percentage}%)`;
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
          ticks: {
            callback: function (value) {
              return ChartConfigs.formatItalianNumber(value);
            },
          },
        },
        x: {
          title: { display: true },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const km = ChartConfigs.formatItalianNumber(context.raw);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentageRaw = total > 0 ? (context.raw / total) * 100 : 0;
              const percentage = ChartConfigs.formatItalianNumber(
                percentageRaw,
                true,
              );
              return `${context.dataset.label}: ${km} km (${percentage}%)`;
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
