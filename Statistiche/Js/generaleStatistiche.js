document.addEventListener("DOMContentLoaded", async () => {
  async function fetchJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching data from ${url}:, ${error}`);
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
      totalMonthlyKm = statistics.reduce(
        (acc, cur) =>
          acc +
          Object.values(cur.monthlyData).reduce((sum, val) => sum + val, 0),
        0
      ),
      totalMonths = statistics.reduce(
        (acc, cur) => acc + Object.keys(cur.monthlyData).length,
        0
      );

    return {
      totaleKm,
      avgKmPerRace: totaleCorse > 0 ? (totaleKm / totaleCorse).toFixed(2) : 0,
      avgKmPerYear:
        statistics.length > 0 ? (totaleKm / statistics.length).toFixed(2) : 0,
      avgKmPerMonth:
        totalMonths > 0 ? (totalMonthlyKm / totalMonths).toFixed(2) : 0,
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

  const renderStampa = (statistics, avgValues, itemsPerPage, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage,
      endIndex = startIndex + itemsPerPage,
      currentStatistics = statistics.slice(startIndex, endIndex),
      lastPage = Math.ceil(statistics.length / itemsPerPage),
      isOdd = currentStatistics.length === 1,
      containerClass = isOdd ? "container odd-items" : "container";

    document.getElementById(
      "stampa"
    ).innerHTML = `<div class="${containerClass}">
      ${currentStatistics
        .map(
          (entry, index) => `
          <div class="Statistiche">
            <a href="Statistiche/Anni/${entry.year}.html">
              <img class="immaginestagione" src="Icons/Statistiche.png">
              <p class="titoli">Statistiche ${entry.year}</p>
              <p>km totali ${entry.km} <img src="Icons/traguardo.png"></p>
              <p>${avgValues[startIndex + index]} %</p>
            </a>
          </div>
        `
        )
        .join("")}
    </div>`;

    const pagination = document.getElementById("pagination");
    pagination.innerHTML = `
      <button id="prev">
        <span class="material-icons">arrow_back</span>
      </button>
      <span id="page-indicator">Dati Statistiche: <br/> Anni${currentPage} di ${lastPage}</span>
      <button id="next">
        <span class="material-icons">arrow_forward</span>
      </button>
    `;

    document.getElementById("prev").addEventListener("click", () => {
      const newPage = currentPage === 1 ? lastPage : currentPage - 1;
      renderStampa(statistics, avgValues, itemsPerPage, newPage);
    });

    document.getElementById("next").addEventListener("click", () => {
      const newPage = currentPage === lastPage ? 1 : currentPage + 1;
      renderStampa(statistics, avgValues, itemsPerPage, newPage);
    });
  };

  const renderSummary = (totaleKm, avgKmPerRace, avgKmPerYear, avgKmPerMonth) =>
      (document.getElementById("totale").innerHTML = `
      <a href="Statistiche/History/Statistiche_Totali.html">
        <div class="colore">
            <p>Totale km ${totaleKm} <img src="Icons/traguardo.png"></p>
            <p>Km medi per corsa ${avgKmPerRace}</p>
            <p>Km medi per anno ${avgKmPerYear}</p>
            <p>Km medi per mese ${avgKmPerMonth}</p>
        </div>
      </a>`),
    renderChart = (labels, data, colors) => {
      const doughnutConfig = createChartConfig(labels, data, colors),
        doughnutCtx = document
          .getElementById("doughnut-chart")
          .getContext("2d");
      new Chart(doughnutCtx, doughnutConfig);
    },
    { mainData, statistics } = await fetchData();

  if (mainData) {
    const { colors } = mainData,
      { totaleKm, avgKmPerRace, avgKmPerYear, avgKmPerMonth, avgValues } =
        calculateAverages(statistics),
      labels = statistics.map((entry) => `km ${entry.year}`),
      values = statistics.map((entry) => entry.km),
      itemsPerPage = 2;

    renderChart(labels, values, colors);
    renderSummary(totaleKm, avgKmPerRace, avgKmPerYear, avgKmPerMonth);
    renderStampa(statistics, avgValues, itemsPerPage, 1);
  } else console.error("Nessun dato ricevuto");
});
