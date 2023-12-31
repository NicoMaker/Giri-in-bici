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
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            '#97ed86ce'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'lightgreen'
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

<!-- <div class="Primaveracontorno">
    <img class="immaginestagione" src="Icone/primavera.png">
    <a href="Primavera/Primavera2024.html">
        <p class="titoli">
            Primavera 2024

            <p>Totale km <img src="Icone/traguardo.png"> ${p2024}</p> 
            <p> ${avg2024} % </p>
        </p>
    </a>
</div> -->
`;
document.getElementById("stampa").innerHTML = stampa;

let avgp = totale/3;
avgp = avgp.toFixed(2);

let stampaP = `Totale km percorsi in Primavera ${totale} <img src="Icone/traguardo.png"> <p>media km per stagione ${avgp} </p>`;
document.getElementById("totale").innerHTML = stampaP;
