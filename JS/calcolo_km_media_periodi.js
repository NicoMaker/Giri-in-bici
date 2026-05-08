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
      <td>${formatItalianNumber(row.distance)}</td>
      <td>km</td>
    `;
    return newRow;
  }

  const appendRowToTable = (tableBody, row) => tableBody.appendChild(row);

  function formatNumber(value) {
    // Always show 2 decimal places for tables
    return formatItalianNumber(value, true);
  }

  function formatItalianNumber(num, forceDecimals = false) {
    if (typeof num === 'string') {
      num = parseFloat(num);
    }
    if (isNaN(num)) return '0';
    
    // For tables, always show 2 decimal places
    let decimalString = '';
    if (forceDecimals || !Number.isInteger(num)) {
      const decimalPart = num.toFixed(2).split('.')[1];
      // Only add decimal part if it's not "00"
      if (decimalPart !== '00') {
        decimalString = ',' + decimalPart;
      }
    }
    
    // Handle decimal part - use comma for Italian format
    const parts = num.toString().split('.');
    let integerPart = parts[0];
    
    // Add thousand separators (periods)
    if (integerPart.length > 3) {
      const groups = [];
      let i = integerPart.length;
      while (i > 0) {
        const start = Math.max(0, i - 3);
        groups.unshift(integerPart.substring(start, i));
        i -= 3;
      }
      integerPart = groups.join('.');
    }
    
    return integerPart + decimalString;
  }

  function calculateAndDisplayStats(data) {
    const totalkm = data.reduce((total, row) => total + row.distance, 0);
    const totalRaces = data.length;
    const rawMediaValue = totalkm / totalRaces;

    const mediaValue = formatNumber(rawMediaValue);
    const formattedTotalKm = formatItalianNumber(totalkm);

    const kmElement = document.getElementById("km");
    kmElement.innerHTML = `
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
      const newRow = createTableRow(row, index);
      appendRowToTable(tableBody, newRow);
    });

    calculateAndDisplayStats(data);
  }

  const jsonUrl = document.getElementById("json").getAttribute("link");
  loadDataFromJSON(jsonUrl).then((data) => {
    if (data && Array.isArray(data)) {
      updateTableAndStats(data);
    }
  });
});
