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
  kmMediPerMese = (totale / mesi.length).toFixed(2),
  dati = {
    labels: mesi,
    datasets: [
      {
        label: "km mensili totali",
        backgroundColor: ["blue"],
        borderColor: ["blue"],
        borderWidth: 1,
        data: chilometri,
      },
    ],
  },
  config = {
    type: "line",
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
    <a href="StoricoMensile.html">
      <div class="colore">
          <p>totale km ${totale} <img src="../../Icone/traguardo.png"></p>
          <p>km totali medi per mese ${kmMediPerMese}</p>
      </div>
    </a>`;

new Chart(ctx, config);
document.getElementById("mesi").innerHTML = tabellaDati;
document.getElementById("totale").innerHTML = stampat;