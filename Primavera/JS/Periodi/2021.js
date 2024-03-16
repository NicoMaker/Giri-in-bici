document.addEventListener("DOMContentLoaded", function () {
  const data = [
    {
      date: "10 Aprile",
      number: 1,
      place: "Giro per il comune + Bugnins e Flambro",
      distance: 65,
    },
    {
      date: "18 Aprile",
      number: 2,
      place:
        '<a href="https://www.komoot.it/tour/933842059?share_token=acsryJOxWkClD3pUEeL7IjRatlvVG0kv506CCu4mOmDccNFBoj&ref=wtd" target="_blank">San Daniele + Castello di Ragogna + quasi monte di Ragogna</a>',
      distance: 64,
    },
    {
      date: "24 Aprile",
      number: 3,
      place:
        '<a href="https://www.komoot.it/tour/679147310?share_token=awRZOiYfllDFetf1Xl8lnao0C8S1aNuqWplhhr1BdZ0SaP7Ffx&ref=wtd" target="_blank">Cividale</a>',
      distance: 93,
    },
    {
      date: "08 Maggio",
      number: 4,
      place: "Cisterna (corsa velocita', solo andata)",
      distance: 19,
    },
    {
      date: "15 Maggio",
      number: 5,
      place: "Giro per il comune + Virco e Flambro",
      distance: 61,
    },
    { date: "22 Maggio", number: 6, place: "Cisterna", distance: 48 },
    {
      date: "30 Maggio",
      number: 7,
      place: "Giro per il comune + Coderno e Belgrado",
      distance: 52,
    },
    {
      date: "02 Giugno",
      number: 8,
      place:
        '<a href="https://www.komoot.it/tour/976466690?share_token=adXasja1llpovYEyCe4DS4ELiOny8BlYEi1wBO8IZO8NGRYFSW&ref=wtd" target="_blank">San Daniele + San Pietro</a>',
      distance: 65,
    },
    { date: "05 Giugno", number: 9, place: "Virco", distance: 31 },
    {
      date: "09 Giugno",
      number: 10,
      place: "Giro per il comune + Belgrado",
      distance: 49,
    },
    {
      date: "14 Giugno",
      number: 11,
      place: "Virco + San Vidotto",
      distance: 32,
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