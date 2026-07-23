// calcolo_km_media_periodi.js
// Dipendenze: JS/utils.js (caricato prima in HTML)

document.addEventListener("DOMContentLoaded", function () {
  function createTableRow(row, index) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${row.date}</td>
      <td>${formatItalianNumber(index + 1)}</td>
      <td>${row.place}</td>
      <td>${formatItalianNumber(row.distance)}</td>
      <td>km</td>
    `;
    return newRow;
  }

  function calculateAndDisplayStats(data) {
    const totalkm = data.reduce((total, row) => total + row.distance, 0);
    const totalRaces = data.length;
    const mediaValue = formatNumber(totalkm / totalRaces);
    const formattedTotalKm = formatItalianNumber(totalkm);

    document.getElementById("km").innerHTML = `
      <div class="colore">
        <p class="misuracolore">Totale km percorsi ${formattedTotalKm}
          <img src="../../Icons/traguardo.png" alt="Icona traguardo">
        </p>
        <p class="misuracolore">Media km percorsi ${mediaValue}</p>
      </div>
    `;
  }

  function updateTableAndStats(data) {
    const tableBody = document.querySelector("table tbody");
    data.forEach((row, index) => {
      tableBody.appendChild(createTableRow(row, index));
    });
    calculateAndDisplayStats(data);
  }

  const jsonUrl = document.getElementById("json").getAttribute("link");
  fetchJSON(jsonUrl)
    .then((data) => {
      if (data && Array.isArray(data)) updateTableAndStats(data);
    })
    .catch((error) => console.error(`Error loading data: ${error}`));
});
