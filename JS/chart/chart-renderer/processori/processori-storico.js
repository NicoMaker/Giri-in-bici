// ============================================================
// processori-storico.js — Trasforma i dati grezzi dello storico
// (totale e mensile) nel formato dataset che Chart.js si aspetta.
//
// Aggiunge i metodi al prototipo di UniversalChartRenderer definita
// in chart-renderer/nucleo.js, che va caricato prima di questo file.
// ============================================================

UniversalChartRenderer.prototype.processTotalHistoryData = async function (
  data,
) {
  const { labels, values, percentuali } = data;
  return {
    labels: labels.map((mese, index) => `${mese} (${data.anni[index]})`),
    datasets: [
      {
        label: "km mensili per periodo totali",
        backgroundColor: "transparent",
        borderColor: "#14568f",
        borderWidth: 3,
        fill: false,
        data: values,
        percentuali: percentuali,
      },
    ],
  };
};

UniversalChartRenderer.prototype.processMonthlyHistoryData = async function (
  data,
) {
  const { labels, values, colors, percentuali, chartType } = data;

  if (chartType === "line") {
    return {
      labels,
      datasets: [
        {
          label: "km mensili totali (andamento)",
          data: values,
          borderColor: "#14568f",
          backgroundColor: "transparent",
          borderWidth: 3,
          pointBackgroundColor: "#14568f",
          pointBorderColor: "rgba(255, 255, 255, 1)",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.35,
          fill: false,
          percentuali: percentuali,
        },
      ],
    };
  } else {
    return {
      labels,
      datasets: [
        {
          label: "km mensili totali",
          backgroundColor: colors,
          borderColor: ["black"],
          borderWidth: 1,
          data: values,
          percentuali: percentuali,
        },
      ],
    };
  }
};
