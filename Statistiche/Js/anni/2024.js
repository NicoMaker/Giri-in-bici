const data = {
    Gennaio: 486,
    Marzo: 386,
    // Aprile: 0,
    // Maggio: 0,
    // Giugno: 0,
    // Luglio: 0,
    // Agosto: 0,
    // Settembre: 0,
    // Ottobre: 0,
    // Novembre: 0,
    // Dicembre: 0,
  },
  mesi = Object.keys(data),
  chilometri = Object.values(data),
  totale = chilometri.reduce((acc, curr) => acc + curr, 0),
  percentuali = chilometri.map((km) => ((km / totale) * 100).toFixed(2)),
  corse = 11,
  kmMediPerCorsa = (totale / corse).toFixed(2),
  kmMediPerMese = (totale / mesi.length).toFixed(2),
  dati = {
    labels: mesi,
    datasets: [
      {
        label: "km mensili 2021",
        backgroundColor: [
          "darkblue",
          "lightgreen",
          "green",
          "pink",
          "yellow",
          "orange",
          "red",
          "darkgreen",
          "brown",
          "cyan",
          "blue",
        ],
        borderColor: ["black"],
        borderWidth: 1,
        data: chilometri,
      },
    ],
  },
  config = {
    type: "bar",
    data: dati,
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  },
  ctx = document.getElementById("bar-chart").getContext("2d"),
  tabellaDati = `
  <tr class="grassetto">
    <th>Mese</th>
    <th>km <img src="../../Icons/traguardo.png"></th>
    <th>Percentuale su anno</th>
  </tr>
${mesi
  .map(
    (mese, index) => `
    <tr>
        <td>${mese}</td>
        <td>${chilometri[index]}</td>
        <td>${percentuali[index]} %</td>
    </tr>`
  )
  .join("")}
`,
  stampat = `
  <div class="colore">
      <p>totale km ${totale} <img src="../../Icons/traguardo.png"></p>
      <p>km medi percorsi ${kmMediPerCorsa}</p>
      <p>km medi per mese ${kmMediPerMese}</p>
  </div>`;

new Chart(ctx, config);
document.getElementById("mesi").innerHTML = tabellaDati;
document.getElementById("totale").innerHTML = stampat;