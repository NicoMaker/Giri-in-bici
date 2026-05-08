// Funzione di utilità per la formattazione condizionale
const formatNumberConditionally = (value) => {
  // Always show 2 decimal places for tables
  return formatItalianNumber(value, true);
};

// Funzione per formattazione italiana con separatori di migliaia
const formatItalianNumber = (num, forceDecimals = false) => {
  if (typeof num === 'string') {
    num = parseFloat(num);
  }
  if (isNaN(num)) return '0';
  
  // For tables, always show 2 decimal places
  let decimalString = '';
  if (forceDecimals || !Number.isInteger(num)) {
    const decimalPart = num.toFixed(2).split('.')[1];
    // Only add decimal part if it's not "00"
    if (decimalPart !== '00') {
      decimalString = ',' + decimalPart;
    }
  }
  
  // Handle decimal part - use comma for Italian format
  const parts = num.toString().split('.');
  let integerPart = parts[0];
  
  // Add thousand separators (periods)
  if (integerPart.length > 3) {
    const groups = [];
    let i = integerPart.length;
    while (i > 0) {
      const start = Math.max(0, i - 3);
      groups.unshift(integerPart.substring(start, i));
      i -= 3;
    }
    integerPart = groups.join('.');
  }
  
  return integerPart + decimalString;
};

document.addEventListener("DOMContentLoaded", async () => {
  // Assicurati che le dipendenze siano caricate
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error('Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js');
    return;
  }

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
      statistics: statistics.filter((data) => data !== null),
    };
  }

  function calculateAverages(statistics) {
    const totalekm = statistics.reduce((acc, cur) => acc + cur.km, 0);
    const totaleCorse = statistics.reduce((acc, cur) => acc + cur.numberOfRaces, 0);

    const totalMonthlykm = statistics.reduce(
      (acc, cur) =>
        acc +
        Object.values(cur.monthlyData).reduce((sum, val) => sum + val, 0),
      0,
    );
    const totalMonths = statistics.reduce(
      (acc, cur) => acc + Object.keys(cur.monthlyData).length,
      0,
    );

    const avgkmPerRaceRaw   = totaleCorse > 0 ? totalekm / totaleCorse : 0;
    const avgkmPerYearRaw   = statistics.length > 0 ? totalekm / statistics.length : 0;
    const avgkmPerMonthRaw  = totalMonths > 0 ? totalMonthlykm / totalMonths : 0;
    const avgRacesPerYearRaw = statistics.length > 0 ? totaleCorse / statistics.length : 0;
    const avgRacesPerMonthRaw = totalMonths > 0 ? totaleCorse / totalMonths : 0;

    return {
      totalekm,
      totaleCorse,
      totalMonths,

      avgkmPerRace    : formatNumberConditionally(avgkmPerRaceRaw),
      avgkmPerYear    : formatNumberConditionally(avgkmPerYearRaw),
      avgkmPerMonth   : formatNumberConditionally(avgkmPerMonthRaw),
      avgRacesPerYear : formatNumberConditionally(avgRacesPerYearRaw),
      avgRacesPerMonth: formatNumberConditionally(avgRacesPerMonthRaw),

      avgValues: statistics.map((entry) =>
        formatItalianNumber(((entry.km / totalekm) * 100), true, true),
      ),
    };
  }

  // Funzione createChartConfig rimossa - ora gestita dal sistema centralizzato

  const renderStampa = (statistics, avgValues, itemsPerPage, currentPage) => {
    const storageKey = "page_statistiche";
    const lastPage = Math.ceil(statistics.length / itemsPerPage);

    if (currentPage > lastPage) currentPage = 1;

    localStorage.setItem(storageKey, currentPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStatistics = statistics.slice(startIndex, endIndex);
    const isOdd = currentStatistics.length === 1;
    const containerClass = isOdd ? "container odd-items" : "container";

    const stampaElement = document.getElementById("stampa");
    if (stampaElement) {
      stampaElement.innerHTML = `
        <div class="${containerClass}">
          ${currentStatistics
            .map(
              (entry, index) => `
                <div class="Statistiche">
                  <a href="Statistiche/Anni/${entry.year}.html">
                    <img class="immaginestagione" src="Icons/Statistiche.png">
                    <p class="titoli">Statistiche ${entry.year}</p>
                    <p class="misuracolore">km totali ${formatNumberConditionally(entry.km)} <img src="Icons/traguardo.png"></p>
                    <p class="misuracolore">${formatNumberConditionally(parseFloat(avgValues[startIndex + index]))} %</p>
                    <p class="misuracolore">Totale corse ${entry.numberOfRaces}</p>
                  </a>
                </div>
              `,
            )
            .join("")}
        </div>`;
    }

    const pagination = document.getElementById("pagination");
    if (pagination) {
      pagination.innerHTML = `
        <button id="prev">
          <span class="material-icons">arrow_back</span>
        </button>
        <span id="page-indicator">Dati Statistiche: <br/> Anni ${currentPage} di ${lastPage}</span>
        <button id="next">
          <span class="material-icons">arrow_forward</span>
        </button>
      `;

      const prevButton = document.getElementById("prev");
      const nextButton = document.getElementById("next");
      
      if (prevButton) {
        prevButton.addEventListener("click", () => {
          const newPage = currentPage === 1 ? lastPage : currentPage - 1;
          renderStampa(statistics, avgValues, itemsPerPage, newPage);
        });
      }

      if (nextButton) {
        nextButton.addEventListener("click", () => {
          const newPage = currentPage === lastPage ? 1 : currentPage + 1;
          renderStampa(statistics, avgValues, itemsPerPage, newPage);
        });
      }
    }
  };

  const renderSummary = (
    totalekm,
    avgkmPerRace,
    avgkmPerYear,
    avgkmPerMonth,
    totaleCorse,
    avgRacesPerYear,
    avgRacesPerMonth,
    totalMonths
  ) => {
    const totaleElement = document.getElementById("totale");
    if (totaleElement) {
      const formattedTotaleKm = formatItalianNumber(totalekm);
      const formattedTotaleCorse = formatItalianNumber(totaleCorse);
      
      totaleElement.innerHTML = `
        <a href="Statistiche/History/Statistiche_Totali.html">
          <div class="colore">
            <p class="misuracolore">Totale km ${formattedTotaleKm} <img src="Icons/traguardo.png"></p>
            <p class="misuracolore">km medi per giro ${avgkmPerRace}</p>
            <p class="misuracolore">km medi per anno ${avgkmPerYear}</p>
            <p class="misuracolore">km medi per mese ${avgkmPerMonth}</p>
            <p class="misuracolore">Totale corse ${formattedTotaleCorse}</p>
            <p class="misuracolore">Corse medie per anno ${avgRacesPerYear}</p>
            <p class="misuracolore">Corse medie per mese ${avgRacesPerMonth}</p>
            <p class="misuracolore">Totale mesi di corsa ${totalMonths}</p>
          </div>
        </a>`;
    }
  };

  // Funzione renderChart rimossa - ora gestita dal sistema centralizzato

  const dataResult = await fetchData();

  if (dataResult && dataResult.mainData) {
    const { mainData, statistics } = dataResult;
    const { colors } = mainData;
    const {
      totalekm,
      totaleCorse,
      totalMonths,
      avgkmPerRace,
      avgkmPerYear,
      avgkmPerMonth,
      avgRacesPerYear,
      avgRacesPerMonth,
      avgValues,
    } = calculateAverages(statistics);

    const labels = statistics.map((entry) => `${entry.year}`);
    const values = statistics.map((entry) => entry.km);
    const itemsPerPage = 2;

    // Usa il sistema centralizzato per creare il grafico
    const chartData = {
      statistics,
      colors
    };
    
    await window.chartRenderer.createChart('generaleStatistiche', chartData);

    renderSummary(
      totalekm,
      avgkmPerRace,
      avgkmPerYear,
      avgkmPerMonth,
      totaleCorse,
      avgRacesPerYear,
      avgRacesPerMonth,
      totalMonths
    );

    const savedPage = parseInt(localStorage.getItem("page_statistiche")) || 1;
    renderStampa(statistics, avgValues, itemsPerPage, savedPage);
  } else {
    console.error("Nessun dato ricevuto");
  }
});