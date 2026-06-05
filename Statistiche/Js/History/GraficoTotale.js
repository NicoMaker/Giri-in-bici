// GraficoTotale.js
// Dipendenze: JS/utils.js, JS/chart/chart-configs.js, JS/chart/chart-renderer.js

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error("Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js");
    return;
  }

  const orderMesi = {
    Gennaio: 1, Febbraio: 2, Marzo: 3, Aprile: 4,
    Maggio: 5, Giugno: 6, Luglio: 7, Agosto: 8,
    Settembre: 9, Ottobre: 10, Novembre: 11, Dicembre: 12,
  };

  async function fetchYearData(url, year) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || typeof data !== "object") throw new Error("Dati non validi");
      if (!data.year && year) data.year = year;
      return data;
    } catch (error) {
      console.error(`Errore nel caricamento dei dati da ${url}: ${error}`);
      return null;
    }
  }

  function calculateTotals(yearlyData) {
    const combinedData = [];
    yearlyData.forEach((item) => {
      if (!item || !item.data) return;
      const year = item.year || "Sconosciuto";
      for (const mese in item.data) {
        if (item.data.hasOwnProperty(mese)) {
          combinedData.push({ mese, chilometri: item.data[mese], year });
        }
      }
    });

    combinedData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return (orderMesi[a.mese] || 0) - (orderMesi[b.mese] || 0);
    });

    const totale = combinedData.reduce((acc, item) => acc + item.chilometri, 0);
    const chilometri = [], mesi = [], anni = [], percentuali = [];

    combinedData.forEach(({ chilometri: km, mese, year }) => {
      chilometri.push(km);
      mesi.push(mese);
      anni.push(year);
      percentuali.push(formatPercentage(totale > 0 ? (km / totale) * 100 : 0));
    });

    return { totale, chilometri, mesi, anni, percentuali };
  }

  function createTable(mesi, chilometri, percentuali, anni) {
    return `
      <tr class="grassetto">
        <th>Mese</th>
        <th>km <img src="../../Icons/traguardo.png"></th>
        <th>Percentuale sul totale</th>
        <th>Anno</th>
      </tr>
      ${mesi.map((mese, index) => `
        <tr>
          <td>${mese || "N/D"}</td>
          <td>${formatNumber(chilometri[index] || 0)}</td>
          <td>${percentuali[index] || "0,00"} %</td>
          <td>${anni[index] || "N/D"}</td>
        </tr>`).join("")}
    `;
  }

  function createSummary(totale, kmMediPerCorsa, kmMediPerMese, totaleCorse,
    racesPerYear, racesPerMonth, mesi) {
    return `
      <a href="Statistiche_Mensili.html">
        <div class="colore">
          <p class="misuracolore">Totale km ${formatNumber(totale)} <img src="../../Icons/traguardo.png"></p>
          <p class="misuracolore">Km medi per corsa ${kmMediPerCorsa}</p>
          <p class="misuracolore">Km medi per mese ${kmMediPerMese}</p>
          <p class="misuracolore">Totale corse ${formatItalianNumber(totaleCorse)}</p>
          <p class="misuracolore">Corse medie per anno ${racesPerYear}</p>
          <p class="misuracolore">Corse medie per mese ${racesPerMonth}</p>
          <p class="misuracolore">Totale mesi di corsa ${mesi.length}</p>
        </div>
      </a>`;
  }

  try {
    const data = await fetchJSON("../Js/History/JSON/GraficoTotale.json");
    if (!data || !data.statistics) { console.error("Struttura statistics mancante"); return; }

    let yearlyData = [];
    let totaleCorse = 0;

    await Promise.all(
      Object.entries(data.statistics).map(([year, url]) =>
        fetchYearData(url, year).then((yearData) => {
          if (yearData) {
            yearlyData.push(yearData);
            totaleCorse += yearData.numberOfRaces || 0;
          }
        }),
      ),
    );

    if (yearlyData.length === 0) { console.error("Nessun dato annuale caricato"); return; }

    const totaleAnni = yearlyData.length;
    const { totale, chilometri, mesi, anni, percentuali } = calculateTotals(yearlyData);

    const kmMediPerCorsa = formatNumber(totaleCorse > 0 ? totale / totaleCorse : 0);
    const kmMediPerMese = formatNumber(mesi.length > 0 ? totale / mesi.length : 0);
    const racesPerYear = formatNumber(totaleAnni > 0 ? totaleCorse / totaleAnni : 0);
    const racesPerMonth = formatNumber(mesi.length > 0 ? totaleCorse / mesi.length : 0);

    await window.chartRenderer.createChart("graficoTotale", {
      labels: mesi, values: chilometri, anni, percentuali,
    });

    const tableElement = document.getElementById("mesi");
    const summaryElement = document.getElementById("totale");
    if (tableElement) tableElement.innerHTML = createTable(mesi, chilometri, percentuali, anni);
    if (summaryElement) summaryElement.innerHTML = createSummary(
      totale, kmMediPerCorsa, kmMediPerMese, totaleCorse, racesPerYear, racesPerMonth, mesi,
    );
  } catch (error) {
    console.error(`Errore durante il fetch: ${error}`);
  }
});
