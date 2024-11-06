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
    ).innerHTML = `<div class="container">${stampa}</div>`),
  calculateAvgSeason = (totale, numberOfLabels) =>
    (totale / numberOfLabels).toFixed(2),
  calculateAvgCorsa = (totale, numberOfRaces) =>
    (totale / numberOfRaces).toFixed(2),
  getContainer = () => document.querySelector(".container"),
  getItems = (cssclass) => document.querySelectorAll(`.${cssclass}contorno`),
  checkIsOdd = (length) => length % 2 !== 0,
  addOddItemsClass = (container) => container.classList.add("odd-items"),
  updateTotale = (stampaseason) =>
    (document.getElementById("totale").innerHTML = stampaseason),
  createStampaseason = (season, totale, avgseason, avgcorsa) =>
    `
      <div class="colore">
        <p>Totale km percorsi in ${season} ${totale} <img src="Icons/traguardo.png"> </p>
        <p>km medi per corsa in ${season} ${avgcorsa} </p>
        <p>media km per stagione ${avgseason} </p>
      </div>
    `;

function renderDataList(
  labels,
  data,
  path,
  image,
  season,
  cssclass,
  avgValues
) {
  const stampa = createStampa(
    labels,
    data,
    path,
    image,
    season,
    cssclass,
    avgValues
  );
  updateStampa(stampa);
}

function renderSeasonSummary(season, totale, numberOfLabels, totalRaces) {
  const avgseason = calculateAvgSeason(totale, numberOfLabels),
    avgcorsa = calculateAvgCorsa(totale, totalRaces),
    stampaseason = createStampaseason(season, totale, avgseason, avgcorsa);

  updateTotale(stampaseason);
}

function adjustContainerLayout(cssclass) {
  const container = getContainer(),
    items = getItems(cssclass),
    isOdd = checkIsOdd(items.length);

  if (isOdd) addOddItemsClass(container);
}
