document.addEventListener("DOMContentLoaded", function () {
  const data = [
      {
        date: "04 Marzo",
        number: 1,
        place:
          "Udine <br><a href='https://www.komoot.com/it-it/tour/1044183026?share_token=a53bSgJQLGftvUDUMO2J1NqMGqlTQujgD3UqI5o34bVkKydn9z&ref=wtd' target='_blank'>andata</a><br><a href='https://www.komoot.com/it-it/tour/1044183603?share_token=azFBu0wsRPUvDd8QRxLnEfq3l9TBQt4wiBmQLI2VUfzCgqKeDN&ref=wtd' target='_blank'>ritorno</a>",
        distance: 64,
      },
      {
        date: "18 Marzo",
        number: 2,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1053918331?share_token=afWKC6MiXhimmseZvC8uZhb8qrAVY78agop6lhlyGwTf9rFff1&ref=wtd' target='_blank'>Toppo</a>",
        distance: 81,
      },
      {
        date: "31 Marzo",
        number: 3,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1064630309?share_token=aXh3Fy3s0WLTl0KvMlt2UyEu2ssPjmNvURQcPvsqEMla2YeAzk&ref=wtd' target='_blank'>Flambro + Ariis</a>",
        distance: 49,
      },
      {
        date: "15 Aprile",
        number: 4,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1081493388?share_token=aMF9Vk3IxG3jUZMVeElCOZwe0Ud8fOWQNhpxS571e8MFefaYCS&ref=wtd' target='_blank'>Ariis</a>",
        distance: 39,
      },
      {
        date: "29 Aprile",
        number: 5,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1097417321?share_token=adUsk7w6QW2tuL7O0i5oOhap9MxsjvxGE3GiPO1Hlr8APluxM1&ref=wtd' target='_blank'>San Daniele + Fagagna</a>",
        distance: 64,
      },
      {
        date: "06 Maggio",
        number: 6,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1107656936?share_token=aUwNts99dlgFka2aLkif14h5Wwb8evCg4LXbQq2dpbRHGV9zdi&ref=wtd' target='_blank'>Flambro + Rivignano</a>",
        distance: 62,
      },
      {
        date: "15 Maggio",
        number: 7,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1119464138?share_token=ayHrUGg33dF84755wGPpCEaC5IMN1daDT5yFWR23nP6XXBHndl&ref=wtd'>Belgrado (corsa velocità, causa bucato)</a>",
        distance: 11,
      },
      {
        date: "23 Maggio",
        number: 8,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1131651918?share_token=aBkg88x0FiinvOLt8wSwM4rAAvgBkD2M0XGOBeKYBmWKJ6k1pf&ref=wtd'>San Michele al Tagliamento</a>",
        distance: 63,
      },
      {
        date: "27 Maggio",
        number: 9,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1136974274?share_token=aLyKmBzQeI5DmO12YbzYFqzRBEQugq65I0b8Y83qky0ljyS2Ls&ref=wtd' target='_blank'>Fagagna</a>",
        distance: 53,
      },
      {
        date: "30 Maggio",
        number: 10,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1143249589?share_token=aUUw1vJYklQWWSNnqi21Lpd7k26ZZeslouPqk4Mo3SrqBUl1fl&ref=wtd' target='_blank'>Basiliano + Ariis (Corsa velocità)</a>",
        distance: 53,
      },
      {
        date: "90 Giugno",
        number: 11,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1159971551?share_token=aQTtrnM0Mz8POtUs7DBqDRtdIPRdhnhdQ5XC83OJ1zI2peGF9U&ref=wtd' target='_blank'>Bertiolo + Ariis</a>",
        distance: 39,
      },
      {
        date: "10 Giugno",
        number: 12,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1161641851?share_token=ajUtsPyRrb8xWKAesExoAtFVq69uWL177hNTWB6xN7jzNB5XK6&ref=wtd' target='_blank'>Basiliano + Bertiolo</a>",
        distance: 33,
      },
      {
        date: "18 Giugno",
        number: 13,
        place:
          "<a href='https://www.komoot.com/it-it/tour/1174674763?share_token=ae1L5hzOgDJWTwn2duBuGCAzcpY4VIs1du9WMpFUZlf0KCpxsK&ref=wtd' target='_blank'>Da Tarvisio a Codroipo</a>",
        distance: 131,
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