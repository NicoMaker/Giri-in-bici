let e = 6471, p = 2206 , ai = 3798;
let totale = e + p + ai;

let avge = (e/totale) * 100;
let avgp = (p/totale) * 100;
let avgai = (ai/totale) * 100;

let dati = {
    labels: ['Estate','Autunno-Inverno','Primavera'],
    datasets: [{
        label: 'km totali stagione',
        backgroundColor: [
            'red',
            'lightblue',
            'lightgreen'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
        data: [e,p,ai]  // Aggiunto un valore per il 2024, correggi se necessario
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

let stampa = `

<a href="../Estate.html">
    <div class="estate">
        <img class="immaginestagionestat" src="../Icone/estate.png">
        <p class="contornostagione">
            Estate
        </p>

        <p>km totali 
            ${e} <img src="../Icone/traguardo.png">
        </p>

        <p> ${avge} % </p>
    </div>
</a>

<a href="../Primavera.html">
    <div class="primavera">
        <img class="immaginestagionestat" src="../Icone/primavera.png">
        <p class="contornostagione">
            Primavera
        </p>

        <p>km totali 
            ${p} <img src="../Icone/traguardo.png">
        </p>

        <p> ${avgp} % </p>
    </div>
</a>    

<a href="../Autunno_Inverno.html">
    <div class="autunno_inverno">
        <img class="immaginestagionestat" src="../Icone/inverno.png">
        <p class="contornostagione">
            Autunno - Inverno
        </p>

        <p>km totali 
            ${ai} <img src="../Icone/traguardo.png">
        </p>

        <p> ${avgai} % </p>
    </div>
</a> 
`;

document.getElementById("dati").innerHTML = stampa;

let stampat = `<div class="colore"><p>totale km ${totale} <img src="../Icone/traguardo.png"></p> </div>`;
document.getElementById("totale").innerHTML = stampat;