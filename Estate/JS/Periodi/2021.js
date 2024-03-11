document.addEventListener("DOMContentLoaded", function () {
  const data = [
    {
      date: "29 giugno",
      number: 1,
      place:
        '<a href="https://www.komoot.it/tour/679147952?share_token=apWZS9ysQeBdrWl4k2PyGWo9EAp6TlPvKs3ZNM8aKDKBq71IH0&ref=wtd" target="_blank">Rosazzo</a>',
      distance: 93,
    },
    {
      date: "05 luglio",
      number: 2,
      place:
        '<a href="https://www.komoot.it/tour/679148731?share_token=aD5YcgNors82SQBTRg0EJbGC63VgvWCEBKSHnRQ9smeGkT77f8&ref=wtd" target="_blank">Gorizia</a>',
      distance: 121,
    },
    {
      date: "08 luglio",
      number: 3,
      place:
        '<a href="https://www.komoot.it/tour/679149061?share_token=a9ErvFtwa2Lfpq4YXVpjEfCJUT2J8m6CLA1x4B13h5LENy32vd&ref=wtd" target="_blank">Maniago + Ravedis (Val Cellina)</a>',
      distance: 97,
    },
    {
      date: "21 luglio",
      number: 4,
      place:
        '<a href="https://www.komoot.it/tour/679162497?share_token=aJY7OhR0qEIMeV0T7elxnLqDdPmHCKtOiRvhf8Gf52cZjyZsYt&ref=wtd" target="_blank">Tarcento + Nimis</a>',
      distance: 103,
    },
    {
      date: "28 luglio",
      number: 5,
      place: "Bertiolo + San Vidotto",
      distance: 43,
    },
    {
      date: "31 luglio",
      number: 6,
      place: "Ariis",
      distance: 37,
    },
    {
      date: "27 agosto",
      number: 7,
      place:
        '<a href="https://www.komoot.it/tour/679149577?share_token=asRKxA34GnrSVBdM7I1v90NAM9gHjZUScAnTy7E6ryC2Fl4yIG&ref=wtd" target="_blank">Trieste + Miramare e Sistiana</a>',
      distance: 174,
    },
    {
      date: "18 settembre",
      number: 8,
      place:
        '<a href="https://www.komoot.it/tour/679163619?share_token=a25sQzejucdUMxMQGArF8ysL5ZsmlEvONArq9KOjcPCql3Aoyv&ref=wtd" target="_blank">Pinzano</a>',
      distance: 75,
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