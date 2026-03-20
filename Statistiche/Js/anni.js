// Funzione di utilità per la formattazione condizionale
const formatNumberConditionally = (value) => {
  // Se il valore è un intero (es. 10.0), lo mostra senza decimali
  if (Number.isInteger(value)) {
    return value.toString();
  }
  // Altrimenti, lo formatta con due decimali (es. 10.33)
  return value.toFixed(2);
};


// Funzione per calcolare il valore medio (grezzo, non formattato)
const calculatekmMedi = (totale, divider, isPercentage = false) => {
  const result = totale / divider;
  return isPercentage ? result * 100 : result;
};


// Funzione per calcolare le percentuali con formattazione condizionale
const calculatePercentuali = (chilometri, totale) =>
  chilometri.map((km) => {
    const rawPercentage = calculatekmMedi(km, totale, true);
    return formatNumberConditionally(rawPercentage);
  });


// Funzione principale (eseguita dopo il caricamento del DOM)
document.addEventListener("DOMContentLoaded", async () => {
  const jsonUrl = document.getElementById("json").getAttribute("link");

  try {
    const response = await fetch(jsonUrl);
    const jsonData = await response.json();

    const { year, numberOfRaces: corse, data, colors } = jsonData;

    const mesi = Object.keys(data);
    const chilometri = Object.values(data);
    const totale = chilometri.reduce((acc, curr) => acc + curr, 0);

    // Calcolo percentuali con la funzione aggiornata
    const percentuali = calculatePercentuali(chilometri, totale);

    // Calcoli grezzi
    const rawKmMediPerCorsa = calculatekmMedi(totale, corse);
    const rawKmMediPerMese = calculatekmMedi(totale, mesi.length);

    // Applicazione formattazione condizionale
    const kmMediPerCorsa = formatNumberConditionally(rawKmMediPerCorsa);
    const kmMediPerMese = formatNumberConditionally(rawKmMediPerMese);

    // Render delle sezioni
    renderChart(mesi, chilometri, colors, year);
    renderDataTable(mesi, chilometri, percentuali);
    renderSummary(totale, kmMediPerCorsa, kmMediPerMese, corse);
  } catch (error) {
    console.error(`Errore nel caricamento o elaborazione del JSON: ${error}`);
  }
});


// --- FUNZIONI DI RENDER ---


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
  };

  const chartConfig = {
    type: "bar",
    data: chartData,
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const ctx = document.getElementById("bar-chart").getContext("2d");
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


function renderSummary(totale, kmMediPerCorsa, kmMediPerMese, totaleCorse) {
  // 🛡️ controllo input
  const mesiCount = document.getElementById("mesi")?.querySelectorAll("tr").length - 1 || 0;
  const validoMesi = mesiCount > 0;
  const validoCorse = totaleCorse != null && totaleCorse > 0;

  let mediaCorsePerMese = "N/A";
  if (validoMesi && validoCorse) {
    const rawMedia = totaleCorse / mesiCount;
    mediaCorsePerMese = formatNumberConditionally(rawMedia);
  }

  const stampat = `
        <div class="colore">
            <p class="misuracolore">Totale km ${totale} <img src="../../Icons/traguardo.png" alt="traguardo"></p>
            <p class="misuracolore">km medi per corsa ${kmMediPerCorsa}</p>
            <p class="misuracolore">km medi per mese ${kmMediPerMese}</p>
            <p class="misuracolore">Totale corse ${totaleCorse}</p>
            <p class="misuracolore">Medie corse per mese ${mediaCorsePerMese}</p>
        </div>
    `;
  document.getElementById("totale").innerHTML = stampat;
}

