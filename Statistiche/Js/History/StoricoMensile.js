document.addEventListener("DOMContentLoaded", () => {
  const mesi = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  function createDataset(data) {
    return {
      label: data.label,
      backgroundColor: data.color,
      borderColor: data.color,
      borderWidth: 3,
      data: data.data,
    };
  }

  const createConfig = (type, datasets) => ({
    type: type,
    data: {
      labels: mesi,
      datasets: datasets,
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  function renderCharts(datasets) {
    document.getElementById("Grafici").innerHTML = `
      <canvas id="line-chart"></canvas>
      <br>
      <canvas id="bar-chart"></canvas>
    `;

    const ctxline = document.getElementById("line-chart").getContext("2d"),
      ctxbar = document.getElementById("bar-chart").getContext("2d"),
      configline = createConfig("line", datasets),
      configbar = createConfig("bar", datasets);

    new Chart(ctxline, configline);
    new Chart(ctxbar, configbar);
  }

  fetch("../Js/History/JSON/StoricoMensile.json")
    .then((response) => response.json())
    .then((data) => {
      const datasets = Object.values(data).map(createDataset);
      renderCharts(datasets);
    })
    .catch((error) => console.error("Error loading the data:", error));
});
