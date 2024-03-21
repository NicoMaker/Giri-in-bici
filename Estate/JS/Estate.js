const data = {
  2020: 2021,
  2021: 743,
  2022: 2085,
  2023: 1622,
};

const labels = Object.keys(data),
  values = Object.values(data),
  totale = values.reduce((acc, cur) => acc + cur, 0),
  avgValues = labels.map((label) => ((data[label] / totale) * 100).toFixed(2)),
  datasets = [
    {
      label: "km Estate",
      backgroundColor: ["yellow", "orange", "red", "purple"],
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
    <div class="Estatecontorno">
      <a href="Estate/Periodi/${label}.html">
        <img class="immaginestagione" src="Icone/estate.png">
        <p class="titoli">
            Estate ${label}
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

const avgE = (totale / labels.length).toFixed(2),
  corse = 91,
  avgcorssa = (totale / corse).toFixed(2);

const stampaE = `
<div class="colore">
    <p>Totale km percorsi in Estate ${totale} <img src="Icone/traguardo.png"> </p>
    <p>km medi per corsa in Estate ${avgcorssa} </p>
    <p>media km per stagione ${avgE} </p>
</div>`;
document.getElementById("totale").innerHTML = stampaE;

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".container"),
    items = document.querySelectorAll(".Estatecontorno"),
    isOdd = items.length % 2 !== 0;

  if (isOdd) container.classList.add("odd-items");
});