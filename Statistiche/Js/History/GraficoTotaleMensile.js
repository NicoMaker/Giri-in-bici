document.addEventListener("DOMContentLoaded", () => {
  const getMesi = (data) => Object.keys(data),
    getChilometri = (data) => Object.values(data),
    getTotale = (chilometri) => chilometri.reduce((acc, curr) => acc + curr, 0),
    getPercentuali = (chilometri, totale) =>
      chilometri.map((km) => ((km / totale) * 100).toFixed(2)),
    getKmPerMese = (mesi, chilometri, mesi_percorsi) =>
      mesi.map((mese, index) => {
        const numMesiPeriodo = mesi_percorsi[index],
          kmMediMese = (chilometri[index] / numMesiPeriodo).toFixed(2);
        return { mese, kmMediMese };
      }),
    getMediaComplessiva = (totale, length) => (totale / length).toFixed(2),
    createChartConfig = (labels, data, colori) => ({
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "km mensili totali",
            backgroundColor: colori,
            borderColor: ["black"],
            borderWidth: 1,
            data,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    }),
    renderChart = (config, ctx) => new Chart(ctx, config),
    createTableHTML = (kmPerMese, chilometri, percentuali, mesi_percorsi) => ` 
    <tr class="grassetto">
      <th>Mese</th>
      <th>km <img src="../../Icons/traguardo.png"></th>
      <th>Percentuale sul totale</th>
      <th>Mesi di Corsa</th>
      <th>km <img src="../../Icons/traguardo.png"> medi mensili</th>
    </tr>
    ${kmPerMese
      .map(
        ({ mese, kmMediMese }, index) => `
    <tr>
      <td>${mese}</td>
      <td>${chilometri[index]}</td>
      <td>${percentuali[index]} %</td>
      <td>${mesi_percorsi[index]}</td>
      <td>${kmMediMese}</td>
    </tr>`
      )
      .join("")}
  `,
    createSummaryHTML = (totale, mediaComplessiva) => `
    <a href="StoricoMensile.html">
      <div class="colore">
          <p>totale km ${totale} <img src="../../Icons/traguardo.png"></p>
          <p>km totali medi per mese ${mediaComplessiva}</p>
      </div>
    </a>`;

  fetch("../Js/History/JSON/GraficoTotaleMensile.json")
    .then((response) => response.json())
    .then((json) => {
      const data = json.data,
        mesi_percorsi = json.mesi_percorsi,
        colori = json.colori,
        mesi = getMesi(data),
        chilometri = getChilometri(data),
        totale = getTotale(chilometri),
        percentuali = getPercentuali(chilometri, totale),
        kmPerMese = getKmPerMese(mesi, chilometri, mesi_percorsi),
        mediaComplessiva = getMediaComplessiva(totale, mesi.length),
        chartConfig = createChartConfig(mesi, chilometri, colori),
        ctx = document.getElementById("line-chart").getContext("2d");

      renderChart(chartConfig, ctx);
      document.getElementById("mesi").innerHTML = createTableHTML(
        kmPerMese,
        chilometri,
        percentuali,
        mesi_percorsi
      );
      document.getElementById("totale").innerHTML = createSummaryHTML(
        totale,
        mediaComplessiva
      );
    });
});
