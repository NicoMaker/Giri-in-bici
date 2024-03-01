document.addEventListener("DOMContentLoaded", function () {
  const data = [
    {
      date: "9 ottobre",
      number: 1,
      place:
        '<a href="https://www.komoot.it/tour/679150846?share_token=aKQuXqBSBnTXfaLf3YWKKxspOLezZyvhnhpX3gBvJ7BwPzlc9y&ref=wtd" target="_blank">Portogruaro</a>',
      distance: 70,
    },
    {
      date: "16 ottobre",
      number: 2,
      place:
        '<a href="https://www.komoot.it/tour/679152095?share_token=aI54C8mzoqdhJZKL3v8wkmW1WaD5RY3l1x94Q14VHPi9VJYSD3&ref=wtd" target="_blank">Moruzzo + Colloredo di Monte Albano</a>',
      distance: 75,
    },
    {
      date: "23 ottobre",
      number: 3,
      place:
        '<a href="https://www.komoot.it/tour/679153356?share_token=ayeAilcIOc0aVRD77b65UsLN3GKsBlmfLdDwoZDyuM1GNwOVHB&ref=wtd" target="_blank">Susans</a>',
      distance: 71,
    },
    {
      date: "7 novembre",
      number: 4,
      place:
        '<a href="https://www.komoot.it/tour/679154271?share_token=aGwV3PY1YzIBX39jxCJidJFXQV19c31SqIb9oZoeUjMYv7HzaO&ref=wtd" target="_blank">Santa Margherita del Gruagno</a>',
      distance: 66,
    },
    { date: "4 dicembre", number: 5, place: "Villaorba", distance: 25 },
    {
      date: "11 dicembre",
      number: 6,
      place:
        '<a href="https://www.komoot.it/tour/976474665?share_token=aaQylfUCTiJXk66VLXcXL3D6ZIlQJZi9DGchO15XcxiURbwkr4&ref=wtd" target="_blank">Udine</a>',
      distance: 56,
    },
    {
      date: "29 dicembre",
      number: 7,
      place:
        '<a href="https://www.komoot.it/tour/976475850?share_token=aQS3o32IJ59JwQYNr8cygHWWcFPup1dlJr3pGn6VK7w6msbUxp&ref=wtd" target="_blank">Pordenone</a>',
      distance: 59,
    },
    {
      date: "16 gennaio",
      number: 8,
      place:
        '<a href="https://www.komoot.it/tour/950955713?share_token=afPXj2DUo3VnTba2FW288y8mJ5whUgf39Pwx0qi42WfGFS9mCE&ref=wtd" target="_blank">San Michele al Tagliamento</a>',
      distance: 65,
    },
    {
      date: "6 febbraio",
      number: 9,
      place:
        '<a href="https://www.komoot.it/tour/976476180?share_token=aWzVVeJ5i8kt6bn1HOuNTedUukhihBTAAWFI0lZYtClEisBKYf&ref=wtd" target="_blank">Foci dello Stella</a>',
      distance: 71,
    },
    {
      date: "13 febbraio",
      number: 10,
      place:
        '<a href="https://www.komoot.it/tour/679155167?share_token=ak17jHsPG8RiyFcwx7BJ8OPEakxBrB5ytdBm8VUYC4GWVuRURp&ref=wtd" target="_blank">Lago di Cornino</a>',
      distance: 80,
    },
    {
      date: "20 febbraio",
      number: 11,
      place:
        '<a href="https://www.komoot.it/tour/679155619?share_token=aunegQ2zchKoKJmEpdqv5JHDzUBi0vTOdE6PIFqTg5PZ2ueWgk&ref=wtd" target="_blank">Ponte di Ravedis + Montereale Valcellina</a>',
      distance: 91,
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
  const mediaValue = (totalKm / totalRaces).toFixed(2);
  kmElement.dataset.km = totalKm;
  kmElement.dataset.corse = totalRaces;

  kmElement.innerHTML = `
        <div class="colore">
            <p> Totale km percorsi ${totalKm} <img src="../Icone/traguardo.png"> </p>
            <p> Media km percorsi ${mediaValue} </p>
        </div>
    `;
});