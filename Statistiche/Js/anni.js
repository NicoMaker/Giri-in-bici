// anni.js
// Dipendenze: JS/utils.js (caricato prima in HTML)

const calculatekmMedi = (totale, divider, isPercentage = false) => {
  const result = totale / divider;
  return isPercentage ? result * 100 : result;
};

const calculatePercentuali = (chilometri, totale) =>
  chilometri.map((km) => formatNumber(calculatekmMedi(km, totale, true)));

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error(
      "Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js",
    );
    return;
  }

  const jsonUrl = document.getElementById("json").getAttribute("link");

  try {
    const response = await fetch(jsonUrl);
    const jsonData = await response.json();

    const { year, numberOfRaces: corse, data, colors } = jsonData;

    const mesi = Object.keys(data);
    const chilometri = Object.values(data);
    const totale = chilometri.reduce((acc, curr) => acc + curr, 0);

    const percentuali = calculatePercentuali(chilometri, totale);
    const kmMediPerCorsa = formatNumber(calculatekmMedi(totale, corse));
    const kmMediPerMese = formatNumber(calculatekmMedi(totale, mesi.length));

    const chartData = { year, data, colors };

    await window.chartRenderer.createChart("anniLine", chartData);
    await window.chartRenderer.createChart("anni", chartData);

    renderDataTable(mesi, chilometri, percentuali);
    renderSummary(totale, kmMediPerCorsa, kmMediPerMese, corse);
  } catch (error) {
    console.error(`Errore nel caricamento o elaborazione del JSON: ${error}`);
  }
});

function renderDataTable(mesi, chilometri, percentuali) {
  document.getElementById("mesi").innerHTML = `
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
        <td>${formatItalianNumber(chilometri[index])}</td>
        <td>${percentuali[index]} %</td>
      </tr>`,
      )
      .join("")}
  `;
}

function renderSummary(totale, kmMediPerCorsa, kmMediPerMese, totaleCorse) {
  const mesiCount =
    document.getElementById("mesi")?.querySelectorAll("tr").length - 1 || 0;

  let mediaCorsePerMese = "N/A";
  if (mesiCount > 0 && totaleCorse > 0) {
    mediaCorsePerMese = formatNumber(totaleCorse / mesiCount);
  }

  document.getElementById("totale").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km ${formatItalianNumber(totale)} <img src="../../Icons/traguardo.png" alt="traguardo"></p>
      <p class="misuracolore">km medi per corsa ${kmMediPerCorsa}</p>
      <p class="misuracolore">km medi per mese ${kmMediPerMese}</p>
      <p class="misuracolore">Totale corse ${formatItalianNumber(totaleCorse)}</p>
      <p class="misuracolore">Medie corse per mese ${mediaCorsePerMese}</p>
    </div>
  `;
}
