document.addEventListener("DOMContentLoaded", async function () {
  // Assicurati che le dipendenze siano caricate
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error('Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js');
    return;
  }

  const jsonUrl = document.getElementById("json").getAttribute("link");

  try {
    const seasonData = await fetch(jsonUrl).then(response => response.json());
    
    const season = seasonData.season,
      image = seasonData.image,
      path = seasonData.path,
      cssclass = seasonData.cssclass,
      colors = seasonData.colors,
      subPeriodData = await fetchSubPeriods(seasonData.subPeriods),
      labels = Object.keys(subPeriodData),
      values = labels.map((label) => subPeriodData[label].totalDistance),
      totale = calculateTotal(values),
      totalRaces = calculateTotalRaces(labels, subPeriodData),
      avgValues = calculateAverageValues(labels, subPeriodData, totale);
    
    // Calcola il numero totale di periodi
    const totalePeriodi = labels.length;

    // Usa il sistema centralizzato per creare il grafico
    const chartData = {
      season,
      image,
      path,
      cssclass,
      colors,
      subPeriodData
    };
    
    await window.chartRenderer.createChart('stagioni', chartData);

    renderDataList(
      labels,
      subPeriodData,
      path,
      image,
      season,
      cssclass,
      avgValues,
    );
    renderSeasonSummary(season, totale, totalePeriodi, totalRaces);
    adjustContainerLayout(cssclass);
  } catch (error) {
    console.error(`Error loading the JSON data:, ${error}`);
  }
});

async function fetchSubPeriods(subPeriods) {
  const promises = Object.entries(subPeriods).map(([period, file]) =>
    fetch(file)
      .then((response) => response.json())
      .then((data) => {
        const totalDistance = calculateTotal(
          data.map((entry) => entry.distance),
        );
        const numberOfRaces = data.length;
        return { [period]: { totalDistance, numberOfRaces } };
      }),
  );

  const results = await Promise.all(promises);
  return results.reduce((acc, curr) => Object.assign(acc, curr), {});
}

// Funzione per formattare i numeri
const formatNumber = (value) => {
  // Always show 2 decimal places for tables
  return formatItalianNumber(value, true);
};

// Funzione per formattazione italiana con separatori di migliaia e virgola per decimali
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

const calculateTotal = (values) => values.reduce((acc, cur) => acc + cur, 0),
  calculateTotalRaces = (labels, data) =>
    labels.reduce((acc, label) => acc + data[label].numberOfRaces, 0),
  calculateAverageValues = (labels, data, totale) =>
    labels.map((label) => {
      const value = (data[label].totalDistance / totale) * 100;
      return formatNumber(value);
    });

// Funzioni di rendering del grafico rimosse - ora gestite dal sistema centralizzato

const createStampa = (labels, data, path, image, season, cssclass, avgValues) =>
    labels
      .map(
        (label, index) => `
      <div class="${cssclass}contorno">
        <a href="${path}/Periodi/${label}.html">
          <img class="immaginestagione" src="Icons/${image}">
          <p class="titoli">
            ${season} ${label}
            <p class="misuracolore">Totale km ${formatNumber(data[label].totalDistance)} 
              <img src="Icons/traguardo.png">
            </p> 
            <p class="misuracolore">${avgValues[index]} %</p>
            <p class="misuracolore">Totale corse ${data[label].numberOfRaces}</p>
            <p class="misuracolore">km medi per corsa ${formatNumber(data[label].totalDistance / data[label].numberOfRaces)}</p>
          </p>
        </a>
      </div>
    `,
      )
      .join(""),
  updateStampa = (stampa) =>
    (document.getElementById("stampa").innerHTML =
      `<div class="container">${stampa}</div>`);

function renderDataListPaginated(
  labels,
  data,
  path,
  image,
  season,
  cssclass,
  avgValues,
) {
  const itemsPerPage = 2;
  const storageKey = `page_${season}`;
  let currentPage = parseInt(localStorage.getItem(storageKey)) || 1;
  const totalPages = Math.ceil(labels.length / itemsPerPage);

  function updatePage() {
    localStorage.setItem(storageKey, currentPage);

    const startIndex = (currentPage - 1) * itemsPerPage,
      endIndex = startIndex + itemsPerPage,
      currentLabels = labels.slice(startIndex, endIndex),
      currentData = currentLabels.reduce((acc, label) => {
        acc[label] = data[label];
        return acc;
      }, {}),
      currentAvgValues = avgValues.slice(startIndex, endIndex),
      stampa = createStampa(
        currentLabels,
        currentData,
        path,
        image,
        season,
        cssclass,
        currentAvgValues,
      );

    updateStampa(stampa);

    const pagination = document.getElementById("pagination");
    if (pagination) {
      pagination.innerHTML = `
        <button id="prev">
          <span class="material-icons">arrow_back</span>
        </button>
        <span id="page-indicator">Dati della Stagione: <br/> ${season} ${currentPage} di ${totalPages}</span>
        <button id="next">
          <span class="material-icons">arrow_forward</span>
        </button>
      `;

      const prevButton = document.getElementById("prev");
      const nextButton = document.getElementById("next");
      
      if (prevButton) {
        prevButton.addEventListener("click", () => {
          currentPage = currentPage === 1 ? totalPages : currentPage - 1;
          updatePage();
        });
      }

      if (nextButton) {
        nextButton.addEventListener("click", () => {
          currentPage = currentPage === totalPages ? 1 : currentPage + 1;
          updatePage();
        });
      }
    }
  }

  if (currentPage > totalPages) {
    currentPage = 1;
    localStorage.setItem(storageKey, currentPage);
  }

  updatePage();
}

const renderDataList = (
  labels,
  data,
  path,
  image,
  season,
  cssclass,
  avgValues,
) =>
  renderDataListPaginated(
    labels,
    data,
    path,
    image,
    season,
    cssclass,
    avgValues,
  );

// MODIFICATA: ora riceve totalePeriodi invece di numberOfLabels
function renderSeasonSummary(season, totale, totalePeriodi, totalRaces) {
  const avgseason = formatNumber(totale / totalePeriodi),
    avgcorsa = formatNumber(totale / totalRaces),
    formattedTotalRaces = formatItalianNumber(totalRaces),
    stampaseason = `
      <div class="colore">
        <p class="misuracolore">Totale km percorsi in ${season} ${formatNumber(totale)} <img src="Icons/traguardo.png"> </p>
        <p class="misuracolore">Km medi per giro in ${season} ${avgcorsa} </p>
        <p class="misuracolore">Media km per periodo ${avgseason} </p>
        <p class="misuracolore">Totale corse ${formattedTotalRaces}</p>
        <p class="misuracolore">Corse medie per periodo ${formatNumber(totalRaces / totalePeriodi)}</p>
        <hr style="margin: 10px 0; border-color: rgba(255,255,255,0.3);">
        <p class="misuracolore">Totale periodi: ${totalePeriodi}</p>
      </div>
    `;

  document.getElementById("totale").innerHTML = stampaseason;
}

function adjustContainerLayout(cssclass) {
  const container = document.querySelector(".container"),
    items = document.querySelectorAll(`.${cssclass}contorno`),
    isOdd = items.length % 2 !== 0;

  if (isOdd) container.classList.add("odd-items");
}