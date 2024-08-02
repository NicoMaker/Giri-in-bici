document.addEventListener("DOMContentLoaded", () => {
  async function fetchData() {
    try {
      const response = await fetch("../Js/History/JSON/GraficoTotale.json"),
        jsonData = await response.json();
      return jsonData;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  function calculateTotals(data) {
    const chilometri = Object.values(data);
    return {
      totale: chilometri.reduce((acc, curr) => acc + curr, 0),
      chilometri,
      mesi: Object.keys(data),
    };
  }

  function calculateAverages(totale, corse, chilometri, mesi) {
    return {
      percentuali: mesi.map((mese, index) =>
        ((chilometri[index] / totale) * 100).toFixed(2)
      ),
      kmMediPerCorsa: (totale / corse).toFixed(2),
      kmMediPerMese: (totale / mesi.length).toFixed(2),
    };
  }

  function createChartConfig(labels, data) {
    return {
      type: "line",
      data: {
        labels,
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

  function createTable(mesi, chilometri, percentuali) {
    return `
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
    `;
  }

  function createSummary(totale, kmMediPerCorsa, kmMediPerMese) {
    return `
      <a href="Statistiche_Mensili.html">
        <div class="colore">
            <p>totale km ${totale} <img src="../../Icons/traguardo.png"></p>
            <p>km medi percorsi ${kmMediPerCorsa}</p>
            <p>km medi per mese ${kmMediPerMese}</p>
        </div>
      </a>`;
  }

  fetchData().then((data) => {
    if (data) {
      const { kmData, corse } = data;
      if (!kmData || !corse) {
        console.error("Struttura dei dati non valida");
        return;
      }

      const { totale, chilometri, mesi } = calculateTotals(kmData), { percentuali, kmMediPerCorsa, kmMediPerMese } = calculateAverages(
        totale,
        corse,
        chilometri,
        mesi
      ),chartConfig = createChartConfig(mesi, chilometri),ctx = document.getElementById("line-chart").getContext("2d");

      if (ctx)
        renderChart(chartConfig, ctx);
     else 
        console.error("Contesto del canvas non trovato");
      

      const tableHTML = createTable(mesi, chilometri, percentuali), summaryHTML = createSummary(totale, kmMediPerCorsa, kmMediPerMese);

      document.getElementById("mesi").innerHTML = tableHTML;
      document.getElementById("totale").innerHTML = summaryHTML;
    } else
      console.error("Nessun dato ricevuto");
  }).catch(error => {
    console.error("Errore durante il fetch:", error);
  });
});
