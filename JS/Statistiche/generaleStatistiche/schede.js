// ============================================================
// schede.js — Schede degli anni, due per pagina, con avanti e indietro
// Dipendenze: JS/utils.js (formatItalianNumber, formatNumber)
// Richiamato da Statistiche/Js/generaleStatistiche.js
// ============================================================

window.StatGenerali = window.StatGenerali || {};

(function (SG) {
  "use strict";

  SG.renderStampa = (statistics, avgValues, itemsPerPage, currentPage) => {
    const lastPage = Math.ceil(statistics.length / itemsPerPage);
    if (currentPage > lastPage) currentPage = 1;
    localStorage.setItem("page_statistiche", currentPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentStatistics = statistics.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
    const isOdd = currentStatistics.length === 1;

    const stampaElement = document.getElementById("stampa");
    if (stampaElement) {
      stampaElement.innerHTML = `
        <div class="${isOdd ? "container odd-items" : "container"}">
          ${currentStatistics
            .map(
              (entry, index) => `
            <div class="Statistiche">
              <a href="Statistiche/Anni/${entry.year}.html">
                <img class="immaginestagione" src="/img/Icons/Statistiche.png">
                <p class="titoli">Statistiche ${entry.year}</p>
                <p class="misuracolore">km totali ${formatItalianNumber(entry.km)} <img src="/img/Icons/traguardo.png"></p>
                <p class="misuracolore">Percentuale periodo ${avgValues[startIndex + index]} %</p>
                <p class="misuracolore">Totale corse ${formatItalianNumber(entry.numberOfRaces)}</p>
                <p class="misuracolore">km medi per corsa ${formatNumber(entry.km / entry.numberOfRaces)}</p>
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
        <button id="prev"><span class="material-icons">arrow_back</span></button>
        <span id="page-indicator">Dati Statistiche: <br/> Anni ${currentPage} di ${lastPage}</span>
        <button id="next"><span class="material-icons">arrow_forward</span></button>
      `;
      document.getElementById("prev")?.addEventListener("click", () => {
        SG.renderStampa(
          statistics,
          avgValues,
          itemsPerPage,
          currentPage === 1 ? lastPage : currentPage - 1,
        );
      });
      document.getElementById("next")?.addEventListener("click", () => {
        SG.renderStampa(
          statistics,
          avgValues,
          itemsPerPage,
          currentPage === lastPage ? 1 : currentPage + 1,
        );
      });
    }
  };
})(window.StatGenerali);
