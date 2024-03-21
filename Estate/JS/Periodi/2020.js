document.addEventListener("DOMContentLoaded", function () {
  const data = [
    { date: "30 Maggio", number: 1, place: "quasi San Daniele", distance: 45 },
    { date: "18 Giugno", number: 2, place: "San Daniele", distance: 52 },
    { date: "21 Giugno", number: 3, place: "Pordenone", distance: 61 },
    { date: "23 Giugno", number: 4, place: "San Daniele", distance: 66 },
    { date: "26 Giugno", number: 5, place: "Latisana", distance: 55 },
    { date: "28 Giugno", number: 6, place: "Udine", distance: 60 },
    {
      date: "30 Giugno",
      number: 7,
      place: "Spilmbergo + Pinzano",
      distance: 73,
    },
    { date: "02 Luglio", number: 8, place: "Marano + Ariis", distance: 80 },
    { date: "04 Luglio", number: 9, place: "Fagagna", distance: 55 },
    {
      date: "07 Luglio",
      number: 10,
      place: "Palmanova + Mortegliano",
      distance: 66,
    },
    {
      date: "09 Luglio",
      number: 11,
      place: "San vito + Sesto al Reghena + Portogruaro + Cordovado",
      distance: 85,
    },
    {
      date: "14 Luglio",
      number: 12,
      place: "Valvasone + Porcia + Pordenone",
      distance: 96,
    },
    {
      date: "18 Luglio",
      number: 13,
      place: "Da Palmanova a Grado",
      distance: 61,
    },
    {
      date: "22 Luglio",
      number: 14,
      place: "San Daniele + Fagagna",
      distance: 60,
    },
    {
      date: "25 Luglio",
      number: 15,
      place: "Cividale + Dobrovo <img src='../../Icone/Slovenia.png' />",
      distance: 124,
    },
    {
      date: "08 Agosto",
      number: 16,
      place: "Da san Daniele a Gemona e Venzone",
      distance: 55,
    },
    {
      date: "10 Agosto",
      number: 17,
      place: "lago di Cornino + Spilimbergo",
      distance: 88,
    },
    { date: "12 Agosto", number: 18, place: "Grado + Aquileia", distance: 115 },
    { date: "14 Agosto", number: 19, place: "Udine", distance: 48 },
    { date: "16 Agosto", number: 20, place: "lago di Cavazzo", distance: 112 },
    {
      date: "19 Agosto",
      number: 21,
      place: "Spilmbergo + Sacile",
      distance: 141,
    },
    {
      date: "22 Agosto",
      number: 22,
      place: "Valvasone + San vito",
      distance: 44,
    },
    { date: "25 Agosto", number: 23, place: "Lignano", distance: 88 },
    { date: "09 Settembre", number: 24, place: "Conegliano", distance: 139 },
    {
      date: "11 Settembre",
      number: 25,
      place: "Redipuglia + Duino + Santa Croce + Sistiana",
      distance: 152,
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
            <p> Totale km percorsi ${totalKm} 
            <img src="../../Icone/traguardo.png"> </p>
            <p> Media km percorsi ${mediaValue} </p>
        </div>
    `;
});