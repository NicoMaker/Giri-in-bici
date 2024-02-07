let AI202021 = 1305, AI202122 = 729, AI202223 = 806, AI202324 = 1763;
let totale = AI202021 + AI202122 + AI202223 + AI202324;

let avg2021 = (AI202021 / totale) * 100;
avg2021 = parseFloat(avg2021.toFixed(2));

let avg2122 = (AI202122 / totale) * 100;
avg2122 = parseFloat(avg2122.toFixed(2));

let avg2223 = (AI202223 / totale) * 100;
avg2223 = parseFloat(avg2223.toFixed(2));

let avg2324 = (AI202324 / totale) * 100;
avg2324 = parseFloat(avg2324.toFixed(2));

let dati = {
    labels: ['2020-2021', '2021-2022', '2022-2023', '2023-2024'],
    datasets: [{
        label: 'km Autunno - Inverno',
        backgroundColor: [
            'yellowgreen',
            'skyblue',
            '#ba690c',
            'blue'
        ],
        borderColor: [
            'yellowgreen',
            'skyblue',
            '#ba690c',
            'blue'
        ],
        borderWidth: 1,
        data: [AI202021, AI202122, AI202223, AI202324]  // Aggiunto un valore per il 2024, correggi se necessario
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
    <div class="Autunno-Invernocontorno">
        <img class="immaginestagione" src="Icone/inverno.png">
            <a href="Autunno_Inverno/Autunno_Inverno2020-2021.html">
                <p class="titoli">Autunno - Inverno 2020/2021
                <p>Totale km <img src="Icone/traguardo.png"> 
                ${AI202021}</p> <p> ${avg2021} % </p>
            </p>
            </a>
    </div>

    <div class="Autunno-Invernocontorno">
        <img class="immaginestagione" src="Icone/inverno.png">
            <a href="Autunno_Inverno/Autunno_Inverno2021-2022.html">
                <p class="titoli">Autunno - Inverno 2021/2022
                <p>Totale km <img src="Icone/traguardo.png"> 
                ${AI202122}</p> <p> ${avg2122} % </p>
            </p>
            </a>
    </div>

    <div class="Autunno-Invernocontorno">
        <img class="immaginestagione" src="Icone/inverno.png">
            <a href="Autunno_Inverno/Autunno_Inverno2022-2023.html">
                <p class="titoli">Autunno - Inverno 2022/2023
                <p>Totale km <img src="Icone/traguardo.png"> 
                ${AI202223}</p> <p> ${avg2223} % </p>
            </p>
            </a>
    </div>

    <div class="Autunno-Invernocontorno">
        <img class="immaginestagione" src="Icone/inverno.png">
            <a href="Autunno_Inverno/Autunno_Inverno2023-2024.html">
                <p class="titoli">Autunno - Inverno 2023/2024
                <p>Totale km <img src="Icone/traguardo.png"> 
                ${AI202324}</p> <p> ${avg2324} % </p>
            </p>
            </a>
    </div>
</div>
`;
document.getElementById("stampa").innerHTML = stampa;


let avgai = totale / 4;
avgai = avgai.toFixed(2);

let stampaAI = `
<div class="colore">
    <p>Totale km percorsi in Autunno - Inverno ${totale} <img src="Icone/traguardo.png"> </p>
    <p>media km per stagione ${avgai} </p>
</div>`;
document.getElementById("totale").innerHTML = stampaAI;

document.addEventListener("DOMContentLoaded", function() {
    let container = document.querySelector('.container');
    let items = document.querySelectorAll('.Autunno-Invernocontorno');
    let isOdd = items.length % 2 !== 0;

    if (isOdd) {
        container.classList.add('odd-items');
    }
});
