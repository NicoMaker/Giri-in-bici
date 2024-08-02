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
        totale = values.reduce((acc, cur) => acc + cur, 0),
        avgValues = calculateAverageValues(labels, data, totale);

      renderDoughnutChart(labels, values, colors, season);
      renderDataList(labels, data, path, image, season, cssclass, avgValues);
      renderSeasonSummary(season, totale, labels.length, numberOfRaces);

      adjustContainerLayout(cssclass);
    })
    .catch((error) => console.error("Error loading the JSON data:", error));
}),
  (calculateAverageValues = (labels, data, totale) =>
    labels.map((label) => ((data[label] / totale) * 100).toFixed(2)));

function renderDoughnutChart(labels, values, colors, season) {
  const datasets = [
      {
        label: `km ${season}`,
        backgroundColor: colors,
        borderColor: ["black"],
        borderWidth: 1,
        data: values,
      },
    ],
    doughnutData = {
      labels,
      datasets,
    },
    doughnutConfig = {
      type: "doughnut",
      data: doughnutData,
    },
    doughnutCtx = document.getElementById("doughnut-chart").getContext("2d");

  new Chart(doughnutCtx, doughnutConfig);
}

function renderDataList(
  labels,
  data,
  path,
  image,
  season,
  cssclass,
  avgValues
) {
  const stampa = labels
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
    .join("");

  document.getElementById(
    "stampa"
  ).innerHTML = `<div class="container">${stampa}</div>`;
}

function renderSeasonSummary(season, totale, numberOfLabels, numberOfRaces) {
  const avgseason = (totale / numberOfLabels).toFixed(2),
    avgcorsa = (totale / numberOfRaces).toFixed(2),
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
