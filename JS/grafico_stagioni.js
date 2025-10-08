document.addEventListener("DOMContentLoaded", function () {
  const jsonUrl = document.getElementById("json").getAttribute("link");

  fetch(jsonUrl)
    .then((response) => response.json())
    .then(async (seasonData) => {
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

      renderDoughnutChart(labels, values, colors, season);
      renderDataList(
        labels,
        subPeriodData,
        path,
        image,
        season,
        cssclass,
        avgValues,
      );
      // La formattazione viene gestita all'interno di renderSeasonSummary
      renderSeasonSummary(season, totale, labels.length, totalRaces);
      adjustContainerLayout(cssclass);
    })
    .catch((error) => console.error(`Error loading the JSON data:, ${error}`));
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

const calculateTotal = (values) => values.reduce((acc, cur) => acc + cur, 0),
  calculateTotalRaces = (labels, data) =>
    labels.reduce((acc, label) => acc + data[label].numberOfRaces, 0),
  calculateAverageValues = (labels, data, totale) =>
    labels.map((label) =>
      ((data[label].totalDistance / totale) * 100).toFixed(2),
    );

function renderDoughnutChart(labels, values, colors, season) {
  const datasets = createDatasets(values, colors, season),
    doughnutData = createDoughnutData(labels, datasets),
    doughnutConfig = createDoughnutConfig(doughnutData),
    doughnutCtx = getDoughnutContext();

  new Chart(doughnutCtx, doughnutConfig);
}

function createDatasets(values, colors, season) {
  return [
    {
      label: `km ${season}`,
      backgroundColor: colors,
      borderColor: ["black"],
      borderWidth: 1,
      data: values,
    },
  ];
}

function createDoughnutData(labels, datasets) {
  return {
    labels,
    datasets,
  };
}

function createDoughnutConfig(doughnutData) {
  return {
    type: "doughnut",
    data: doughnutData,
  };
}

const getDoughnutContext = () =>
    document.getElementById("doughnut-chart").getContext("2d"),
  createStampa = (labels, data, path, image, season, cssclass, avgValues) =>
    labels
      .map(
        (label, index) => `
      <div class="${cssclass}contorno">
        <a href="${path}/Periodi/${label}.html">
          <img class="immaginestagione" src="Icons/${image}">
          <p class="titoli">
            ${season} ${label}
            <p>Totale km ${data[label].totalDistance} 
              <img src="Icons/traguardo.png">
            </p> 
            <p>${avgValues[index]} %</p>
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
    // Save the current page in localStorage
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
    pagination.innerHTML = `
      <button id="prev">
        <span class="material-icons">arrow_back</span>
      </button>
      <span id="page-indicator">Dati della Stagione: <br/> ${season} ${currentPage} di ${totalPages}</span>
      <button id="next">
        <span class="material-icons">arrow_forward</span>
      </button>
    `;

    document.getElementById("prev").addEventListener("click", () => {
      currentPage = currentPage === 1 ? totalPages : currentPage - 1;
      updatePage();
    });

    document.getElementById("next").addEventListener("click", () => {
      currentPage = currentPage === totalPages ? 1 : currentPage + 1;
      updatePage();
    });
  }

  // If out of range (e.g. after JSON updates), reset to 1
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

// NUOVA FUNZIONE DI UTILITÀ PER LA FORMATTAZIONE
const formatNumberConditionally = (value) => {
    // Se il valore è un intero (es. 10 o 10.0), lo mostra senza decimali
    if (Number.isInteger(value)) {
        return value.toString();
    }
    // Altrimenti, lo formatta con due decimali (es. 10.33)
    return value.toFixed(2);
};

function renderSeasonSummary(season, totale, numberOfLabels, totalRaces) {
  // Calcolo dei valori grezzi
  const rawAvgSeason = totale / numberOfLabels;
  const rawAvgCorsa = totale / totalRaces;
  
  // Applicazione della formattazione condizionale
  const avgseason = formatNumberConditionally(rawAvgSeason);
  const avgcorsa = formatNumberConditionally(rawAvgCorsa);

  const stampaseason = `
      <div class="colore">
        <p>Totale km percorsi in ${season} ${totale} <img src="Icons/traguardo.png"> </p>
        <p>km medi per giro in ${season} ${avgcorsa} </p>
        <p>media km per stagione ${avgseason} </p>
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