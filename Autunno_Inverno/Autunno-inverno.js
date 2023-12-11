let AI202021 = 1305,AI202122 = 729, AI202223 = 806, AI202324 = 958;
let totale = AI202021 + AI202122 + AI202223 + AI202223;

let dati = {
    labels: ['2020-2021', '2021-2022', '2022-2023', '2023-2024'],
    datasets: [{
        label: 'km Autunno - Inverno',
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
        data: [AI202021, AI202122. AI202223m, AI202324]  // Aggiunto un valore per il 2024, correggi se necessario
    }]
};

// Configurazione del grafico
let config = {
    type: 'doughnut',
    data: dati,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
};

// Ottenere il contesto del canvas e creare il grafico
let ctx = document.getElementById('doughnut-chart').getContext('2d');
new Chart(ctx, config);

let stampaAI2021 = `<p>Totale km <img src="Icone/traguardo.png"> ${AI202021}</p>`
document.getElementById("AI2021").innerHTML = stampaAI2021;

let stampaAI2122 = `<p>Totale km <img src="Icone/traguardo.png"> ${AI202122}</p>`
document.getElementById("AI2122").innerHTML = stampaAI2122;

let stampaAI2223 = `<p>Totale km <img src="Icone/traguardo.png"> ${AI202223}</p>`
document.getElementById("AI2223").innerHTML = stampaAI2223;

let stampaAI2324 = `<p>Totale km <img src="Icone/traguardo.png"> ${AI202324}</p>`
document.getElementById("AI2324").innerHTML = stampaAI2324;

let stampaAI = `Totale km percorsi in Autunno - Inverno ${totale} <img src="Icone/traguardo.png">`;
document.getElementById("totale").innerHTML = stampaAI;