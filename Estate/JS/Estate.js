const data = {
  2020: 2021,
  2021: 743,
  2022: 2085,
  2023: 1622,
};

const labels = Object.keys(data);
const values = Object.values(data);
const totale = values.reduce((acc, cur) => acc + cur, 0);

const avgValues = labels.map((label) =>
  ((data[label] / totale) * 100).toFixed(2)
);

const datasets = [
  {
    label: "km Estate",
    backgroundColor: ["yellow", "orange", "red", "purple"],
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
<div class="Estatecontorno">
    <a href="Estate/Estate${label}.html">
        <img class="immaginestagione" src="Icone/estate.png">
        <p class="titoli">
            Estate ${label}
            <p>Totale km <img src="Icone/traguardo.png"> ${data[label]}</p> 
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

const avgE = (totale / labels.length).toFixed(2);

const stampaE = `
<div class="colore">
    <p>Totale km percorsi in Estate ${totale} <img src="Icone/traguardo.png"> </p>
    <p>media km per stagione ${avgE} </p>
</div>`;
document.getElementById("totale").innerHTML = stampaE;

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".container");
  const items = document.querySelectorAll(".Estatecontorno");
  const isOdd = items.length % 2 !== 0;

  if (isOdd) {
    container.classList.add("odd-items");
  }
});