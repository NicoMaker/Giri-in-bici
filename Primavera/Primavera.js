let p2021 = 579, p2022 = 885, p2023 = 742, p2024 = 0;
let totale = p2021 + p2022 + p2023 + p2024;

let avg2021 = (p2021 / totale) * 100;
avg2021 = parseFloat(avg2021.toFixed(2));

let avg2022 = (p2022 / totale) * 100;
avg2022 = parseFloat(avg2022.toFixed(2));

let avg2023 = (p2023 / totale) * 100;
avg2023 = parseFloat(avg2023.toFixed(2));

let avg2024 = (p2024 / totale) * 100;
avg2024 = parseFloat(avg2024.toFixed(2));

let dati = {
    labels: ['2021', '2022', '2023', '2024'],
    datasets: [{
        label: 'km Primavera',
        backgroundColor: [
            'pink',
            'antiquewhite',
            'cyan',
            '#97ed86ce'
        ],
        borderColor: [
            'black',
            'black',
            'black',
            'black'
        ],
        borderWidth: 1,
        data: [p2021, p2022, p2023,p2024]  // Aggiunto un valore per il 2024, correggi se necessario
    }]
};

// Configurazione del grafico
let config = {
    type: 'doughnut',
    data: dati,
};

// Ottenere il contesto del canvas e creare il grafico
let ctx = document.getElementById('doughnut-chart').getContext('2d');
new Chart(ctx, config);

let stampa = `

<div class="container">
    <div class="Primaveracontorno">
        <img class="immaginestagione" src="Icone/primavera.png">
        <a href="Primavera/Primavera2021.html">
            <p class="titoli">
                Primavera 2021

                <p>Totale km <img src="Icone/traguardo.png"> ${p2021}</p> 
                <p> ${avg2021} % </p>
            </p>
        </a>
    </div>

    <div class="Primaveracontorno">
        <img class="immaginestagione" src="Icone/primavera.png">
        <a href="Primavera/Primavera2022.html">
            <p class="titoli">
                Primavera 2022

                <p>Totale km <img src="Icone/traguardo.png"> ${p2022}</p> 
                <p> ${avg2022} % </p>
            </p>
        </a>
    </div>

    <div class="Primaveracontorno">
        <img class="immaginestagione" src="Icone/primavera.png">
        <a href="Primavera/Primavera2023.html">
            <p class="titoli">
                Primavera 2023

                <p>Totale km <img src="Icone/traguardo.png"> ${p2023}</p> 
                <p> ${avg2023} % </p>
            </p>
        </a>
    </div>

    <div class="Primaveracontorno">
        <img class="immaginestagione" src="Icone/primavera.png">
        <a href="Primavera/Primavera2024.html">
            <p class="titoli">
                Primavera 2024

                <p>Totale km <img src="Icone/traguardo.png"> ${p2024}</p> 
                <p> ${avg2024} % </p>
            </p>
        </a>
    </div>
</div>
`;
document.getElementById("stampa").innerHTML = stampa;

let avgp = totale/4;
avgp = avgp.toFixed(2);

let stampaP = `
<div class="colore">
    <p>Totale km percorsi in Primavera ${totale} <img src="Icone/traguardo.png"> </p>
    <p>media km per stagione ${avgp} </p>
</div>`;
document.getElementById("totale").innerHTML = stampaP;

document.addEventListener("DOMContentLoaded", function() {
    let container = document.querySelector('.container');
    let items = document.querySelectorAll('.Primaveracontorno');
    let isOdd = items.length % 2 !== 0;

    if (isOdd) {
        container.classList.add('odd-items');
    }
});
