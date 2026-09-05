// ============================================================
// schede.js — HTML delle schede periodo e impaginazione della griglia
// Richiamato da JS/periodi_stagione.js
// ============================================================

const createStampa = (
    labels,
    data,
    path,
    image,
    season,
    cssclass,
    avgValues,
    prevData,
  ) =>
    labels
      .map((label, index) => {
        const km = data[label].totalDistance;
        const corse = data[label].numberOfRaces;
        const percKm = prevData
          ? Variazioni.calcVariazione(km, prevData.totalDistance)
          : null;
        const percCorse = prevData
          ? Variazioni.calcVariazione(corse, prevData.numberOfRaces)
          : null;
        const kmMediCorsa = km / corse;
        const percKmMediCorsa =
          prevData && prevData.numberOfRaces
            ? Variazioni.calcVariazione(
                kmMediCorsa,
                prevData.totalDistance / prevData.numberOfRaces,
              )
            : null;

        return `
      <div class="${cssclass}contorno">
        <a href="${path}/${label}.html">
          <img class="immaginestagione" src="/img/Icons/${image}">
          <p class="titoli">
            ${season} ${label}
            <p class="misuracolore">Totale km ${formatItalianNumber(km)}
              <img src="/img/Icons/traguardo.png">
              ${Variazioni.badgeVariazione(percKm, "vs periodo prec.")}
            </p>
            <p class="misuracolore">Percentuale periodo ${avgValues[index]} %</p>
            <p class="misuracolore">Totale corse ${formatItalianNumber(corse)}
              ${Variazioni.badgeVariazione(percCorse, "vs periodo prec.")}
            </p>
            <p class="misuracolore">km medi per corsa ${formatNumber(kmMediCorsa)}
              ${Variazioni.badgeVariazione(percKmMediCorsa, "vs periodo prec.")}
            </p>
          </p>
          <span class="colore__vai-a">Vai al periodo <span class="freccia" aria-hidden="true">→</span></span>
        </a>
      </div>
    `;
      })
      .join(""),
  updateStampa = (stampa) =>
    (document.getElementById("stampa").innerHTML =
      `${Variazioni.legenda("(% calcolata rispetto al periodo precedente)")}<div class="container">${stampa}</div>`);

function adjustContainerLayout(cssclass) {
  const container = document.querySelector(".container");
  const items = document.querySelectorAll(`.${cssclass}contorno`);
  if (items.length % 2 !== 0) container.classList.add("odd-items");
}
