document.addEventListener("DOMContentLoaded", function () {
  const data = [
    { date: "30 maggio", number: 1, place: "quasi San Daniele", distance: 45 },
    { date: "18 giugno", number: 2, place: "San Daniele", distance: 52 },
    { date: "21 giugno", number: 3, place: "Pordenone", distance: 61 },
    { date: "23 giugno", number: 4, place: "San Daniele", distance: 66 },
    { date: "26 giugno", number: 5, place: "Latisana", distance: 55 },
    { date: "28 giugno", number: 6, place: "Udine", distance: 60 },
    {
      date: "30 giugno",
      number: 7,
      place: "Spilmbergo + Pinzano",
      distance: 73,
    },
    { date: "2 luglio", number: 8, place: "Marano + Ariis", distance: 80 },
    { date: "4 luglio", number: 9, place: "Fagagna", distance: 55 },
    {
      date: "7 luglio",
      number: 10,
      place: "Palmanova + Mortegliano",
      distance: 66,
    },
    {
      date: "9 luglio",
      number: 11,
      place: "San vito + Sesto al Reghena + Portogruaro + Cordovado",
      distance: 85,
    },
    {
      date: "14 luglio",
      number: 12,
      place: "Valvasone + Porcia + Pordenone",
      distance: 96,
    },
    {
      date: "18 luglio",
      number: 13,
      place: "Da Palmanova a Grado",
      distance: 61,
    },
    {
      date: "22 luglio",
      number: 14,
      place: "San Daniele + Fagagna",
      distance: 60,
    },
    {
      date: "25 luglio",
      number: 15,
      place: "Cividale + Dobrovo <img src='../Icone/Slovenia.png' />",
      distance: 124,
    },
    {
      date: "8 agosto",
      number: 16,
      place: "Da san Daniele a Gemona e Venzone",
      distance: 55,
    },
    {
      date: "10 agosto",
      number: 17,
      place: "lago di Cornino + Spilimbergo",
      distance: 88,
    },
    { date: "12 agosto", number: 18, place: "Grado + Aquileia", distance: 115 },
    { date: "14 agosto", number: 19, place: "Udine", distance: 48 },
    { date: "16 agosto", number: 20, place: "lago di Cavazzo", distance: 112 },
    {
      date: "19 agosto",
      number: 21,
      place: "Spilmbergo + Sacile",
      distance: 141,
    },
    {
      date: "22 agosto",
      number: 22,
      place: "Valvasone + San vito",
      distance: 44,
    },
    { date: "25 agosto", number: 23, place: "Lignano", distance: 88 },
    { date: "9 settembre", number: 24, place: "Conegliano", distance: 139 },
    {
      date: "11 settembre",
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

  const kmElement = document.getElementById("km");
  const totalKm = data.reduce((total, row) => total + row.distance, 0);
  const totalRaces = data.length;
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