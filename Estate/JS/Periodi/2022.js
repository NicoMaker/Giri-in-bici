document.addEventListener("DOMContentLoaded", function () {
  function loadDataFromJSON(url) {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load data");
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error loading data:", error);
      });
  }

  function updateTableAndStats(data) {
    const tableBody = document.querySelector("table tbody"),
      kmElement = document.getElementById("km");

    data.forEach((row) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${row.date}</td>
        <td>${row.number}</td>
        <td>${row.place}</td>
        <td>${row.distance}</td>
        <td>km</td>
      `;
      tableBody.appendChild(newRow);
    });

    const totalKm = data.reduce((total, row) => total + row.distance, 0),
      totalRaces = data.length,
      mediaValue = (totalKm / totalRaces).toFixed(2);

    kmElement.innerHTML = `
      <div class="colore">
        <p> Totale km percorsi ${totalKm} 
          <img src="../../Icons/traguardo.png"> 
        </p>
        <p> Media km percorsi ${mediaValue} </p>
      </div>
    `;
  }

  const jsonUrl = "../JS/Periodi/Json/2022.json";
  loadDataFromJSON(jsonUrl).then((data) => {
    updateTableAndStats(data);
  });
});
