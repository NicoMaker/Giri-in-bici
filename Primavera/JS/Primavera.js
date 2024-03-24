const data = {
  2021: 579,
  2022: 885,
  2023: 742,
  2024: 314,
};

const labels = Object.keys(data),
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
  ];

const doughnutData = {
  labels,
  datasets,
};

const doughnutConfig = {
  type: "doughnut",
  data: doughnutData,
};

const doughnutCtx = document.getElementById("doughnut-chart").getContext("2d");
new Chart(doughnutCtx, doughnutConfig);

const stampa = labels
  .map(
    (label, index) => `
    <div class="Primaveracontorno">
      <a href="Primavera/Periodi/${label}.html">
        <img class="immaginestagione" src="Icone/primavera.png">
        <p class="titoli">
            Primavera ${label}

            <p>Totale km  ${data[label]} 
            <img src="Icone/traguardo.png"></p> 
            <p> ${avgValues[index]} % </p>
        </p>
      </a>
    </div>
`
  )
  .join("");

document.getElementById(
  "stampa"
).innerHTML = `<div class="container">${stampa}</div>`;

const avgP = (totale / labels.length).toFixed(2),
  corse = 41,
  avgcorssa = (totale / corse).toFixed(2);

const stampaP = `
<div class="colore">
    <p>Totale km percorsi in Primavera ${totale} <img src="Icone/traguardo.png"> </p>
    <p>km medi per corsa in Primavera ${avgcorssa} </p>
    <p>media km per stagione ${avgP} </p>
</div>`;
document.getElementById("totale").innerHTML = stampaP;

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".container"),
    items = document.querySelectorAll(".Primaveracontorno"),
    isOdd = items.length % 2 !== 0;

  if (isOdd) container.classList.add("odd-items");
});