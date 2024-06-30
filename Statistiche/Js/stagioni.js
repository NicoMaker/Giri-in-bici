const e = 6689,
  p = 4781,
  ai = 4603,
  totale = e + p + ai,
  avge = ((e / totale) * 100).toFixed(2),
  avgp = ((p / totale) * 100).toFixed(2),
  avgai = ((ai / totale) * 100).toFixed(2),
  avgmediastagione = (totale / 3).toFixed(2),
  dati = {
    labels: ["Estate", "Primavera", "Autunno-Inverno"],
    datasets: [
      {
        label: "km totali stagione",
        backgroundColor: ["red", "lightgreen", "lightblue"],
        borderColor: ["black"],
        borderWidth: 1,
        data: [e, p, ai],
      },
    ],
  },
  config = {
    type: "doughnut",
    data: dati,
  },
  ctx = document.getElementById("doughnut-chart").getContext("2d"),
  stampa = `
  <div class="estate">
      <a href="../Estate.html">
          <img class="immaginestagionestat" src="../Icons/estate.png">
          <p class="contornostagione","misuracolre">Estate</p>
          <p class="misuracolre">km totali ${e} <img src="../Icons/traguardo.png"></p>
          <p class="misuracolre">${avge} %</p>
      </a>
  </div>

  <div class="primavera">
      <a href="../Primavera.html">
          <img class="immaginestagionestat" src="../Icons/primavera.png">
          <p class="contornostagione","misuracolre">Primavera</p>
          <p class="misuracolre">km totali ${p} <img src="../Icons/traguardo.png"></p>
          <p class="misuracolre">${avgp} %</p>
      </a>
  </div>

  <div class="autunno_inverno">
      <a href="../Autunno_Inverno.html">
          <img class="immaginestagionestat" src="../Icons/inverno.png">
          <p class="contornostagione","misuracolre">Autunno - Inverno</p>
          <p class="misuracolre">km totali ${ai} <img src="../Icons/traguardo.png"></p>
          <p class="misuracolre">${avgai} %</p>
      </a>
  </div>
  `,
  stampat = `
  <div class="colore">
      <p class="misuracolre">totale km ${totale} <img src="../Icons/traguardo.png"></p>
      <p class="misuracolre">Media km per Stagione ${avgmediastagione} km</p>
  </div>`;

document.getElementById("totale").innerHTML = stampat;

document.getElementById("dati").innerHTML = stampa;
new Chart(ctx, config);