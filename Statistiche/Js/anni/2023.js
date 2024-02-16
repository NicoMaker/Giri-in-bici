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
};

const mesi = Object.keys(data);
const chilometri = Object.values(data);

const totale = chilometri.reduce((acc, curr) => acc + curr, 0);
const percentuali = chilometri.map((km) => ((km / totale) * 100).toFixed(2));

const corse = 62;
const kmMediPerCorsa = (totale / corse).toFixed(2);
const kmMediPerMese = (totale / mesi.length).toFixed(2);

const dati = {
  labels: mesi,
  datasets: [
    {
      label: "km mensili 2022",
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
        "blue"
      ],
      borderColor: Array(12).fill("black"),
      borderWidth: 1,
      data: chilometri,
    },
  ],
};

const config = {
  type: "bar",
  data: dati,
  options: {
    scales: {
      y: { beginAtZero: true },
    },
  },
};

const ctx = document.getElementById("bar-chart").getContext("2d");
new Chart(ctx, config);

const tabellaDati = `
  <tr class="grassetto">
    <th>Mese</th>
    <th>km <img src="../Icone/traguardo.png"></th>
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
  `;

const stampat = `
  <div class="colore">
      <p>totale km ${totale} <img src="../Icone/traguardo.png"></p>
      <p>km medi percorsi ${kmMediPerCorsa}</p>
      <p>km medi per mese ${kmMediPerMese}</p>
  </div>`;

document.getElementById("mesi").innerHTML = tabellaDati;
document.getElementById("totale").innerHTML = stampat;
