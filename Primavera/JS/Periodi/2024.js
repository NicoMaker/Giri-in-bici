document.addEventListener("DOMContentLoaded", function () {
  const data = [
    {
      date: "Data",
      number: 1,
      place: '<a href="link" target="_blank">Nome</a>',
      distance: 0,
    },
  ];

  const tableBody = document.querySelector("table tbody");

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

  const kmElement = document.getElementById("km"),
    totalKm = data.reduce((total, row) => total + row.distance, 0),
    totalRaces = data.length;
  kmElement.dataset.km = totalKm;
  kmElement.dataset.corse = totalRaces;

  const mediaValue = (totalKm / totalRaces).toFixed(2);

  kmElement.innerHTML = `
        <div class="colore">
            <p> Totale km percorsi ${totalKm} <img src="../Icone/traguardo.png"> </p>
            <p> Media km percorsi ${mediaValue} </p>
        </div>
    `;
});