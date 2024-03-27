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
  data = [
    {
      label: "2020",
      backgroundColor: "yellow",
      borderColor: "yellow",
      borderWidth: 3,
      data: [0, 0, 0, 0, 45, 367, 627, 691, 291, 0, 192, 243],
    },
    {
      label: "2021",
      backgroundColor: "lightgreen",
      borderColor: "lightgreen",
      borderWidth: 3,
      data: [152, 315, 302, 323, 180, 270, 401, 174, 75, 216, 66, 140],
    },
    {
      label: "2022",
      backgroundColor: "orange",
      borderColor: "orange",
      borderWidth: 3,
      data: [65, 242, 244, 92, 270, 279, 601, 542, 604, 627, 133, 109],
    },
    {
      label: "2023",
      backgroundColor: "cyan",
      borderColor: "cyan",
      borderWidth: 3,
      data: [127, 148, 194, 103, 242, 265, 422, 426, 712, 420, 299, 558],
    },
    {
      label: "2024",
      backgroundColor: "red",
      borderColor: "red",
      borderWidth: 3,
      data: [486, 0, 314],
    },
  ],
  configline = {
    type: "line",
    data: {
      labels: mesi,
      datasets: data,
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
      datasets: data,
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

document.getElementById("Grafici").innerHTML = `
  <canvas id="line-chart"></canvas>
  <br>
  <canvas id="bar-chart"><canvas>
  `;

const ctxline = document.getElementById("line-chart").getContext("2d"),
  ctxbar = document.getElementById("bar-chart").getContext("2d");

new Chart(ctxline, configline);
new Chart(ctxbar, configbar);