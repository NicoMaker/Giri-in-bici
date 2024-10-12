document.addEventListener("DOMContentLoaded", async () => {
  async function fetchJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return null;
    }
  }

  async function fetchData() {
    const mainData = await fetchJSON(
      "Statistiche/Js/History/JSON/Generale.json"
    );

    if (!mainData || !mainData.statistics) {
      console.error("Main data not available or statistics field missing");
      return null;
    }

    const statistics = await Promise.all(
      Object.keys(mainData.statistics).map(async (year) => {
        const data = await fetchJSON(mainData.statistics[year]);
        return data
          ? {
              year: data.year,
              km: Object.values(data.data).reduce((sum, val) => sum + val, 0),
              numberOfRaces: data.numberOfRaces,
              monthlyData: data.data,
            }
          : null;
      })
    );

    return {
      mainData,
      statistics: statistics.filter((data) => data !== null),
    };
  }

  function calculateAverages(statistics) {
    const totaleKm = statistics.reduce((acc, cur) => acc + cur.km, 0),
      totaleCorse = statistics.reduce((acc, cur) => acc + cur.numberOfRaces, 0),
      totalMonthlyKm = statistics.reduce((acc, cur) => {
        const monthlySum = Object.values(cur.monthlyData).reduce(
          (sum, val) => sum + val,
          0
        );
        return acc + monthlySum;
      }, 0),
      totalMonths = statistics.reduce((acc, cur) => {
        return acc + Object.keys(cur.monthlyData).length; // Conta i mesi non vuoti
      }, 0);

    return {
      totaleKm,
      avgKmPerRace: totaleCorse > 0 ? (totaleKm / totaleCorse).toFixed(2) : 0,
      avgKmPerYear:
        statistics.length > 0 ? (totaleKm / statistics.length).toFixed(2) : 0,
      avgKmPerMonth:
        totalMonths > 0 ? (totalMonthlyKm / totalMonths).toFixed(2) : 0, // Calcola la media mensile
      avgValues: statistics.map((entry) =>
        ((entry.km / totaleKm) * 100).toFixed(2)
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

  const renderStampa = (statistics, avgValues) =>
      (document.getElementById(
        "stampa"
      ).innerHTML = `<div class="container">${statistics
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
        .join("")}
    </div>`),
    renderSummary = (totaleKm, avgKmPerRace, avgKmPerYear, avgKmPerMonth) =>
      (document.getElementById("totale").innerHTML = `
      <a href="Statistiche/History/Statistiche_Totali.html">
        <div class="colore">
            <p>totale km ${totaleKm} <img src="Icons/traguardo.png"></p>
            <p>km medi per giro percorsi ${avgKmPerRace}</p>
            <p>km medi per anno percorsi ${avgKmPerYear}</p>
            <p>km medi per mese ${avgKmPerMonth}</p>
        </div>
      </a>`),
    { mainData, statistics } = await fetchData();

  function adjustContainerLayout() {
    const container = document.querySelector(".container"),
      items = document.querySelectorAll(".Statistiche"),
      isOdd = items.length % 2 !== 0;
    if (isOdd) container.classList.add("odd-items");
  }

  if (mainData) {
    const { colors } = mainData,
      { totaleKm, avgKmPerRace, avgKmPerYear, avgKmPerMonth, avgValues } =
        calculateAverages(statistics),
      labels = statistics.map((entry) => `${entry.year}`),
      values = statistics.map((entry) => entry.km),
      doughnutConfig = createChartConfig(labels, values, colors),
      doughnutCtx = document.getElementById("doughnut-chart").getContext("2d");

    renderStampa(statistics, avgValues);
    renderSummary(totaleKm, avgKmPerRace, avgKmPerYear, avgKmPerMonth);
    adjustContainerLayout();
    new Chart(doughnutCtx, doughnutConfig);
  } else console.error("Nessun dato ricevuto");
});
