document.addEventListener("DOMContentLoaded", function () {
  const data = [
    {
      date: "2 ottobre",
      number: 1,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1333360883?ref=wtd&share_token=aGUgIIWhXbe69V678xoW6dOA53KxwTeEsTJ7m8aPHjdzTVLnce" target="_blank">Ariis + Mortegliano</a>',
      distance: 61,
    },
    {
      date: "7 ottobre",
      number: 2,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1339854999?ref=wtd&share_token=apFmAPGBroU8MEblYvx0jOpf6dW6dyYpeYbvfa42jFhd0bb6hu" target="_blank">Colloredo di Monte Albano e Moruzzo</a>',
      distance: 76,
    },
    {
      date: "10 ottobre",
      number: 3,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1343753510?ref=wtd&share_token=a4maj6fqx1sUQTCLduc38RxWiFz9BxLhYmX95O1lJiNRNUK0tw" target="_blank">Ronchis + Ariis</a>',
      distance: 64,
    },
    {
      date: "16 ottobre",
      number: 4,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1350448650?ref=wtd&share_token=a6OAGMYN2D8OzF6Km6US78V3cAztJx0Lbp8CIBunj0a8Irvze7" target="_blank">San Daniele + Castello di Fagagna</a>',
      distance: 63,
    },
    {
      date: "23 ottobre",
      number: 5,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1356949154?ref=wtd&share_token=agAe26BhhaoFzOSNM94G8tKzyTi80Ccg2YAHDKFQoRk0vHGKb8" target="_blank">Moruzzo</a>',
      distance: 71,
    },
    {
      date: "29 ottobre",
      number: 6,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1362066710?ref=wtd&share_token=aXUyAkJ2klqUEhqO4gn3ejthJ7FC5J38NgsT4ddvUA60c2MYuY" target="_blank">Marano (corsa velocità)</a>',
      distance: 85,
    },
    {
      date: "1 novembre",
      number: 7,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1364833273?ref=wtd&share_token=a8FKzTDmHt01fJAYxG5p3LsQFddj9zEm9V3iFFzD2YSDL6B2wq" target="_blank">Tarcento</a>',
      distance: 101,
    },
    {
      date: "12 novembre",
      number: 8,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1373129923?ref=wtd&share_token=azrNoAMs88YD1EPTq9uEIAKjyRSieZv5ZwEcPxlK5ITIPMe9eU" target="_blank">Cividale (corsa velocità)</a>',
      distance: 107,
    },
    {
      date: "19 novembre",
      number: 9,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1377798163?ref=wtd&share_token=aQnC5VdWP4I5iUgtCl9yfhYBK2L3i5NcGR6mzxy3lU2cRrfl2c" target="_blank">Colloredo di Monte Albano + Buia (corsa velocità)</a>',
      distance: 91,
    },
    {
      date: "3 dicembre",
      number: 10,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1386142984?ref=wtd&share_token=a9L4J7iNMDx0B77pMlOzypJkOd9EPc0B0FueO2E59vHspgoPcn" target="_blank">Cordovado (corsa velocità)</a>',
      distance: 80,
    },
    {
      date: "8 dicembre",
      number: 11,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1388622349?ref=wtd&share_token=aqrGv614L6e3KKXxLbPFm4my7wGNa0kD8zYND5jh3SvxNmazLP" target="_blank">Pertegada (corsa velocità)</a>',
      distance: 78,
    },
    {
      date: "10 dicembre",
      number: 12,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1389749498?ref=wtd&share_token=aPf7xrVlNHSwnd37pe9chvcLBn7fkZ4CeM64fGdZ04QA3Jac1x" target="_blank">Palazzolo dello Stella</a>',
      distance: 81,
    },
    {
      date: "16 dicembre",
      number: 13,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1392863818?ref=wtd&share_token=aocjpT8CMTl2Mc7apSDMEzi7Fh6bObEVP7DoxLUEvne2QLKuFe" target="_blank">Palmanova + Mortegliano</a>',
      distance: 67,
    },
    {
      date: "17 dicembre",
      number: 14,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1393729188?ref=wtd&share_token=auHovYXvse1Jqgbs635kVUYVYzhyNfEAo92fdICyhoSQijY34W" target="_blank">Palmanova (corsa velocità)</a>',
      distance: 93,
    },
    {
      date: "24 dicembre",
      number: 15,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1397854871?ref=wtd&share_token=aQofOXFRIrEkoErTo0FFp5qre5bZtBXEwIf5qb29iCS55LgZsi" target="_blank">Marano (corsa velocità)</a>',
      distance: 95,
    },
    {
      date: "26 dicembre",
      number: 16,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1399351646?ref=wtd&share_token=ai0CtrQqqx7pb53J2SOzpOqn9rVGTzSvO1LQG2IyMi6JWbXKiC" target="_blank">Fagagna + Rodeano (corsa velocità)</a>',
      distance: 64,
    },
    {
      date: "3 gennaio",
      number: 17,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1406615108?ref=wtd&share_token=aJToUTGApumaCL6mvIGVFe2bPbIbuOCKu1KmnFCjSIaxAXy5NH" target="_blank">Ariis</a>',
      distance: 50,
    },
    {
      date: "5 gennaio",
      number: 18,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1408222275?ref=wtd&share_token=a8CLewQ7E3P4LAGLvHRzTcKGyDRVtAaY7N8fPGR5WtxGt8JbkX" target="_blank">Pinzano (corsa velocità)</a>',
      distance: 77,
    },
    {
      date: "14 gennaio",
      number: 19,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1414844353?ref=wtd&share_token=alOamwlyuDK2a8aCfIFp6v2LAdHG61oKoDbP9MV8TdSYKcF38t" target="_blank">Sequals (corsa velocità)</a>',
      distance: 95,
    },
    {
      date: "20 gennaio",
      number: 20,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1418969187?ref=wtd&share_token=azw7o7L4VUSqpwul6jiXS8oMP9HtJf7kWiZOvot1USjXkHXYvH" target="_blank">Muris (corsa velocità)</a>',
      distance: 65,
    },
    {
      date: "21 gennaio",
      number: 21,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1419704064?ref=wtd&share_token=akN8e4IeqvlWKvwuxB57kabKlU65BrzEE6OQIBb2NxtlvxdWsF" target="_blank">Gemona + Trasaghis</a>',
      distance: 104,
    },
    {
      date: "28 gennaio",
      number: 22,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1425256859?ref=wtd&share_token=alqO48JvzcTgkiWri7JtfhA00QJ6v7115oyoXGXk1v2ay2oZPZ" target="_blank">Colloredo di Monte Albano + Buia</a>',
      distance: 95,
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