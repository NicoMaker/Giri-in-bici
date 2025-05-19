document.addEventListener("DOMContentLoaded", () => {
  const mesiOrdinati = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ],
    getTotale = (chilometri) => chilometri.reduce((acc, curr) => acc + curr, 0),
    getPercentuali = (chilometri, totale) =>
      chilometri.map((km) => ((km / totale) * 100).toFixed(2)),
    getKmPerMese = (mesi, chilometri, mesiPercorsi) =>
      mesi.map((mese, index) => {
        const kmMediMese =
          mesiPercorsi[index] > 0
            ? (chilometri[index] / mesiPercorsi[index]).toFixed(2)
            : 0;
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
    createTableHTML = (kmPerMese, chilometri, percentuali, mesiPercorsi) => `
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
        <td>${mesiPercorsi[index]}</td>
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

  fetch("../Js/History/JSON/GraficoTotale.json")
    .then((response) => response.json())
    .then((statistics) => {
      const allDataPromises = [];

      Object.keys(statistics.statistics).forEach((year) => {
        const filePath = statistics.statistics[year];
        allDataPromises.push(
          fetch(filePath).then((response) => response.json())
        );
      });

      Promise.all(allDataPromises)
        .then((allData) => {
          let chilometriTotali = new Array(12).fill(0),
            mesiPercorsi = new Array(12).fill(0),
            coloriGlobali = statistics.colors;

          allData.forEach((json) => {
            const data = json.data;

            mesiOrdinati.forEach((mese, index) => {
              if (data[mese]) {
                chilometriTotali[index] += data[mese];
                mesiPercorsi[index] += 1;
              }
            });
          });

          const totaleChilometri = getTotale(chilometriTotali),
            percentuali = getPercentuali(chilometriTotali, totaleChilometri),
            kmPerMese = getKmPerMese(
              mesiOrdinati,
              chilometriTotali,
              mesiPercorsi
            ),
            mediaComplessiva = getMediaComplessiva(
              totaleChilometri,
              mesiOrdinati.length
            ),
            chartConfig = createChartConfig(
              mesiOrdinati,
              chilometriTotali,
              coloriGlobali
            ),
            ctx = document.getElementById("line-chart").getContext("2d");

          renderChart(chartConfig, ctx);

          document.getElementById("mesi").innerHTML = createTableHTML(
            kmPerMese,
            chilometriTotali,
            percentuali,
            mesiPercorsi
          );
          document.getElementById("totale").innerHTML = createSummaryHTML(
            totaleChilometri,
            mediaComplessiva
          );
        })
        .catch((error) => {
          console.error(`Errore nel caricamento dei file JSON: ${error}`);
        });
    })
    .catch((error) => {
      console.error(
        `Errore nel caricamento del file statistics.json: ${error}`
      );
    });
});
