// generaleStatistiche.js
// Dipendenze: JS/utils.js, JS/chart/chart-configs.js, JS/chart/chart-renderer.js

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error(
      "Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js",
    );
    return;
  }

  async function fetchData() {
    const mainData = await fetchJSON(
      "Statistiche/Js/History/JSON/Generale.json",
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
      }),
    );

    return {
      mainData,
      statistics: statistics.filter((d) => d !== null),
    };
  }

  function calculateAverages(statistics) {
    const totalekm = statistics.reduce((acc, cur) => acc + cur.km, 0);
    const totaleCorse = statistics.reduce(
      (acc, cur) => acc + cur.numberOfRaces,
      0,
    );
    const totalYears = statistics.length;
    const totalMonths = statistics.reduce(
      (acc, cur) => acc + Object.keys(cur.monthlyData).length,
      0,
    );

    const avgValues = statistics.map((entry) =>
      formatPercentage((entry.km / totalekm) * 100),
    );

    return {
      totalekm,
      totaleCorse,
      totalYears,
      totalMonths,
      avgkmPerRace: formatNumber(totaleCorse > 0 ? totalekm / totaleCorse : 0),
      avgkmPerYear: formatNumber(totalYears > 0 ? totalekm / totalYears : 0),
      avgkmPerMonth: formatNumber(totalMonths > 0 ? totalekm / totalMonths : 0),
      avgRacesPerYear: formatNumber(
        totalYears > 0 ? totaleCorse / totalYears : 0,
      ),
      avgRacesPerMonth: formatNumber(
        totalMonths > 0 ? totaleCorse / totalMonths : 0,
      ),
      avgValues,
    };
  }

  const renderStampa = (statistics, avgValues) => {
    const isOdd = statistics.length % 2 !== 0;

    const stampaElement = document.getElementById("stampa");
    if (stampaElement) {
      stampaElement.innerHTML = `
        <div class="${isOdd ? "container odd-items" : "container"}">
          ${statistics
            .map(
              (entry, index) => `
            <div class="Statistiche">
              <a href="Statistiche/Anni/${entry.year}.html">
                <img class="immaginestagione" src="Icons/Statistiche.png">
                <p class="titoli">Statistiche ${entry.year}</p>
                <p class="misuracolore">km totali ${formatNumber(entry.km)} <img src="Icons/traguardo.png"></p>
                <p class="misuracolore">${avgValues[index]} %</p>
                <p class="misuracolore">Totale corse ${entry.numberOfRaces}</p>
                <p class="misuracolore">km medi per corsa ${formatNumber(entry.km / entry.numberOfRaces)}</p>
              </a>
            </div>
          `,
            )
            .join("")}
        </div>`;
    }

    const pagination = document.getElementById("pagination");
    if (pagination) pagination.innerHTML = "";
  };

  const renderSummary = (
    totalekm,
    avgkmPerRace,
    avgkmPerYear,
    avgkmPerMonth,
    totaleCorse,
    avgRacesPerYear,
    avgRacesPerMonth,
    totalMonths,
    totalYears,
  ) => {
    const totaleElement = document.getElementById("totale");
    if (totaleElement) {
      totaleElement.innerHTML = `
        <a href="Statistiche/History/Statistiche_Totali.html">
          <div class="colore">
            <p class="misuracolore">Totale km ${formatItalianNumber(totalekm)} <img src="Icons/traguardo.png"></p>
            <p class="misuracolore">km medi per giro ${avgkmPerRace}</p>
            <p class="misuracolore">km medi per anno ${avgkmPerYear}</p>
            <p class="misuracolore">km medi per mese ${avgkmPerMonth}</p>
            <p class="misuracolore">Totale corse ${formatItalianNumber(totaleCorse)}</p>
            <p class="misuracolore">Corse medie per anno ${avgRacesPerYear}</p>
            <p class="misuracolore">Corse medie per mese ${avgRacesPerMonth}</p>
            <p class="misuracolore">Totale anni di corsa ${formatItalianNumber(totalYears)}</p>
            <p class="misuracolore">Totale mesi di corsa ${totalMonths}</p>
          </div>
        </a>`;
    }
  };

  const dataResult = await fetchData();
  if (dataResult && dataResult.mainData) {
    const { mainData, statistics } = dataResult;
    const { colors } = mainData;
    const {
      totalekm,
      totaleCorse,
      totalYears,
      totalMonths,
      avgkmPerRace,
      avgkmPerYear,
      avgkmPerMonth,
      avgRacesPerYear,
      avgRacesPerMonth,
      avgValues,
    } = calculateAverages(statistics);

    const chartData = { statistics, colors };
    await window.chartRenderer.createChart(
      "generaleStatisticheLine",
      chartData,
    );
    await window.chartRenderer.createChart("generaleStatistiche", chartData);

    renderSummary(
      totalekm,
      avgkmPerRace,
      avgkmPerYear,
      avgkmPerMonth,
      totaleCorse,
      avgRacesPerYear,
      avgRacesPerMonth,
      totalMonths,
      totalYears,
    );

    renderStampa(statistics, avgValues);
  } else {
    console.error("Nessun dato ricevuto");
  }
});
