const data = {
    Gennaio: 127,
    Febbraio: 148,
    Marzo: 194,
    Aprile: 103,
    Maggio: 242,
    Giugno: 265,
    Luglio: 422,
    Agosto: 426,
    Settembre: 712,
    Ottobre: 420,
    Novembre: 299,
    Dicembre: 558,
  },
  mesi = Object.keys(data),
  chilometri = Object.values(data),
  totale = chilometri.reduce((acc, curr) => acc + curr, 0),
  percentuali = chilometri.map((km) => ((km / totale) * 100).toFixed(2)),
  corse = 58,
  kmMediPerCorsa = (totale / corse).toFixed(2),
  kmMediPerMese = (totale / mesi.length).toFixed(2),
  dati = {
    labels: mesi,
    datasets: [
      {
        label: "km mensili 2021",
        backgroundColor: [
          "darkblue",
          "blue",
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
    <th>km <img src="../../Icone/traguardo.png"></th>
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
      <p>totale km ${totale} <img src="../../Icone/traguardo.png"></p>
      <p>km medi percorsi ${kmMediPerCorsa}</p>
      <p>km medi per mese ${kmMediPerMese}</p>
  </div>`;

new Chart(ctx, config);
document.getElementById("mesi").innerHTML = tabellaDati;
document.getElementById("totale").innerHTML = stampat;