const data = {
  Maggio: 45,
  Giugno: 367,
  Luglio: 627,
  Agosto: 691,
  Settembre: 291,
  Novembre: 192,
  Dicembre: 243,
};

const mesi = Object.keys(data);
const chilometri = Object.values(data);

const totale = chilometri.reduce((acc, curr) => acc + curr, 0);
const percentuali = chilometri.map((km) => ((km / totale) * 100).toFixed(2));

const corse = 32;
const kmMediPerCorsa = (totale / corse).toFixed(2);
const kmMediPerMese = (totale / mesi.length).toFixed(2);

const dati = {
  labels: mesi,
  datasets: [
    {
      label: "km mensili 2020",
      backgroundColor: [
        "pink",
        "yellow",
        "orange",
        "red",
        "darkgreen",
        "cyan",
        "blue"
      ],
      borderColor: Array(7).fill("black"),
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
      y: {
        beginAtZero: true,
      },
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