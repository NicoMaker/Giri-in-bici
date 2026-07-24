// ============================================================
// schede.js — HTML delle schede periodo e impaginazione della griglia
// Richiamato da JS/grafico_stagioni.js
// ============================================================

const createStampa = (labels, data, path, image, season, cssclass, avgValues) =>
    labels
      .map(
        (label, index) => `
      <div class="${cssclass}contorno">
        <a href="${path}/Periodi/${label}.html">
          <img class="immaginestagione" src="Icons/${image}">
          <p class="titoli">
            ${season} ${label}
            <p class="misuracolore">Totale km ${formatItalianNumber(data[label].totalDistance)}
              <img src="Icons/traguardo.png">
            </p>
            <p class="misuracolore">Percentuale periodo ${avgValues[index]} %</p>
            <p class="misuracolore">Totale corse ${formatItalianNumber(data[label].numberOfRaces)}</p>
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

function adjustContainerLayout(cssclass) {
  const container = document.querySelector(".container");
  const items = document.querySelectorAll(`.${cssclass}contorno`);
  if (items.length % 2 !== 0) container.classList.add("odd-items");
}
