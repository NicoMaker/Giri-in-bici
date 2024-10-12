document.addEventListener("DOMContentLoaded", async () => {
  const jsonUrl = document.getElementById("json").getAttribute("link");

  try {
    const response = await fetch(jsonUrl),
      jsonData = await response.json(),
      { year, numberOfRaces: corse, data, colors } = jsonData,
      mesi = Object.keys(data),
      chilometri = Object.values(data),
      totale = chilometri.reduce((acc, curr) => acc + curr, 0),
      percentuali = calculatePercentuali(chilometri, totale),
      kmMediPerCorsa = calculateKmMedi(totale, corse),
      kmMediPerMese = calculateKmMedi(totale, mesi.length);

    renderChart(mesi, chilometri, colors, year);
    renderDataTable(mesi, chilometri, percentuali);
    renderSummary(totale, kmMediPerCorsa, kmMediPerMese);
  } catch (error) {
    console.error("Error fetching or processing the JSON data:", error);
  }
}),
  (calculatePercentuali = (chilometri, totale) =>
    chilometri.map((km) => ((km / totale) * 100).toFixed(2))),
  (calculateKmMedi = (totale, divider) => (totale / divider).toFixed(2));

function renderChart(mesi, chilometri, colors, year) {
  const chartData = {
      labels: mesi,
      datasets: [
        {
          label: `km mensili`,
          backgroundColor: colors,
          borderColor: "black",
          borderWidth: 1,
          data: chilometri,
        },
      ],
    },
    chartConfig = {
      type: "bar",
      data: chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    },
    ctx = document.getElementById("bar-chart").getContext("2d");
  new Chart(ctx, chartConfig);
}

function renderDataTable(mesi, chilometri, percentuali) {
  const tabellaDati = `
    <tr class="grassetto">
      <th>Mese</th>
      <th>km <img src="../../Icons/traguardo.png" alt="traguardo"></th>
      <th>Percentuale sull'anno</th>
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
  document.getElementById("mesi").innerHTML = tabellaDati;
}

function renderSummary(totale, kmMediPerCorsa, kmMediPerMese) {
  const stampat = `
    <div class="colore">
      <p>totale km ${totale} <img src="../../Icons/traguardo.png" alt="traguardo"></p>
      <p>km medi percorsi ${kmMediPerCorsa}</p>
      <p>km medi per mese ${kmMediPerMese}</p>
    </div>
  `;
  document.getElementById("totale").innerHTML = stampat;
}
