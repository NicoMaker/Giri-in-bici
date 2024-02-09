let e2020 = 2021,
  e2021 = 743,
  e2022 = 2085,
  e2023 = 1622;
let totale = e2020 + e2021 + e2022 + e2023;

let avg2020 = (e2020 / totale) * 100;
avg2020 = parseFloat(avg2020.toFixed(2));

let avg2021 = (e2021 / totale) * 100;
avg2021 = parseFloat(avg2021.toFixed(2));

let avg2022 = (e2022 / totale) * 100;
avg2022 = parseFloat(avg2022.toFixed(2));

let avg2023 = (e2023 / totale) * 100;
avg2023 = parseFloat(avg2023.toFixed(2));

let dati = {
  labels: ["2020", "2021", "2022", "2023"],
  datasets: [
    {
      label: "km Estate",
      backgroundColor: ["yellow", "orange", "red", "purple"],
      borderColor: ["black", "black", "black", "black"],
      borderWidth: 1,
      data: [e2020, e2021, e2022, e2023], // Aggiunto un valore per il 2024, correggi se necessario
    },
  ],
};

// Configurazione del grafico
let config = {
  type: "doughnut",
  data: dati,
};

// Ottenere il contesto del canvas e creare il grafico
let ctx = document.getElementById("doughnut-chart").getContext("2d");
new Chart(ctx, config);

let stampa = `
<div class="container">
    <div class="Estatecontorno">
        <img class="immaginestagione" src="Icone/estate.png">
        <a href="Estate/Estate2020.html">

            <p class="titoli">
                Estate 2020

                <p>Totale km <img src="Icone/traguardo.png"> 
                ${e2020}</p> <p> ${avg2020} % </p>
            </p>
        </a>

    </div>

    <div class="Estatecontorno">
        <img class="immaginestagione" src="Icone/estate.png">
            <a href="Estate/Estate2021.html">

                <p class="titoli">
                Estate 2021

                <p>Totale km <img src="Icone/traguardo.png"> 
                ${e2021}</p> <p> ${avg2021} % </p>
                </p>
            </a>

    </div>

    <div class="Estatecontorno">
        <img class="immaginestagione" src="Icone/estate.png">
            <a href="Estate/Estate2022.html">

                <p class="titoli">
                Estate 2022

                <p>Totale km <img src="Icone/traguardo.png"> 
                ${e2022}</p> <p> ${avg2022} % </p>
                </p>
            </a>

    </div>

    <div class="Estatecontorno">
        <img class="immaginestagione" src="Icone/estate.png">
            <a href="Estate/Estate2023.html">

                <p class="titoli">
                Estate 2023

                <p>Totale km <img src="Icone/traguardo.png"> 
                ${e2023}</p> <p> ${avg2023} % </p>
                </p>
            </a>

    </div>

</div>

    
</div>
`;
document.getElementById("stampa").innerHTML = stampa;

let avge = totale / 4;
avge = avge.toFixed(2);

let stampaE = `
<div class="colore">
    <p>Totale km percorsi in Estate ${totale} <img src="Icone/traguardo.png"> </p>
    <p>media km per stagione ${avge} </p>
</div>`;
document.getElementById("totale").innerHTML = stampaE;

document.addEventListener("DOMContentLoaded", function () {
  let container = document.querySelector(".container");
  let items = document.querySelectorAll(".Estatecontorno");
  let isOdd = items.length % 2 !== 0;

  if (isOdd) {
    container.classList.add("odd-items");
  }
});
