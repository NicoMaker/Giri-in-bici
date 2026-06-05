// grafico_stagioni.js
// Dipendenze: JS/utils.js, JS/chart/chart-configs.js, JS/chart/chart-renderer.js

document.addEventListener("DOMContentLoaded", async function () {
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error(
      "Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js",
    );
    return;
  }

  const jsonUrl = document.getElementById("json").getAttribute("link");

  try {
    const seasonData = await fetchJSON(jsonUrl);
    const { season, image, path, cssclass, colors } = seasonData;

    const subPeriodData = await fetchSubPeriods(seasonData.subPeriods);
    const labels = Object.keys(subPeriodData);
    const values = labels.map((label) => subPeriodData[label].totalDistance);
    const totale = values.reduce((acc, cur) => acc + cur, 0);
    const totalRaces = labels.reduce(
      (acc, label) => acc + subPeriodData[label].numberOfRaces,
      0,
    );
    const avgValues = labels.map((label) => {
      const pct = (subPeriodData[label].totalDistance / totale) * 100;
      return formatNumber(pct);
    });
    const totalePeriodi = labels.length;

    const chartData = { season, image, path, cssclass, colors, subPeriodData };

    await window.chartRenderer.createChart("stagioniLine", chartData);
    await window.chartRenderer.createChart("stagioni", chartData);

    renderDataList(labels, subPeriodData, path, image, season, cssclass, avgValues);
    renderSeasonSummary(season, totale, totalePeriodi, totalRaces);
    adjustContainerLayout(cssclass);
  } catch (error) {
    console.error(`Error loading the JSON data: ${error}`);
  }
});

async function fetchSubPeriods(subPeriods) {
  const promises = Object.entries(subPeriods).map(([period, file]) =>
    fetchJSON(file).then((data) => {
      const totalDistance = data.reduce((acc, e) => acc + e.distance, 0);
      return { [period]: { totalDistance, numberOfRaces: data.length } };
    }),
  );
  const results = await Promise.all(promises);
  return results.reduce((acc, curr) => Object.assign(acc, curr), {});
}

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

function renderDataListPaginated(labels, data, path, image, season, cssclass, avgValues) {
  const itemsPerPage = 2;
  const storageKey = `page_${season}`;
  let currentPage = parseInt(localStorage.getItem(storageKey)) || 1;
  const totalPages = Math.ceil(labels.length / itemsPerPage);

  function updatePage() {
    localStorage.setItem(storageKey, currentPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLabels = labels.slice(startIndex, startIndex + itemsPerPage);
    const currentData = currentLabels.reduce((acc, label) => {
      acc[label] = data[label];
      return acc;
    }, {});
    const currentAvgValues = avgValues.slice(startIndex, startIndex + itemsPerPage);

    updateStampa(createStampa(currentLabels, currentData, path, image, season, cssclass, currentAvgValues));

    const pagination = document.getElementById("pagination");
    if (pagination) {
      pagination.innerHTML = `
        <button id="prev"><span class="material-icons">arrow_back</span></button>
        <span id="page-indicator">Dati della Stagione: <br/> ${season} ${currentPage} di ${totalPages}</span>
        <button id="next"><span class="material-icons">arrow_forward</span></button>
      `;

      document.getElementById("prev")?.addEventListener("click", () => {
        currentPage = currentPage === 1 ? totalPages : currentPage - 1;
        updatePage();
      });
      document.getElementById("next")?.addEventListener("click", () => {
        currentPage = currentPage === totalPages ? 1 : currentPage + 1;
        updatePage();
      });
    }
  }

  if (currentPage > totalPages) {
    currentPage = 1;
    localStorage.setItem(storageKey, currentPage);
  }
  updatePage();
}

const renderDataList = (labels, data, path, image, season, cssclass, avgValues) =>
  renderDataListPaginated(labels, data, path, image, season, cssclass, avgValues);

function renderSeasonSummary(season, totale, totalePeriodi, totalRaces) {
  const avgseason = formatNumber(totale / totalePeriodi);
  const avgcorsa = formatNumber(totale / totalRaces);
  const formattedTotalRaces = formatItalianNumber(totalRaces);

  document.getElementById("totale").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km percorsi in ${season} ${formatNumber(totale)} <img src="Icons/traguardo.png"></p>
      <p class="misuracolore">Km medi per giro in ${season} ${avgcorsa}</p>
      <p class="misuracolore">Media km per periodo ${avgseason}</p>
      <p class="misuracolore">Totale corse ${formattedTotalRaces}</p>
      <p class="misuracolore">Corse medie per periodo ${formatNumber(totalRaces / totalePeriodi)}</p>
      <hr style="margin: 10px 0; border-color: rgba(255,255,255,0.3);">
      <p class="misuracolore">Totale periodi: ${totalePeriodi}</p>
    </div>
  `;
}

function adjustContainerLayout(cssclass) {
  const container = document.querySelector(".container");
  const items = document.querySelectorAll(`.${cssclass}contorno`);
  if (items.length % 2 !== 0) container.classList.add("odd-items");
}
