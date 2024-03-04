const data = {
  "2020-2021": 1305,
  "2021-2022": 729,
  "2022-2023": 806,
  "2023-2024": 1763,
};

const labels = Object.keys(data);
const values = Object.values(data);
const totale = values.reduce((acc, cur) => acc + cur, 0);

const avgValues = labels.map((label) =>
  ((data[label] / totale) * 100).toFixed(2)
);

const datasets = [
  {
    label: "km Autunno - Inverno",
    backgroundColor: ["yellowgreen", "skyblue", "#ba690c", "blue"],
    borderColor: Array(4).fill("black"),
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
    <div class="Autunno-Invernocontorno">
      <a href="Autunno_Inverno/Autunno_Inverno${label}.html">
        <img class="immaginestagione" src="Icone/inverno.png">
        <p class="titoli">Autunno - Inverno ${label}
          <p>Totale km <img src="Icone/traguardo.png"> 
            ${values[index]}</p> <p> ${avgValues[index]} % </p>
        </p>
      </a>
    </div>
`
  )
  .join("");

document.getElementById(
  "stampa"
).innerHTML = `<div class="container">${stampa}</div>`;

const avgAI = (totale / labels.length).toFixed(2);

const stampaAI = `
<div class="colore">
    <p>Totale km percorsi in Autunno - Inverno ${totale} <img src="Icone/traguardo.png"> </p>
    <p>media km per stagione ${avgAI} </p>
</div>`;
document.getElementById("totale").innerHTML = stampaAI;

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".container");
  const items = document.querySelectorAll(".Autunno-Invernocontorno");
  const isOdd = items.length % 2 !== 0;

  if (isOdd) container.classList.add("odd-items");
});