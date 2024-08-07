document.addEventListener("DOMContentLoaded", async () => {
  async function fetchMainData() {
    try {
      const response = await fetch("Statistiche/Js/History/JSON/Generale.json"),
        jsonData = await response.json();
      return jsonData;
    } catch (error) {
      console.error("Error fetching main data:", error);
      return null;
    }
  }

  async function fetchCorseData() {
    try {
      const response = await fetch(
          "Statistiche/Js/History/JSON/GraficoTotale.json"
        ),
        jsonData = await response.json();
      return jsonData.corse;
    } catch (error) {
      console.error("Error fetching corse data:", error);
      return null;
    }
  }

  function calculateAverages(statistics, corse, totalMonths) {
    const totale = statistics.reduce((acc, cur) => acc + cur.km, 0);
    return {
      totale,
      avgTot: (totale / corse).toFixed(2),
      avgAnno: (totale / statistics.length).toFixed(2),
      avgMese: (totale / totalMonths).toFixed(2),
      avgValues: statistics.map((entry) =>
        ((entry.km / totale) * 100).toFixed(2)
      ),
    };
  }

  function createChartConfig(labels, data, colors) {
    return {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            label: "km totali",
            backgroundColor: colors,
            borderColor: ["black"],
            borderWidth: 1,
            data,
          },
        ],
      },
    };
  }

  function renderStampa(statistics, avgValues) {
    const stampa = statistics
      .map(
        (entry, index) => `
        <div class="Statistiche">
          <a href="Statistiche/Anni/${entry.year}.html">
            <img class="immaginestagione" src="Icons/Statistiche.png">
            <p class="titoli">Statistiche ${entry.year}</p>
            <p>km totali ${entry.km} 
            <img src="Icons/traguardo.png"></p>
            <p>${avgValues[index]} %</p>
          </a>
        </div>
      `
      )
      .join("");

    document.getElementById(
      "stampa"
    ).innerHTML = `<div class="container">${stampa}</div>`;
  }

  function renderSummary(totale, avgTot, avgAnno, avgMese) {
    const summary = `
      <a href="Statistiche/History/Statistiche_Totali.html">
        <div class="colore">
            <p>totale km ${totale} <img src="Icons/traguardo.png"></p>
            <p>km medi per giro percorsi ${avgTot}</p>
            <p>km medi per anno percorsi ${avgAnno}</p>
            <p>km medi per mese ${avgMese}</p>
        </div>
      </a>`;
    document.getElementById("totale").innerHTML = summary;
  }

  function adjustContainerLayout() {
    const container = document.querySelector(".container"),
      items = document.querySelectorAll(".Statistiche"),
      isOdd = items.length % 2 !== 0;
    if (isOdd) container.classList.add("odd-items");
  }

  const mainData = await fetchMainData(),
    corse = await fetchCorseData();

  if (mainData && corse) {
    const { statistics, colors, totalMonths } = mainData;
    const { totale, avgTot, avgAnno, avgMese, avgValues } = calculateAverages(
      statistics,
      corse,
      totalMonths
    );
    const labels = statistics.map((entry) => `${entry.year}`),
      values = statistics.map((entry) => entry.km),
      doughnutConfig = createChartConfig(labels, values, colors),
      doughnutCtx = document.getElementById("doughnut-chart").getContext("2d");

    renderStampa(statistics, avgValues);
    renderSummary(totale, avgTot, avgAnno, avgMese);
    adjustContainerLayout();
    new Chart(doughnutCtx, doughnutConfig);
  } else console.error("Nessun dato ricevuto");
});
