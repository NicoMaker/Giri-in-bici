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

  function createDataset(yearData, yearLabel, yearColor) {
    const data = new Array(12).fill(0); 

    for (const [month, value] of Object.entries(yearData.data)) {
      const monthIndex = mesi.indexOf(month);
      if (monthIndex !== -1)
        data[monthIndex] = value;
    }

    return {
      label: yearLabel,
      backgroundColor: yearColor,
      borderColor: yearColor,
      borderWidth: 3,
      data: data,
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
    .then((yearsData) => {
      const datasetsPromises = Object.values(yearsData).map(yearInfo =>
        fetch(yearInfo.data)
          .then((response) => response.json())
          .then((yearData) => createDataset(yearData, yearInfo.label, yearInfo.color))
      );

      return Promise.all(datasetsPromises);
    })
    .then((datasets) => {
      renderCharts(datasets);
    })
    .catch((error) => console.error("Error loading the data:", error));
});