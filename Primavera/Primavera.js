let p2021 = 579, p2022 = 885, p2023 = 742;
let totale = p2021 + p2022 + p2023;

let avg2021 = (p2021 / totale) * 100;
let avg2022 = (p2022 / totale) * 100;
let avg2023 = (p2023 / totale) * 100;

let dati = {
    labels: ['2021', '2022', '2023'],
    datasets: [{
        label: 'km Primavera',
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
        data: [p2021, p2022, p2023]  // Aggiunto un valore per il 2024, correggi se necessario
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

let stampaP2021 = `<p>Totale km <img src="Icone/traguardo.png"> ${p2021}</p> <p> ${avg2021} % </p>`
document.getElementById("primavera2021").innerHTML = stampaP2021;

let stampaP2022 = `<p>Totale km <img src="Icone/traguardo.png"> ${p2022}</p> <p> ${avg2022} % </p>`
document.getElementById("primavera2022").innerHTML = stampaP2022;

let stampaP2023 = `<p>Totale km <img src="Icone/traguardo.png"> ${p2023}</p> <p> ${avg2023} % </p>`
document.getElementById("primavera2023").innerHTML = stampaP2023;

let stampaP = `Totale km percorsi in Primavera ${totale} <img src="Icone/traguardo.png"> <p>media km per stagione ${totale/3} </p>`;
document.getElementById("totale").innerHTML = stampaP;