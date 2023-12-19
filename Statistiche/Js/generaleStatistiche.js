let s2020 = 2456, s2021 = 2614, s2022 = 3808, s2023 = 3757, s2024 = 0;
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

let corse = 180;

let avgtot = totale / corse;
avgtot = avgtot.toFixed(2);

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

let stampa2020 = `<p class="titoli"> Statistiche 2020 </p><p> km totali <img src="Icone/traguardo.png"> ${s2020}</p><p>${avg2020} %</p>`;
document.getElementById("2020").innerHTML = stampa2020;

let stampa2021 = `<p class="titoli"> Statistiche 2021 </p><p>km totali <img src="Icone/traguardo.png"> ${s2021}</p><p>${avg2021} %</p>`;
document.getElementById("2021").innerHTML = stampa2021;

let stampa2022 = `<p class="titoli"> Statistiche 2022 </p><p>km totali <img src="Icone/traguardo.png"> ${s2022}</p><p>${avg2022} %</p>`;
document.getElementById("2022").innerHTML = stampa2022;

let stampa2023 = `<p class="titoli"> Statistiche 2023 </p><p>km totali <img src="Icone/traguardo.png"> ${s2023}</p><p>${avg2023} %</p>`;
document.getElementById("2023").innerHTML = stampa2023;

let stampa2024 = `<p class="titoli"> Statistiche 2024 </p><p>km totali <img src="Icone/traguardo.png"> ${s2024}</p><p>${avg2024} %</p>`;
document.getElementById("2024").innerHTML = stampa2024;


let stampat = `<p>totale km ${totale} <img src="../Icone/traguardo.png"></p> <p>km medi percorsi ${avgtot}</p>`;
document.getElementById("totale").innerHTML = stampat;