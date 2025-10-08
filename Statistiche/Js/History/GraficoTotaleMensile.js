document.addEventListener("DOMContentLoaded", () => {
  // --- Funzione di utilità per la formattazione condizionale ---
  const formatNumberConditionally = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0";
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(2);
  };

  // --- Costanti e funzioni di base ---
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
      chilometri.map((km) =>
        totale > 0 ? ((km / totale) * 100).toFixed(2) : "0.00"
      ),

    // --- Calcolo dei km medi per mese con formattazione ---
    getkmPerMese = (mesi, chilometri, mesiPercorsi) =>
      mesi.map((mese, index) => {
        const rawkmMediMese =
          mesiPercorsi[index] > 0
            ? chilometri[index] / mesiPercorsi[index]
            : 0;
        const kmMediMese = formatNumberConditionally(rawkmMediMese);
        return { mese, kmMediMese };
      }),

    // --- Media complessiva formattata ---
    getMediaComplessiva = (totale, length) => {
      const rawMedia = length > 0 ? totale / length : 0;
      return formatNumberConditionally(rawMedia);
    },

    // --- Configurazione del grafico con tooltip formattati ---
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
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed.y;
                return ` ${formatNumberConditionally(value)} km`;
              },
            },
          },
        },
      },
    }),

    renderChart = (config, ctx) => new Chart(ctx, config),

    // --- Tabella con numeri formattati ---
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
          <td>${formatNumberConditionally(chilometri[index])}</td>
          <td>${formatNumberConditionally(parseFloat(percentuali[index]))} %</td>
          <td>${formatNumberConditionally(mesiPercorsi[index])}</td>
          <td>${kmMediMese}</td>
        </tr>`
        )
        .join("")}
    `,

    // --- Riepilogo con valori formattati ---
    createSummaryHTML = (totale, mediaComplessiva) => `
      <a href="StoricoMensile.html">
        <div class="colore">
            <p>totale km ${formatNumberConditionally(totale)} <img src="../../Icons/traguardo.png"></p>
            <p>km totali medi per mese ${formatNumberConditionally(mediaComplessiva)}</p>
        </div>
      </a>`;

  // --- Caricamento dati ---
  fetch("../Js/History/JSON/GraficoTotale.json")
    .then((response) => response.json())
    .then((statistics) => {
      const allDataPromises = [];

      Object.keys(statistics.statistics).forEach((year) => {
        const filePath = statistics.statistics[year];
        allDataPromises.push(fetch(filePath).then((response) => response.json()));
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
            kmPerMese = getkmPerMese(mesiOrdinati, chilometriTotali, mesiPercorsi),
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
      console.error(`Errore nel caricamento del file statistics.json: ${error}`);
    });
});
