document.addEventListener("DOMContentLoaded", () => {
  async function fetchData() {
    try {
      const response = await fetch("../Js/History/JSON/GraficoTotale.json"),
            jsonData = await response.json();
      return jsonData;
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error);
      return null;
    }
  }

  async function fetchYearData(url) {
    try {
      const response = await fetch(url),
            data = await response.json();
      return data;
    } catch (error) {
      console.error(`Errore nel caricamento dei dati da ${url}:`, error);
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
      for (let mese in data) {
        combinedData.push({ mese, chilometri: data[mese], year });
      }
    });
  
    combinedData.sort((a, b) => {
      if (a.year !== b.year) 
        return a.year - b.year; 
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
  

  function calculateAverages(totale, corse, chilometri, mesi) {
    return {
      percentuali: mesi.map((mese, index) =>
        ((chilometri[index] / totale) * 100).toFixed(2)
      ),
      kmMediPerCorsa: corse > 0 ? (totale / corse).toFixed(2) : 0,
      kmMediPerMese: mesi.length > 0 ? (totale / mesi.length).toFixed(2) : 0,
    };
  }

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
        <th>Anno</th> <!-- Nuova colonna per l'anno -->
      </tr>
      ${mesi
        .map(
          (mese, index) => `
      <tr>
          <td>${mese}</td>
          <td>${chilometri[index]}</td>
          <td>${percentuali[index]} %</td>
          <td>${anni[index]}</td> <!-- Mostra l'anno -->
      </tr>`
        )
        .join("")}
    `;
  }

  function createSummary(totale, kmMediPerCorsa, kmMediPerMese) {
    return `
      <a href="Statistiche_Mensili.html">
        <div class="colore">
            <p>Totale km ${totale} <img src="../../Icons/traguardo.png"></p>
            <p>Km medi percorsi ${kmMediPerCorsa}</p>
            <p>Km medi per mese ${kmMediPerMese}</p>
        </div>
      </a>`;
  }

  fetchData().then(async (data) => {
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
        })
      );

      await Promise.all(fetchPromises);

      const { totale, chilometri, mesi, anni } = calculateTotals(yearlyData),
            { percentuali, kmMediPerCorsa, kmMediPerMese } = calculateAverages(
              totale,
              totaleCorse,
              chilometri,
              mesi
            ),
            chartConfig = createChartConfig(mesi, chilometri, anni),
            ctx = document.getElementById("line-chart").getContext("2d");

      if (ctx) renderChart(chartConfig, ctx);
      else console.error("Contesto del canvas non trovato");

      const tableHTML = createTable(mesi, chilometri, percentuali, anni),
            summaryHTML = createSummary(totale, kmMediPerCorsa, kmMediPerMese);

      document.getElementById("mesi").innerHTML = tableHTML;
      document.getElementById("totale").innerHTML = summaryHTML;
    } else {
      console.error("Nessun dato ricevuto");
    }
  }).catch(error => {
    console.error("Errore durante il fetch:", error);
  });
});
