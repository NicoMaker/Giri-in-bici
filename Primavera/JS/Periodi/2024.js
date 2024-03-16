document.addEventListener("DOMContentLoaded", function () {
  const data = [
    {
      date: "16 Marzo",
      number: 1,
      place: '<a href="https://www.komoot.com/it-it/tour/1471505044?ref=wtd&share_token=ao5QJ9VrSHYTASKjAJqoVSVPZhjeLoIDMoNEsD6I7akP5pEPlA" target="_blank">Madrisio + Ariis</a>',
      distance: 52,
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

  const mediaValue = (totalKm / totalRaces).toFixed(2);

  kmElement.innerHTML = `
        <div class="colore">
            <p> Totale km percorsi ${totalKm} <img src="../Icone/traguardo.png"> </p>
            <p> Media km percorsi ${mediaValue} </p>
        </div>
    `;
});