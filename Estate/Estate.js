let e2020 = 2021,e2021 = 743, e2022 = 2085, e2023 = 1622;
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
    labels: ['2020', '2021', '2022', '2023'],
    datasets: [{
        label: 'km Estate',
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
        data: [e2020,e2021,e2022,e2023]  // Aggiunto un valore per il 2024, correggi se necessario
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

let stampaE2020 = `<p>Totale km <img src="Icone/traguardo.png"> ${e2020}</p> <p> ${avg2020} % </p>`
document.getElementById("estate2020").innerHTML = stampaE2020;

let stampaE2021 = `<p>Totale km <img src="Icone/traguardo.png"> ${e2021}</p><p> ${avg2021} % </p>`
document.getElementById("estate2021").innerHTML = stampaE2021;

let stampaE2022 = `<p>Totale km <img src="Icone/traguardo.png"> ${e2022}</p> <p> ${avg2022} % </p>`
document.getElementById("estate2022").innerHTML = stampaE2022;

let stampaE2023 = `<p>Totale km <img src="Icone/traguardo.png"> ${e2023}</p> <p> ${avg2023} % </p>`
document.getElementById("estate2023").innerHTML = stampaE2023;

let avge = totale/4;
avge = avge.toFixed(2);

let stampaE = `Totale km percorsi in Estate ${totale} <img src="Icone/traguardo.png"> <p>media km per stagione ${avge} </p>`;
document.getElementById("totale").innerHTML = stampaE;