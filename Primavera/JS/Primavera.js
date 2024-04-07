const data = {
    2021: 579,
    2022: 885,
    2023: 742,
    2024: 650,
  },
  labels = Object.keys(data),
  values = Object.values(data),
  totale = values.reduce((acc, cur) => acc + cur, 0),
  avgValues = labels.map((label) => ((data[label] / totale) * 100).toFixed(2)),
  datasets = [
    {
      label: "km Primavera",
      backgroundColor: ["pink", "antiquewhite", "cyan", "#97ed86ce"],
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
      <div class="Primaveracontorno">
        <a href="Primavera/Periodi/${label}.html">
          <img class="immaginestagione" src="Icons/primavera.png">
          <p class="titoli">
              Primavera ${label}

              <p>Totale km  ${data[label]} 
              <img src="Icons/traguardo.png"></p> 
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
  (avgP = (totale / labels.length).toFixed(2)),
  (corse = 45),
  (avgcorsa = (totale / corse).toFixed(2)),
  (stampaP = `
  <div class="colore">
      <p>Totale km percorsi in Primavera ${totale} <img src="Icons/traguardo.png"> </p>
      <p>km medi per corsa in Primavera ${avgcorsa} </p>
      <p>media km per stagione ${avgP} </p>
  </div>`);
document.getElementById("totale").innerHTML = stampaP;

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".container"),
    items = document.querySelectorAll(".Primaveracontorno"),
    isOdd = items.length % 2 !== 0;

  if (isOdd) container.classList.add("odd-items");
});

new Chart(doughnutCtx, doughnutConfig);