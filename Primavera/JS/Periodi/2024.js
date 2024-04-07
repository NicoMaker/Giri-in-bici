document.addEventListener("DOMContentLoaded", function () {
  const data = [
      {
        date: "16 Marzo",
        number: 1,
        place:
          '<a href="https://www.komoot.com/it-it/tour/1471505044?ref=wtd&share_token=ao5QJ9VrSHYTASKjAJqoVSVPZhjeLoIDMoNEsD6I7akP5pEPlA" target="_blank">Madrisio + Ariis</a>',
        distance: 52,
      },
      {
        date: "17 Marzo",
        number: 2,
        place:
          '<a href="https://www.komoot.com/it-it/tour/1473310700?ref=wtd&share_token=aiAT90TAL2h06WpUHxiKdwR5g3s4Rb4NJuXf4JDi9U4mEaSvSJ" target="_blank">Clauzetto</a>',
        distance: 106,
      },
      {
        date: "23 Marzo",
        number: 3,
        place:
          '<a href="https://www.komoot.com/it-it/tour/1479919914?share_token=a8pbpPXMzDqonYM6ONM5P4wYue287gBX7uSstLAPW0nRtWi72I&ref=wtd" target="_blank">Cordovado</a>',
        distance: 62,
      },
      {
        date: "24 Marzo",
        number: 4,
        place:
          '<a href="https://www.komoot.com/it-it/tour/1481297447?share_token=a3HKZjvaD2ZQJlZZz7xo7s3DR0RTxnqi5RySu8OlGnHv4hXRF1&ref=wtd" target="_blank">Majano Susans Muris</a>',
        distance: 94,
      },
      {
        date: "30 Marzo",
        number: 5,
        place:
          '<a href="https://www.komoot.com/it-it/tour/1489013489?share_token=aIseuEPlp450T99uPGN13FH0BhCppw8C4W15m2JLFVoJXHzXXt&ref=wtd" target="_blank">Castello di Fagagna + Moruzzo</a>',
        distance: 72,
      },
      {
        date: "02 Aprile",
        number: 6,
        place:
          '<a href="https://www.komoot.com/it-it/tour/1494432977?share_token=avMQdjlcsgPsbKb642suG6Hqmk80OWff5ddY8BX2RTqWlM7ew1&ref=wtd" target="_blank">Pocenia + Palazzolo dello Stella</a>',
        distance: 81,
      },
      {
        date: "06 Aprile",
        number: 7,
        place:
        '<a href="https://www.komoot.com/it-it/tour/1499160557?share_token=aaZZ37mhpxR3CcSSwYaB5MRtD25n7Nd8abdLatKcUufY56CGgf&ref=wtd" target="_blank">Castello di Buttrio</a>',
        distance: 80
      },
      {
        date: "07 Aprile",
        number: 8,
        place: 
        '<a href="https://www.komoot.com/it-it/tour/1501477483?share_token=a6zwBLTOfHodxLdI8dGClGK7CoDCX4aWQUrrYDDnFJ75g6YlSV&ref=wtd"  target="_blank">Monte di Ragogna + Forgaria</a>',
        distance: 103
      }
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