document.addEventListener("DOMContentLoaded", function () {
  function loadDataFromJSON(url) {
    return fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load data");
        return response.json();
      })
      .catch((error) => console.error("Error loading data:", error));
  }

  function createTableRow(row, index) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${row.date}</td>
      <td>${index + 1}</td>
      <td>${row.place}</td>
      <td>${row.distance}</td>
      <td>km</td>
    `;
    return newRow;
  }

  const appendRowToTable = (tableBody, row) => tableBody.appendChild(row);

  function calculateAndDisplayStats(data) {
    const totalKm = data.reduce((total, row) => total + row.distance, 0),
      totalRaces = data.length,
      mediaValue = (totalKm / totalRaces).toFixed(2),
      kmElement = document.getElementById("km");
    kmElement.innerHTML = `
      <div class="colore">
        <p> Totale km percorsi ${totalKm} 
          <img src="../../Icons/traguardo.png"> 
        </p>
        <p> Media km percorsi ${mediaValue} </p>
      </div>
    `;
  }

  function updateTableAndStats(data) {
    const tableBody = document.querySelector("table tbody");

    data.forEach((row, index) => {
      const newRow = createTableRow(row, index);
      appendRowToTable(tableBody, newRow);
    });

    calculateAndDisplayStats(data);
  }

  const jsonUrl = document.getElementById("json").getAttribute("link");
  loadDataFromJSON(jsonUrl).then((data) => updateTableAndStats(data));
});
