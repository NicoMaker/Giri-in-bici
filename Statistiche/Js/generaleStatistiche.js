const statistics = [
    { year: 2020, km: 2456 },
    { year: 2021, km: 2614 },
    { year: 2022, km: 3808 },
    { year: 2023, km: 3916 },
    { year: 2024, km: 1766 },
  ],
  totale = statistics.reduce((acc, cur) => acc + cur.km, 0),
  corse = 213,
  avgTot = (totale / corse).toFixed(2),
  avgAnno = (totale / statistics.length).toFixed(2),
  avgMese = (totale / 46).toFixed(2),
  labels = statistics.map((entry) => `Statistiche ${entry.year}`),
  values = statistics.map((entry) => entry.km),
  avgValues = statistics.map((entry) => ((entry.km / totale) * 100).toFixed(2)),
  datasets = [
    {
      label: "km totali",
      backgroundColor: ["yellow", "lightgreen", "orange", "cyan", "red"],
      borderColor: ["black"],
      borderWidth: 1,
      data: values,
    },
  ],
  doughnutData = { labels, datasets },
  doughnutConfig = {
    type: "doughnut",
    data: doughnutData,
  },
  doughnutCtx = document.getElementById("doughnut-chart").getContext("2d"),
  stampa = statistics
    .map(
      (entry, index) => `
      <div class="Statistiche">
        <a href="Statistiche/Anni/${entry.year}.html">
          <img class="immaginestagione" src="Icons/Statistiche.png">
          <p class="titoli"> Statistiche ${entry.year} </p>
          <p> km totali ${entry.km} 
          <img src="Icons/traguardo.png"></p>
          <p>${avgValues[index]} %</p>
        </a>
      </div>
      `
    )
    .join("");

(document.getElementById(
  "stampa"
).innerHTML = `<div class="container">${stampa}</div>`),
  (stampat = `
  <a href="Statistiche/History/Statistiche_Totali.html">
    <div class="colore">
        <p>totale km ${totale} <img src="Icons/traguardo.png"></p>
        <p>km medi per giro percorsi ${avgTot}</p>
        <p>km medi per anno percorsi ${avgAnno}</p>
        <p>km medi per mese ${avgMese}</p>
    </div>
  </a>`);
document.getElementById("totale").innerHTML = stampat;

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".container"),
    items = document.querySelectorAll(".Statistiche"),
    isOdd = items.length % 2 !== 0;

  if (isOdd) container.classList.add("odd-items");
});

new Chart(doughnutCtx, doughnutConfig);