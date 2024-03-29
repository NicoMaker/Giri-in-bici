document.addEventListener("DOMContentLoaded", function () {
  const data = [
      {
        date: "07 Novembre",
        number: 1,
        place: "Villalta + Colloredo di Monte Albano",
        distance: 78,
      },
      {
        date: "13 Novembre",
        number: 2,
        place: "giro per il comune + San Lorenzo",
        distance: 77,
      },
      {
        date: "22 Novembre",
        number: 3,
        place: "Giro per il Tagliamento",
        distance: 37,
      },
      { date: "13 Dicembre", number: 4, place: "Lignano", distance: 85 },
      {
        date: "20 Dicembre",
        number: 5,
        place:
          '<a href="https://www.komoot.it/tour/679143698?ref=wtd" target="_blank">Gemona</a>',
        distance: 93,
      },
      { date: "22 Dicembre", number: 6, place: "Mortegliano", distance: 42 },
      { date: "30 Dicembre", number: 7, place: "Belgrado", distance: 23 },
      {
        date: "04 Gennaio",
        number: 8,
        place: "giro per il comune",
        distance: 61,
      },
      {
        date: "17 Gennaio",
        number: 9,
        place: "giro per il comune",
        distance: 61,
      },
      {
        date: "24 Gennaio",
        number: 10,
        place: "giro per il comune",
        distance: 30,
      },
      {
        date: "06 Febbraio",
        number: 11,
        place:
          '<a href="https://www.komoot.it/tour/976320205?share_token=azPlZsKaK63TJX2FrR7GoETH2i0eFsj4FW7FTXm7HyXjtCZgd6&ref=wtd" target="_blank">Spilimbergo</a>',
        distance: 53,
      },
      {
        date: "13 Febbraio",
        number: 12,
        place:
          '<a href="https://www.komoot.it/tour/679162128?ref=wtd" target="_blank">Susans</a>',
        distance: 67,
      },
      { date: "16 Febbraio", number: 13, place: "Talmassons", distance: 40 },
      {
        date: "21 Febbraio",
        number: 14,
        place:
          '<a href="https://www.komoot.it/tour/679145501?ref=wtd" target="_blank">Colloredo di Monte Albano + Tavagnacco</a>',
        distance: 79,
      },
      {
        date: "27 Febbraio",
        number: 15,
        place:
          '<a href="https://www.komoot.it/tour/679146087?ref=wtd" target="_blank">Spilimbergo + Pinzano + San Daniele</a>',
        distance: 76,
      },
      {
        date: "07 Marzo",
        number: 16,
        place:
          '<a href="https://www.komoot.it/tour/976494707?share_token=an6ZgIs8kEbAq0nuR73UwpW5wJ959W6L4YUur8mVcBewNX8nFG&ref=wtd" target="_blank">Latisana per rosta</a>',
        distance: 64,
      },
      {
        date: "10 Marzo",
        number: 17,
        place: "Codroipo (corsa velocita')",
        distance: 30,
      },
      {
        date: "14 Marzo",
        number: 18,
        place:
          '<a href="https://www.komoot.it/tour/976322289?share_token=afRU9M0pavJYoJ6W0sbRSCFpHIKoGVDPBjYFnR4ji2IJqaVoxm&ref=wtd" target="_blank">Belgrado + Carpacco + Villanova</a>',
        distance: 74,
      },
      {
        date: "20 Marzo",
        number: 19,
        place:
          '<a href="https://www.komoot.it/tour/976324286?share_token=ax53GrX4DHmHMgcIWGu2F3Q6UXmUdkg2YHpaHt9NGbyM36YXp9&ref=wtd" target="_blank">Mortegliano + Fauglis + Rivignano</a>',
        distance: 72,
      },
      {
        date: "24 Marzo",
        number: 20,
        place:
          '<a href="https://www.komoot.it/tour/933841298?share_token=a26opiFjvSm1nhKf2tQ2M44hQpXXfd44nWJ4g8SViyVhMuNHJn&ref=wtd" target="_blank">Fagagna + San Daniele</a>',
        distance: 62,
      },
      {
        date: "02 Aprile",
        number: 21,
        place:
          '<a href="https://www.komoot.it/tour/679146663?ref=wtd" target="_blank">Clauzetto + Vito d\'Asio + Anduins + Pinzano + San Daniele</a>',
        distance: 101,
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