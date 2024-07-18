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
  ],
  dati = [
    {
      label: "2020",
      color: "yellow",
      data: [0, 0, 0, 0, 45, 367, 627, 691, 291, 0, 192, 243],
    },
    {
      label: "2021",
      color: "lightgreen",
      data: [152, 315, 302, 323, 180, 270, 401, 174, 75, 216, 66, 140],
    },
    {
      label: "2022",
      color: "orange",
      data: [65, 242, 244, 92, 270, 279, 601, 542, 604, 627, 133, 109],
    },
    {
      label: "2023",
      color: "cyan",
      data: [127, 148, 194, 103, 242, 265, 422, 426, 712, 420, 299, 558],
    },
    {
      label: "2024",
      color: "red",
      data: [486, 0, 386, 1022, 762, 623, 326],
    },
  ],
  configline = {
    type: "line",
    data: {
      labels: mesi,
      datasets: [],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  },
  configbar = {
    type: "bar",
    data: {
      labels: mesi,
      datasets: [],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

dati.forEach((anno) => {
  configline.data.datasets.push({
    label: anno.label,
    backgroundColor: anno.color,
    borderColor: anno.color,
    borderWidth: 3,
    data: anno.data,
  });

  configbar.data.datasets.push({
    label: anno.label,
    backgroundColor: anno.color,
    borderColor: anno.color,
    borderWidth: 3,
    data: anno.data,
  });
});

document.getElementById("Grafici").innerHTML = `
  <canvas id="line-chart"></canvas>
  <br>
  <canvas id="bar-chart"></canvas>
`;

const ctxline = document.getElementById("line-chart").getContext("2d"),
  ctxbar = document.getElementById("bar-chart").getContext("2d");

new Chart(ctxline, configline);
new Chart(ctxbar, configbar);