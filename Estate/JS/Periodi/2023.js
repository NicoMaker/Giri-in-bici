document.addEventListener("DOMContentLoaded", function () {
  const data = [
    {
      date: "24 giugno",
      number: 1,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1181657252?ref=wtd&share_token=aAtk3jwBTH6uhKP2TcrPerhh9rh8KLLJFyqfXfGbBHLptDZ1vT" target="_blank">Bressa + Ariis (Corsa Velocità)</a>',
      distance: 62,
    },
    {
      date: "01 luglio",
      number: 2,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1192031128?ref=wtd&share_token=aAbmBoHf6FZONGuiaYDYpvErGITO1vpM6mh59FDSSkCEds93vq" target="_blank">Basiliano + Ariis</a>',
      distance: 60,
    },
    {
      date: "09 luglio",
      number: 3,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1204182945?ref=wtd&share_token=aMpT30J2nwRPNGUJiM581GXgRN52Mdmj1EeW8ot5TanIOx0tKl" target="_blank">Pordenone (Bucato)</a>',
      distance: 49,
    },
    {
      date: "15 luglio",
      number: 4,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1213878803?ref=wtd&share_token=aWgrhlQPtsmFTHAavDF3mGM7n87cVMr0rvpmEQsz3iaxP3ZBZN" target="_blank">Da Tarvisio a Bled <img src="../Icone/Slovenia.png"> e Lubiana <img src="../Icone/Slovenia.png"></a>',
      distance: 117,
    },
    {
      date: "22 luglio",
      number: 5,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1224478844?ref=wtd&share_token=aX7XpeEvVthaVBQAlC16Dw3C3OvDl8JZzqCM7rOxVZ4WWZRzwk" target="_blank">Ariis + Bertiolo</a>',
      distance: 40,
    },
    {
      date: "23 luglio",
      number: 6,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1226534244?ref=wtd&share_token=afKsl6GiI8AT6kH8SVhp7IS14woF5DAUvUEGgiAO79Tk8O4x80" target="_blank">Sacile</a>',
      distance: 100,
    },
    {
      date: "29 luglio",
      number: 7,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1234977962?ref=wtd&share_token=ajUamVcXwWJ07q5yqqwnMARQ6TXY2W60TlQtTsvWazg4000hN3" target="_blank">San Daniele</a>',
      distance: 56,
    },
    {
      date: "07 agosto",
      number: 8,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1247644819?ref=wtd&share_token=a8Oi1RFdRd024nmCndS55ZXqu65W8HRzluuqmvb45NC8rLOXET" target="_blank">Pinzano</a>',
      distance: 88,
    },
    {
      date: "08 agosto",
      number: 9,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1248947911?ref=wtd&share_token=aO7RNBcPGpk6k4WeuMKcaonQ9XcPiuwWzLSaS4zsqMAYr1UJeT" target="_blank">Ariis + Flambro</a>',
      distance: 51,
    },
    {
      date: "09 agosto",
      number: 10,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1250480955?ref=wtd" target="_blank">Castello di Fagagna</a>',
      distance: 61,
    },
    {
      date: "10 agosto",
      number: 11,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1252018934?ref=wtd" target="_blank">Latisana (Corsa Velocità)</a>',
      distance: 55,
    },
    {
      date: "11 agosto",
      number: 12,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1254069802?ref=wtd" target="_blank">Susans + Colloredo di Monte Albano + Moruzzo e Santa Margherita del Gruagno</a>',
      distance: 88,
    },
    {
      date: "14 agosto",
      number: 13,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1259485265?ref=wtd&share_token=aeIaeyrps1iLIsawLtrL1jcFu0M63roFV4csE8st6N8Zn4wHZJ" target="_blank">San Daniele solo andata</a>',
      distance: 26,
    },
    {
      date: "14 agosto",
      number: 14,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1260598564?ref=wtd&share_token=aLT0Crvk0piCPxc6wI0qZTmVddrtIgXwXHbsLY8tnnXQNPG0WN" target="_blank">Anello Codroipo Sud</a>',
      distance: 57,
    },
    {
      date: "01 settembre",
      number: 15,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1287023312?ref=wtd&share_token=asA3e0fdwbSiG2sB73TRkP1i5XzpHJxGzLOfVgdmhx7X8p5A4G" target="_blank">Ariis</a>',
      distance: 39,
    },
    {
      date: "04 settembre",
      number: 16,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1292940887?ref=wtd&share_token=ayKf4Sj4HNri8WVUFTctM2FOWO5u6VQ5uiStV6ruVU2txjm8KF" target="_blank">Ariis + Passariano</a>',
      distance: 51,
    },
    {
      date: "07 settembre",
      number: 17,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1297798381?ref=wtd&share_token=abQ6ZvRAamPFhRBjYMuPGSV2gKyTasxlhNMgUPRRhRIV2svo7A" target="_blank">Ariis + Varmo</a>',
      distance: 62,
    },
    {
      date: "11 settembre",
      number: 18,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1304042273?ref=wtd&share_token=a7FvIMzYQxEUZjYx2vltdrtR9PUoh3UobSLhDX4rCIQXB3i83F" target="_blank">San Daniele + Castello di Fagagna</a>',
      distance: 67,
    },
    {
      date: "12 settembre",
      number: 19,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1306113506?ref=wtd&share_token=avYsR71aEn48bDgY25p0Rgp4imRTf5mw84rOxR1gHGfORYmAJG" target="_blank">Varmo + Ariis</a>',
      distance: 68,
    },
    {
      date: "15 settembre",
      number: 20,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1309383040?ref=wtd&share_token=auTEHOLjFHzyPiu5NmPVcdbbUHhTs5esMuRgUehBvOn0qXgkSZ" target="_blank">Lago di Cornino + Fagagna</a>',
      distance: 94,
    },
    {
      date: "18 settembre",
      number: 21,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1314529936?ref=wtd&share_token=ag7w4nottQnddy4mtkZK6gMgzkqRq8yBXdhOUB5cSKw8kmKos1" target="_blank">Rodeano + Ariis</a>',
      distance: 80,
    },
    {
      date: "20 settembre",
      number: 22,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1316820584?ref=wtd&share_token=aAj0X1FSmmb3YZ6OBDeocWMpftim2zG2cpqgIO8Z8MUAEYYZ5Y" target="_blank">San Daniele + Castello di Fagagna e Villa Manin</a>',
      distance: 67,
    },
    {
      date: "26 settembre",
      number: 23,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1324708995?ref=wtd&share_token=alSgLRhdPlXXZXmxVnJ00e47qv88KYMTmUfMdCTCDEtf6B2CyA" target="_blank">Cisterna + Ariis</a>',
      distance: 83,
    },
    {
      date: "28 settembre",
      number: 24,
      place:
        '<a href="https://www.komoot.com/it-it/tour/1327315572?ref=wtd&share_token=aTciRzhWJQAV3wFi5Fc7uL8sT1DCoJymnM7QglWqgs9dfy8gSR" target="_blank">Pinzano + Lago di Cornino</a>',
      distance: 101,
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