// ============================================================
// pagine.js — Trasforma i dati grezzi di una stagione,
// delle statistiche generali o di un anno nel formato dataset che
// Chart.js si aspetta.
//
// Aggiunge i metodi al prototipo di UniversalChartRenderer definita
// in chart-renderer/nucleo.js, che va caricato prima di questo file.
// ============================================================

UniversalChartRenderer.prototype.processSeasonData = async function (
  data,
  chartType,
) {
  const { season, image, path, cssclass, colors, subPeriodData } = data;
  const labels = Object.keys(subPeriodData);
  const values = labels.map((label) => subPeriodData[label].totalDistance);

  if (chartType === "line") {
    return {
      labels,
      datasets: [
        {
          label: `km ${season} (andamento)`,
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
        },
      ],
      metadata: { season, image, path, cssclass },
    };
  }

  return {
    labels,
    datasets: [
      {
        label: `km ${season}`,
        backgroundColor: colors,
        borderColor: ["black"],
        borderWidth: 1,
        data: values,
      },
    ],
    metadata: { season, image, path, cssclass },
  };
};

UniversalChartRenderer.prototype.processGeneralStatsData = async function (
  data,
  chartType,
) {
  const { statistics, colors } = data;
  const labels = statistics.map((entry) => entry.year);
  const values = statistics.map((entry) => entry.km);

  if (chartType === "line") {
    return {
      labels,
      datasets: [
        {
          label: "km totali (andamento)",
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
        },
      ],
    };
  }

  return {
    labels,
    datasets: [
      {
        label: "km totali",
        backgroundColor: colors,
        borderColor: ["black"],
        borderWidth: 1,
        data: values,
      },
    ],
  };
};

UniversalChartRenderer.prototype.processYearData = async function (
  data,
  chartType,
) {
  const { year, data: monthlyData, colors } = data;
  const labels = Object.keys(monthlyData);
  const values = Object.values(monthlyData);

  if (chartType === "line") {
    return {
      labels,
      datasets: [
        {
          label: `km mensili ${year} (andamento)`,
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
        },
      ],
    };
  }

  return {
    labels,
    datasets: [
      {
        label: `km mensili ${year}`,
        backgroundColor: colors,
        borderColor: "black",
        borderWidth: 1,
        data: values,
      },
    ],
  };
};
