// Funzione di utilità per la formattazione condizionale
const formatNumberConditionally = (value) => {
    // Se il valore è un intero (es. 10.0), lo mostra senza decimali
    if (Number.isInteger(value)) {
        return value.toString();
    }
    // Altrimenti, lo formatta con due decimali (es. 10.33)
    return value.toFixed(2);
};

// Modifica di calculatekmMedi per calcolare il valore grezzo (non formattato)
const calculatekmMedi = (totale, divider) => totale / divider;

(document.addEventListener("DOMContentLoaded", async () => {
    const jsonUrl = document.getElementById("json").getAttribute("link");

    try {
        const response = await fetch(jsonUrl),
            jsonData = await response.json(),
            { year, numberOfRaces: corse, data, colors } = jsonData,
            mesi = Object.keys(data),
            chilometri = Object.values(data),
            totale = chilometri.reduce((acc, curr) => acc + curr, 0),
            percentuali = calculatePercentuali(chilometri, totale);

        // Calcolo dei valori medi grezzi
        const rawKmMediPerCorsa = calculatekmMedi(totale, corse);
        const rawKmMediPerMese = calculatekmMedi(totale, mesi.length);

        // Applicazione della formattazione
        const kmMediPerCorsa = formatNumberConditionally(rawKmMediPerCorsa);
        const kmMediPerMese = formatNumberConditionally(rawKmMediPerMese);

        renderChart(mesi, chilometri, colors, year);
        renderDataTable(mesi, chilometri, percentuali);
        renderSummary(totale, kmMediPerCorsa, kmMediPerMese); // Passa i valori formattati
    } catch (error) {
        console.error(`Error fetching or processing the JSON data:, ${error}`);
    }
}),
    (calculatePercentuali = (chilometri, totale) =>
        chilometri.map((km) => ((km / totale) * 100).toFixed(2))));


function renderChart(mesi, chilometri, colors, year) {
    const chartData = {
        labels: mesi,
        datasets: [
            {
                label: `km mensili`,
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
}

function renderDataTable(mesi, chilometri, percentuali) {
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
        </tr>`,
            )
            .join("")}
  `;
    document.getElementById("mesi").innerHTML = tabellaDati;
}

function renderSummary(totale, kmMediPerCorsa, kmMediPerMese) {
    const stampat = `
    <div class="colore">
      <p>totale km ${totale} <img src="../../Icons/traguardo.png" alt="traguardo"></p>
      <p>km medi percorsi ${kmMediPerCorsa}</p>
      <p>km medi per mese ${kmMediPerMese}</p>
    </div>
  `;
    document.getElementById("totale").innerHTML = stampat;
}