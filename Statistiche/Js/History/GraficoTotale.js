// Funzione di utilità per la formattazione condizionale
const formatNumberConditionally = (value) => {
  // Se il valore è un intero (es. 10.0), lo mostra senza decimali
  if (Number.isInteger(value)) {
    return value.toString();
  }
  // Altrimenti, lo formatta con due decimali (es. 10.33)
  return value.toFixed(2);
};


document.addEventListener("DOMContentLoaded", () => {
  async function fetchData() {
    try {
      const response = await fetch("../Js/History/JSON/GraficoTotale.json"),
        jsonData = await response.json();
      return jsonData;
    } catch (error) {
      console.error(`Errore nel caricamento dei dati:, ${error}`);
      return null;
    }
  }


  async function fetchYearData(url) {
    try {
      const response = await fetch(url),
        data = await response.json();
      return data;
    } catch (error) {
      console.error(`Errore nel caricamento dei dati da ${url}: ${error}`);
      return null;
    }
  }


  function calculateTotals(yearlyData) {
    let totale = 0,
      chilometri = [],
      mesi = [],
      anni = [];

    const combinedData = [];
    yearlyData.forEach(({ data, year }) => {
      for (let mese in data)
        combinedData.push({ mese, chilometri: data[mese], year });
    });

    combinedData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return new Date(`1 ${a.mese} 2000`) - new Date(`1 ${b.mese} 2000`);
    });

    combinedData.forEach(({ chilometri: chilometriMensili, mese, year }) => {
      chilometri.push(chilometriMensili);
      mesi.push(mese);
      anni.push(year);
    });

    totale = chilometri.reduce((acc, curr) => acc + curr, 0);

    return { totale, chilometri, mesi, anni };
  }


  // --- MODIFICATA calculateAverages con medie corse ---
  function calculateAverages(totale, totaleCorse, totaleAnni, chilometri, mesi) {
    // Calcolo dei valori grezzi
    const rawKmMediPerCorsa = totaleCorse > 0 ? totale / totaleCorse : 0;
    const rawKmMediPerMese   = mesi.length > 0 ? totale / mesi.length : 0;

    // Medie corse
    const rawRacesPerYear    = totaleAnni > 0 ? totaleCorse / totaleAnni : 0;
    const rawRacesPerMonth   = mesi.length > 0 ? totaleCorse / mesi.length : 0;

    return {
      percentuali: mesi.map((mese, index) =>
        ((chilometri[index] / totale) * 100).toFixed(2),
      ),
      // Applicazione della formattazione condizionale
      kmMediPerCorsa   : formatNumberConditionally(rawKmMediPerCorsa),
      kmMediPerMese    : formatNumberConditionally(rawKmMediPerMese),

      racesPerYear     : formatNumberConditionally(rawRacesPerYear),
      racesPerMonth    : formatNumberConditionally(rawRacesPerMonth),
    };
  }
  // ------------------------------------------------


  function createChartConfig(labels, data, anni) {
    return {
      type: "line",
      data: {
        labels: labels.map((mese, index) => `${mese} (${anni[index]})`),
        datasets: [
          {
            label: "km mensili per periodo totali",
            backgroundColor: "blue",
            borderColor: "blue",
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
    };
  }


  const renderChart = (config, ctx) => new Chart(ctx, config);


  function createTable(mesi, chilometri, percentuali, anni) {
    return `
    <tr class="grassetto">
      <th>Mese</th>
      <th>km <img src="../../Icons/traguardo.png"></th>
      <th>Percentuale sul totale</th>
      <th>Anno</th>
    </tr>
    ${mesi
      .map(
        (mese, index) => `
      <tr>
        <td>${mese}</td>
        <td>${formatNumberConditionally(chilometri[index])}</td>
        <td>${formatNumberConditionally(parseFloat(percentuali[index]))} %</td>
        <td>${anni[index]}</td>
      </tr>`,
      )
      .join("")}
  `;
  }


  // ✅ Aggiungo totaleCorse, racesPerYear, racesPerMonth
  function createSummary(
    totale,
    kmMediPerCorsa,
    kmMediPerMese,
    totaleCorse,
    racesPerYear,
    racesPerMonth
  ) {
    return `
      <a href="Statistiche_Mensili.html">
        <div class="colore">
            <p class="misuracolore">Totale km ${totale} <img src="../../Icons/traguardo.png"></p>
            <p class="misuracolore">km medi percorsi ${kmMediPerCorsa}</p>
            <p class="misuracolore">km medi per mese ${kmMediPerMese}</p>
            <p class="misuracolore">Totale corse ${totaleCorse}</p>
            <p class="misuracolore">Corse medie per anno ${racesPerYear}</p>
            <p class="misuracolore">Corse medie per mese ${racesPerMonth}</p>
        </div>
      </a>`;
  }


  fetchData()
    .then(async (data) => {
      if (data) {
        const { statistics } = data;
        let yearlyData = [],
          totaleCorse = 0;

        const fetchPromises = Object.values(statistics).map((url) =>
          fetchYearData(url).then((yearData) => {
            if (yearData) {
              yearlyData.push(yearData);
              totaleCorse += yearData.numberOfRaces || 0;
            }
          }),
        );

        await Promise.all(fetchPromises);

        const totaleAnni = yearlyData.length;

        const { totale, chilometri, mesi, anni } = calculateTotals(yearlyData),
          { percentuali, kmMediPerCorsa, kmMediPerMese, racesPerYear, racesPerMonth } = calculateAverages(
            totale,
            totaleCorse,
            totaleAnni,
            chilometri,
            mesi,
          ),
          chartConfig = createChartConfig(mesi, chilometri, anni),
          ctx = document.getElementById("line-chart").getContext("2d");

        if (ctx) renderChart(chartConfig, ctx);
        else console.error("Contesto del canvas non trovato");

        const tableHTML = createTable(mesi, chilometri, percentuali, anni),
          summaryHTML = createSummary(
            totale,
            kmMediPerCorsa,
            kmMediPerMese,
            totaleCorse,
            racesPerYear,
            racesPerMonth,
          );

        document.getElementById("mesi").innerHTML = tableHTML;
        document.getElementById("totale").innerHTML = summaryHTML;
      } else {
        console.error("Nessun dato ricevuto");
      }
    })
    .catch((error) => {
      console.error(`Errore durante il fetch:, ${error}`);
    });
});
