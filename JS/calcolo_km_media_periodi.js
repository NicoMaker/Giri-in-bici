document.addEventListener("DOMContentLoaded", function () {
  function loadDataFromJSON(url) {
    return fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load data");
        return response.json();
      })
      .catch((error) => console.error(`Error loading data: ${error}`));
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
    const totalkm = data.reduce((total, row) => total + row.distance, 0);
    const totalRaces = data.length;
    // Calcola il valore grezzo della media
    const rawMediaValue = totalkm / totalRaces;

    let mediaValue;

    // Controlla se il valore è un intero
    if (Number.isInteger(rawMediaValue)) {
      // Se è intero (es. 10.0), visualizza come intero (10)
      mediaValue = rawMediaValue.toString();
    } else {
      // Se non è intero (es. 10.333), visualizza con due cifre decimali (10.33)
      mediaValue = rawMediaValue.toFixed(2);
    }

    const kmElement = document.getElementById("km");
    kmElement.innerHTML = `
      <div class="colore">
        <p> Totale km percorsi ${totalkm} 
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
  loadDataFromJSON(jsonUrl).then((data) => {
    // Assicurati che 'data' esista e sia un array prima di procedere
    if (data && Array.isArray(data)) {
      updateTableAndStats(data);
    }
  });
});