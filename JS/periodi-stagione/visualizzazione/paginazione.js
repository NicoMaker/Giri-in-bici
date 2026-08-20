// ============================================================
// paginazione.js — Mostra due periodi per volta, con avanti e indietro
// Richiamato da JS/periodi_stagione.js
// ============================================================

function renderDataListPaginated(
  labels,
  data,
  path,
  image,
  season,
  cssclass,
  avgValues,
) {
  const itemsPerPage = 1;
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
    const currentAvgValues = avgValues.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

    // Il periodo precedente e' quello prima di startIndex nell'elenco
    // completo (non nella pagina corrente), cosi' il confronto resta
    // corretto anche mostrando un periodo per volta.
    const prevLabel = startIndex > 0 ? labels[startIndex - 1] : null;
    const prevData = prevLabel ? data[prevLabel] : null;

    updateStampa(
      createStampa(
        currentLabels,
        currentData,
        path,
        image,
        season,
        cssclass,
        currentAvgValues,
        prevData,
      ),
    );

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
