const data = {
    "Maggio 2020": 45,
    "Giugno 2020": 367,
    "Luglio 2020 ": 627,
    "Agosto 2020": 691,
    "Settembre 2020": 291,
    "Novembre 2020": 192,
    "Dicembre 2020": 243,
    "Gennaio 2021": 152,
    "Febbraio 2021": 315,
    "Marzo 2021": 302,
    "Aprile 2021": 323,
    "Maggio 2021": 180,
    "Giugno 2021": 270,
    "Luglio 2021": 401,
    "Agosto 2021": 174,
    "Settembre 2021": 75,
    "Ottobre 2021": 216,
    "Novembre 2021": 66,
    "Dicembre 2021": 140,
    "Gennaio 2022": 65,
    "Febbraio 2022": 242,
    "Marzo 2022": 244,
    "Aprile 2022": 92,
    "Maggio 2022": 270,
    "Giugno 2022": 279,
    "Luglio 2022": 601,
    "Agosto 2022": 542,
    "Settembre 2022": 604,
    "Ottobre 2022": 627,
    "Novembre 2022": 133,
    "Dicembre 2022": 109,
    "Gennaio 2023": 127,
    "Febbraio 2023": 148,
    "Marzo 2023": 194,
    "Aprile 2023": 103,
    "Maggio 2023": 242,
    "Giugno 2023": 265,
    "Luglio 2023": 422,
    "Agosto 2023": 426,
    "Settembre 2023": 712,
    "Ottobre 2023": 420,
    "Novembre 2023": 299,
    "Dicembre 2023": 558,
    "Gennaio 2024": 486,
    "Marzo 2024": 386,
    "Aprile 2024": 1022,
    "Maggio 2024": 762,
    "Giugno 2024": 623,
    "Luglio 2024": 0,
    // "Agosto 2024": 0,
    // "Settembre 2024": 0,
    // "Ottobre 2024": 0,
    // "Novembre 2024": 0,
    // "Dicembre 2024": 0,
  },
  mesi = Object.keys(data),
  chilometri = Object.values(data),
  totale = chilometri.reduce((acc, curr) => acc + curr, 0),
  percentuali = chilometri.map((km) => ((km / totale) * 100).toFixed(2)),
  corse = 230,
  kmMediPerCorsa = (totale / corse).toFixed(2),
  kmMediPerMese = (totale / mesi.length).toFixed(2),
  dati = {
    labels: mesi,
    datasets: [
      {
        label: "km mensili per periodo totali",
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
    <th>km <img src="../../Icons/traguardo.png"></th>
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
  <a href="Statistiche_Mensili.html">
    <div class="colore">
        <p>totale km ${totale} <img src="../../Icons/traguardo.png"></p>
        <p>km medi percorsi ${kmMediPerCorsa}</p>
        <p>km medi per mese ${kmMediPerMese}</p>
    </div>
  </a>`;

new Chart(ctx, config);
document.getElementById("mesi").innerHTML = tabellaDati;
document.getElementById("totale").innerHTML = stampat;