let s2020 = 2456, s2021 = 2614, s2022 = 3808, s2023 = 3916, s2024 = 50;
let totale = s2020 + s2021 + s2022 + s2023 + s2024;

let avg2020 = (s2020 / totale) * 100;
avg2020 = avg2020.toFixed(2);

let avg2021 = (s2021 / totale) * 100;
avg2021 = avg2021.toFixed(2);

let avg2022 = (s2022 / totale) * 100;
avg2022 = avg2022.toFixed(2);

let avg2023 = (s2023 / totale) * 100;
avg2023 = avg2023.toFixed(2);

let avg2024 = (s2024 / totale) * 100;
avg2024 = avg2024.toFixed(2);

let corse = 183;

let avgtot = totale / corse;
avgtot = avgtot.toFixed(2);

let anno = 5;
let avganno = totale / anno;
avganno = avganno.toFixed(2);

let dati = {
    labels: ['Statistiche 2020', 'Statistiche 2021', 'Statistiche 2022', 'Statistiche 2023', 'Statistiche 2024'],
    datasets: [{
        label: 'km totali',
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
        data: [s2020,s2021,s2022,s2023,s2024]  // Aggiunto un valore per il 2024, correggi se necessario
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
<div class="Statistiche">
    <a href="Statistiche/Statistiche2020.html">
        <p class="titoli"> Statistiche 2020 </p>
        <p> km totali <img src="Icone/traguardo.png">
         ${s2020}</p><p>${avg2020} %</p>
    </a>
</div>

<div class="Statistiche">
    <a href="Statistiche/Statistiche2021.html">
        <p class="titoli"> Statistiche 2021 </p>
        <p> km totali <img src="Icone/traguardo.png">
         ${s2021}</p><p>${avg2021} %</p>
    </a>
</div>

<div class="Statistiche">
    <a href="Statistiche/Statistiche2022.html">
        <p class="titoli"> Statistiche 2022 </p>
        <p> km totali <img src="Icone/traguardo.png">
         ${s2022}</p><p>${avg2022} %</p>
    </a>
</div>

<div class="Statistiche">
    <a href="Statistiche/Statistiche2023.html">
        <p class="titoli"> Statistiche 2023 </p>
        <p> km totali <img src="Icone/traguardo.png">
         ${s2023}</p><p>${avg2023} %</p>
    </a>
</div>

<div class="Statistiche">
    <a href="Statistiche/Statistiche2024.html">
        <p class="titoli"> Statistiche 2024 </p>
        <p> km totali <img src="Icone/traguardo.png">
         ${s2024}</p><p>${avg2024} %</p>
    </a>
</div>
`;
document.getElementById("stampa").innerHTML = stampa;

let stampat = `
<p>totale km ${totale} 
    <img src="Icone/traguardo.png"></p> 
<p>km medi per giro percorsi ${avgtot}</p>
<p> km medi per anno percorsi ${avganno} </p>`;
document.getElementById("totale").innerHTML = stampat;