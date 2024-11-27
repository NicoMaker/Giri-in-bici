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
        avgValues
      );
      renderSeasonSummary(season, totale, labels.length, totalRaces);
      adjustContainerLayout(cssclass);
    })
    .catch((error) => console.error("Error loading the JSON data:", error));
});

async function fetchSubPeriods(subPeriods) {
  const promises = Object.entries(subPeriods).map(([period, file]) =>
    fetch(file)
      .then((response) => response.json())
      .then((data) => {
        const totalDistance = calculateTotal(
          data.map((entry) => entry.distance)
        );
        const numberOfRaces = data.length;
        return { [period]: { totalDistance, numberOfRaces } };
      })
  );

  const results = await Promise.all(promises);
  return results.reduce((acc, curr) => Object.assign(acc, curr), {});
}

const calculateTotal = (values) => values.reduce((acc, cur) => acc + cur, 0),
  calculateTotalRaces = (labels, data) =>
    labels.reduce((acc, label) => acc + data[label].numberOfRaces, 0),
  calculateAverageValues = (labels, data, totale) =>
    labels.map((label) =>
      ((data[label].totalDistance / totale) * 100).toFixed(2)
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
    `
      )
      .join(""),
  updateStampa = (stampa) =>
    (document.getElementById(
      "stampa"
    ).innerHTML = `<div class="container">${stampa}</div>`);

function renderDataListPaginated(
  labels,
  data,
  path,
  image,
  season,
  cssclass,
  avgValues
) {
  const itemsPerPage = 2;
  let currentPage = 1;
  const totalPages = Math.ceil(labels.length / itemsPerPage);

  function updatePage() {
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
        currentAvgValues
      );

    updateStampa(stampa);

    const pagination = document.getElementById("pagination");
    pagination.innerHTML = `
      <button id="prev" ${currentPage === 1 ? "disabled" : ""}>
        <span class="material-icons">arrow_back</span>
      </button>
      <span id="page-indicator">Dati  ${season} ${currentPage} di ${totalPages}</span>
      <button id="next" ${currentPage === totalPages ? "disabled" : ""}>
        <span class="material-icons">arrow_forward</span>
      </button>
    `;

    document.getElementById("prev").addEventListener("click", () => {
      if (currentPage === 1) currentPage = totalPages; // Vai all'ultima pagina
      else currentPage--;
      updatePage();
    });

    document.getElementById("next").addEventListener("click", () => {
      if (currentPage === totalPages)
        currentPage = 1; // Torna alla prima pagina
      else currentPage++;

      updatePage();
    });
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
  avgValues
) =>
  renderDataListPaginated(
    labels,
    data,
    path,
    image,
    season,
    cssclass,
    avgValues
  );

function renderSeasonSummary(season, totale, numberOfLabels, totalRaces) {
  const avgseason = (totale / numberOfLabels).toFixed(2),
    avgcorsa = (totale / totalRaces).toFixed(2),
    stampaseason = `
      <div class="colore">
        <p>Totale km percorsi in ${season} ${totale} <img src="Icons/traguardo.png"> </p>
        <p>km medi per corsa in ${season} ${avgcorsa} </p>
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
