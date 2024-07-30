document.addEventListener("DOMContentLoaded", async () => {
  const jsonUrl = document.getElementById("json").getAttribute("link");

  try {
    const response = await fetch(jsonUrl),
      jsonData = await response.json(),
      year = jsonData.year,
      corse = jsonData.numberOfRaces,
      data = jsonData.data,
      colors = jsonData.colors,
      mesi = Object.keys(data),
      chilometri = Object.values(data),
      totale = chilometri.reduce((acc, curr) => acc + curr, 0),
      percentuali = chilometri.map((km) => ((km / totale) * 100).toFixed(2)),
      kmMediPerCorsa = (totale / corse).toFixed(2),
      kmMediPerMese = (totale / mesi.length).toFixed(2),
      chartData = {
        labels: mesi,
        datasets: [
          {
            label: `km mensili ${year}`,
            backgroundColor: colors,
            borderColor: "black",
            borderWidth: 1,
            data: chilometri,
          },
        ],
      },
      chartConfig = {
        type: "bar",
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      },
      ctx = document.getElementById("bar-chart").getContext("2d");
    new Chart(ctx, chartConfig);

    const tabellaDati = `
            <tr class="grassetto">
                <th>Mese</th>
                <th>km <img src="../../Icons/traguardo.png" alt="traguardo"></th>
                <th>Percentuale sull'anno</th>
            </tr>
            ${mesi
              .map(
                (mese, index) => `
                    <tr>
                        <td>${mese}</td>
                        <td>${chilometri[index]}</td>
                        <td>${percentuali[index]} %</td>
                    </tr>`
              )
              .join("")}
        `,
      stampat = `
            <div class="colore">
                <p>totale km ${totale} <img src="../../Icons/traguardo.png" alt="traguardo"></p>
                <p>km medi percorsi ${kmMediPerCorsa}</p>
                <p>km medi per mese ${kmMediPerMese}</p>
            </div>`;

    document.getElementById("mesi").innerHTML = tabellaDati;
    document.getElementById("totale").innerHTML = stampat;
  } catch (error) {
    console.error("Error fetching or processing the JSON data:", error);
  }
});
