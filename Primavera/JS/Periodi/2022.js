document.addEventListener("DOMContentLoaded", function () {
  const data = [
      {
        date: "06 Marzo",
        number: 1,
        place:
          '<a href="https://www.komoot.it/tour/693482374?share_token=a6flVOci0pbzosPJUSNWhFa0a97SlfOCDKqo69P5D2WBLp1Oz4&ref=wtd" target="_blank">Susans + Cascate di Cimano</a>',
        distance: 74,
      },
      {
        date: "13 Marzo",
        number: 2,
        place:
          '<a href="https://www.komoot.it/tour/701674637?ref=avs" target="_blank">Gemona</a>',
        distance: 96,
      },
      {
        date: "20 Marzo",
        number: 3,
        place:
          '<a href="https://www.komoot.it/tour/710006995?ref=avs" target="_blank">Monte di Ragogna</a>',
        distance: 74,
      },
      {
        date: "10 Aprile",
        number: 4,
        place:
          '<a href="https://www.komoot.it/tour/732123286?ref=avs" target="_blank">Lignano</a>',
        distance: 92,
      },
      {
        date: "14 Maggio",
        number: 5,
        place:
          '<a href="https://www.komoot.it/tour/769427425?ref=avs&share_token=aVQi4OEavDpuWTpO3drMtMMikadBNi3XURzd0WCLbAKVEsxe61" target="_blank">Fagagna</a>',
        distance: 58,
      },
      { date: "17 Maggio", number: 6, place: "Varmo + Romans", distance: 44 },
      {
        date: "22 Maggio",
        number: 7,
        place:
          '<a href="https://www.komoot.it/tour/778266827?ref=avs" target="_blank">Colloredo di Monte Albano</a>',
        distance: 75,
      },
      {
        date: "26 Maggio",
        number: 8,
        place: "Camino + Tagliamento",
        distance: 29,
      },
      {
        date: "28 Maggio",
        number: 9,
        place:
          '<a href="https://www.komoot.it/tour/786397802?ref=avs&share_token=ajvrgMYAaFlHo36DQXmbILhrTO0QlAZuRGj4DX6w9QPpaijX9B" target="_blank">Palmanova</a>',
        distance: 64,
      },
      {
        date: "02 Giugno",
        number: 10,
        place: "Madrisio + Tagliamento",
        distance: 40,
      },
      {
        date: "05 Giugno",
        number: 11,
        place:
          '<a href="https://www.komoot.it/tour/795420371?ref=avs&share_token=a8NG0kPzcg2q4wb6nwQxV2bMsRDwm67RCmVjF1AC3mC50b16DJ" target="_blank">Lago di Cavazzo</a>',
        distance: 114,
      },
      {
        date: "11 Giugno",
        number: 12,
        place:
          '<a href="https://www.komoot.it/tour/802966428?ref=avs&share_token=aC2MNcpxzQiDaqcQDZA6CrE8vrrCmrqPyw3kDUsc0DEW88iXxm" target="_blank">San Daniele</a>',
        distance: 53,
      },
      {
        date: "18 Giugno",
        number: 13,
        place:
          '<a href="https://www.komoot.it/tour/812617844?share_token=azakgBJrc1sVY48S584BifCzoz5RaHnsDpTfI5wb6W2R9ME8P1&ref=wtd" target="_blank">Marano</a>',
        distance: 72,
      },
    ],
    tableBody = document.querySelector("table tbody");

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
    totalRaces = data.length,
    mediaValue = (totalKm / totalRaces).toFixed(2);

  kmElement.innerHTML = `
        <div class="colore">
            <p> Totale km percorsi ${totalKm} 
            <img src="../../Icons/traguardo.png"> </p>
            <p> Media km percorsi ${mediaValue} </p>
        </div>
    `;
});