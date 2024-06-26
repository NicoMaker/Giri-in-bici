const data = {
    "2020-2021": 1305,
    "2021-2022": 729,
    "2022-2023": 806,
    "2023-2024": 1763
  },
  labels = Object.keys(data),
  values = Object.values(data),
  totale = values.reduce((acc, cur) => acc + cur, 0),
  avgValues = labels.map((label) => ((data[label] / totale) * 100).toFixed(2)),
  datasets = [
    {
      label: "km Autunno - Inverno",
      backgroundColor: ["yellowgreen", "skyblue", "#ba690c", "blue"],
      borderColor: ["black"],
      borderWidth: 1,
      data: values,
    },
  ],
  doughnutData = {
    labels,
    datasets,
  },
  doughnutConfig = {
    type: "doughnut",
    data: doughnutData,
  },
  doughnutCtx = document.getElementById("doughnut-chart").getContext("2d"),
  stampa = labels
    .map(
      (label, index) => `
      <div class="Autunno-Invernocontorno">
        <a href="Autunno_Inverno/Periodi/${label}.html">
          <img class="immaginestagione" src="Icons/inverno.png">
          <p class="titoli">Autunno - Inverno ${label}
            <p>Totale km 
              ${values[index]} 
              <img src="Icons/traguardo.png"> </p> 
              <p> ${avgValues[index]} % </p>
          </p>
        </a>
      </div>
  `
    )
    .join("");

(document.getElementById(
  "stampa"
).innerHTML = `<div class="container">${stampa}</div>`),
  (avgAI = (totale / labels.length).toFixed(2)),
  (corse = 70),
  (avgcorsa = (totale / corse).toFixed(2)),
  (stampaAI = `
  <div class="colore">
      <p>Totale km percorsi in Autunno - Inverno ${totale} <img src="Icons/traguardo.png"> </p>
      <p>km medi per corsa in Autunno-Inverno ${avgcorsa} </p>
      <p>media km per stagione ${avgAI} </p>
  </div>`);
document.getElementById("totale").innerHTML = stampaAI;

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".container"),
    items = document.querySelectorAll(".Autunno-Invernocontorno"),
    isOdd = items.length % 2 !== 0;

  if (isOdd) container.classList.add("odd-items");
});

new Chart(doughnutCtx, doughnutConfig);