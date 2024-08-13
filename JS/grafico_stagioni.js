document.addEventListener("DOMContentLoaded", function () {
  const jsonUrl = document.getElementById("json").getAttribute("link");

  fetch(jsonUrl)
    .then((response) => response.json())
    .then((json) => {
      const season = json.season,
        image = json.image,
        path = json.path,
        cssclass = json.cssclass,
        data = json.data,
        colors = json.colors,
        numberOfRaces = json.numberOfRaces,
        labels = Object.keys(data),
        values = Object.values(data),
        totale = calculateTotal(values),
        avgValues = calculateAverageValues(labels, data, totale);

      renderDoughnutChart(labels, values, colors, season);
      renderDataList(labels, data, path, image, season, cssclass, avgValues);
      renderSeasonSummary(season, totale, labels.length, numberOfRaces);

      adjustContainerLayout(cssclass);
    })
    .catch((error) => console.error("Error loading the JSON data:", error));
});

const calculateTotal = (values) => values.reduce((acc, cur) => acc + cur, 0),
  calculateAverageValues = (labels, data, totale) =>
    labels.map((label) => ((data[label] / totale) * 100).toFixed(2));

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
                <p>Totale km ${data[label]} 
                  <img src="Icons/traguardo.png">
                </p> 
                <p> ${avgValues[index]} % </p>
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

function renderSeasonSummary(season, totale, numberOfLabels, numberOfRaces) {
  const avgseason = calculateAvgSeason(totale, numberOfLabels),
    avgcorsa = calculateAvgCorsa(totale, numberOfRaces),
    stampaseason = createStampaseason(season, totale, avgseason, avgcorsa);

  updateTotale(stampaseason);
}

function adjustContainerLayout(cssclass) {
  const container = getContainer(),
    items = getItems(cssclass),
    isOdd = checkIsOdd(items.length);

  if (isOdd) addOddItemsClass(container);
}
