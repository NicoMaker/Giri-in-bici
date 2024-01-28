let e = 6471, p = 2206, ai = 4603;
let totale = e + p + ai;

let avge = (e/totale) * 100;
avge = parseFloat(avge.toFixed(2));

let avgp = (p/totale) * 100;
avgp = parseFloat(avgp.toFixed(2));

let avgai = (ai/totale) * 100;
avgai = parseFloat(avgai.toFixed(2));

let avgmediastagione = totale / 3;
avgmediastagione = parseFloat(avgmediastagione .toFixed(2));

let dati = {
    labels: ['Estate','Primavera','Autunno-Inverno'],
    datasets: [{
        label: 'km totali stagione',
        backgroundColor: [
            'red',
            'lightgreen',
            'lightblue'
        ],
        borderColor: [
            'black',
            'black',
            'black'
        ],
        borderWidth: 1,
        data: [e,p,ai]  // Aggiunto un valore per il 2024, correggi se necessario
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


<div class="estate">
    <img class="immaginestagionestat" src="../Icone/estate.png">
        <a href="../Estate.html">
            <p class="contornostagione">
                Estate
            </p>

            <p>km totali
                ${e} <img src="../Icone/traguardo.png">
            </p>

            <p> ${avge} % </p>
        </a>
</div>

<div class="primavera">
    <img class="immaginestagionestat" src="../Icone/primavera.png">
        <a href="../Primavera.html">
            <p class="contornostagione">
                Primavera
            </p>

            <p>km totali
                ${p} <img src="../Icone/traguardo.png">
            </p>

            <p> ${avgp} % </p>
        </a>
</div>

<div class="autunno_inverno">
    <img class="immaginestagionestat" src="../Icone/inverno.png">
        <a href="../Autunno_Inverno.html">
            <p class="contornostagione">
                Autunno - Inverno
            </p>

            <p>km totali
                ${ai} <img src="../Icone/traguardo.png">
            </p>

            <p> ${avgai} % </p>
        </a>
</div>
`;

document.getElementById("dati").innerHTML = stampa;

let stampat = `
<div class="colore">
    <p>totale km ${totale} 
        <img src="../Icone/traguardo.png"></p>  
    <p> Media km per Stagione ${avgmediastagione} km </p> </div>`;
document.getElementById("totale").innerHTML = stampat;