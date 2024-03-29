const data = {
    Gennaio: 830,
    Febbraio: 705,
    Marzo: 1054,
    Aprile: 518,
    Maggio: 737,
    Giugno: 1181,
    Luglio: 2051,
    Agosto: 1833,
    Settembre: 1682,
    Ottobre: 1263,
    Novembre: 690,
    Dicembre: 1050,
  },
  mesi = Object.keys(data),
  chilometri = Object.values(data),
  totale = chilometri.reduce((acc, curr) => acc + curr, 0),
  percentuali = chilometri.map((km) => ((km / totale) * 100).toFixed(2)),
  mesi_percorsi = [4, 3, 4, 3, 4, 4, 4, 4, 4, 4, 3, 4],
  kmPerMese = mesi.map((mese, index) => {
    const numMesiPeriodo = mesi_percorsi[index],
      kmMediMese = (chilometri[index] / numMesiPeriodo).toFixed(2);
    return { mese, kmMediMese };
  }),
  mediaComplessiva = (totale / mesi.length).toFixed(2),
  dati = {
    labels: mesi,
    datasets: [
      {
        label: "km mensili totali",
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
        y: { beginAtZero: true },
      },
    },
  },
  ctx = document.getElementById("line-chart").getContext("2d"),
  tabellaDati = `
  <tr class="grassetto">
    <th>Mese</th>
    <th>km <img src="../../Icone/traguardo.png"></th>
    <th>Percentuale sul totale</th>
    <th>Mesi di Corsa</th>
    <th>km <img src="../../Icone/traguardo.png"> medi mensili</th>
  </tr>
  ${kmPerMese
    .map(
      ({ mese, kmMediMese }, index) => `
    <tr>
      <td>${mese}</td>
      <td>${chilometri[index]}</td>
      <td>${percentuali[index]} %</td>
      <td>${mesi_percorsi[index]}
      <td>${kmMediMese}</td>
    </tr>`
    )
    .join("")}
`,
  stampat = `
  <a href="StoricoMensile.html">
    <div class="colore">
        <p>totale km ${totale} <img src="../../Icone/traguardo.png"></p>
        <p>km totali medi per mese ${mediaComplessiva}</p>
    </div>
  </a>
`;

new Chart(ctx, config);
document.getElementById("mesi").innerHTML = tabellaDati;
document.getElementById("totale").innerHTML = stampat;