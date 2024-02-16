const e = 6471,
  p = 2206,
  ai = 4603;
const totale = e + p + ai;

const avge = ((e / totale) * 100).toFixed(2);
const avgp = ((p / totale) * 100).toFixed(2);
const avgai = ((ai / totale) * 100).toFixed(2);
const avgmediastagione = (totale / 3).toFixed(2);

const dati = {
  labels: ["Estate", "Primavera", "Autunno-Inverno"],
  datasets: [
    {
      label: "km totali stagione",
      backgroundColor: ["red", "lightgreen", "lightblue"],
      borderColor: ["black", "black", "black"],
      borderWidth: 1,
      data: [e, p, ai],
    },
  ],
};

const config = {
  type: "doughnut",
  data: dati,
};

const ctx = document.getElementById("doughnut-chart").getContext("2d");
new Chart(ctx, config);

const stampa = `
<div class="estate">
    <a href="../Estate.html">
        <img class="immaginestagionestat" src="../Icone/estate.png">
        <p class="contornostagione">Estate</p>
        <p>km totali ${e} <img src="../Icone/traguardo.png"></p>
        <p>${avge} %</p>
    </a>
</div>

<div class="primavera">
    <a href="../Primavera.html">
        <img class="immaginestagionestat" src="../Icone/primavera.png">
        <p class="contornostagione">Primavera</p>
        <p>km totali ${p} <img src="../Icone/traguardo.png"></p>
        <p>${avgp} %</p>
    </a>
</div>

<div class="autunno_inverno">
    <a href="../Autunno_Inverno.html">
        <img class="immaginestagionestat" src="../Icone/inverno.png">
        <p class="contornostagione">Autunno - Inverno</p>
        <p>km totali ${ai} <img src="../Icone/traguardo.png"></p>
        <p>${avgai} %</p>
    </a>
</div>
`;

document.getElementById("dati").innerHTML = stampa;

const stampat = `
<div class="colore">
    <p>totale km ${totale} <img src="../Icone/traguardo.png"></p>
    <p>Media km per Stagione ${avgmediastagione} km</p>
</div>`;
document.getElementById("totale").innerHTML = stampat;
