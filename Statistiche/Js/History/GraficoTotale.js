// ============================================================
// GraficoTotale.js — Avvio della pagina Statistiche Totali
//
// Solo l'avvio. I pezzi stanno in History/GraficoTotale/:
//   dati.js       lettura e ordinamento dei dati annuali
//   tabella.js    tabella mese per mese
//   riepilogo.js  riquadro dei totali
// L'ordine dei mesi arriva da History/comune/config-mesi.js
//
// Dipendenze: JS/utils.js, JS/chart/chart-configs.js,
//             JS/chart/chart-renderer.js
// ============================================================

const GT = window.GraficoTotale;

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error(
      "Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js",
    );
    return;
  }

  try {
    // Carica la configurazione dei mesi prima di tutto
    await ConfigMesi.carica();

    const data = await fetchJSON("../Js/History/JSON/GraficoTotale.json");
    if (!data || !data.statistics) {
      console.error("Struttura statistics mancante");
      return;
    }

    let yearlyData = [];
    let totaleCorse = 0;

    await Promise.all(
      Object.entries(data.statistics).map(([year, url]) =>
        GT.fetchYearData(url, year).then((yearData) => {
          if (yearData) {
            yearlyData.push(yearData);
            totaleCorse += yearData.numberOfRaces || 0;
          }
        }),
      ),
    );

    if (yearlyData.length === 0) {
      console.error("Nessun dato annuale caricato");
      return;
    }

    const totaleAnni = yearlyData.length;
    const { totale, chilometri, mesi, anni, percentuali } =
      GT.calculateTotals(yearlyData);

    const kmMediPerCorsa = formatNumber(
      totaleCorse > 0 ? totale / totaleCorse : 0,
    );
    const kmMediPerMese = formatNumber(
      mesi.length > 0 ? totale / mesi.length : 0,
    );
    const racesPerYear = formatNumber(
      totaleAnni > 0 ? totaleCorse / totaleAnni : 0,
    );
    const racesPerMonth = formatNumber(
      mesi.length > 0 ? totaleCorse / mesi.length : 0,
    );

    await window.chartRenderer.createChart("graficoTotale", {
      labels: mesi,
      values: chilometri,
      anni,
      percentuali,
    });

    const tableElement = document.getElementById("mesi");
    const summaryElement = document.getElementById("totale");
    if (tableElement)
      tableElement.innerHTML = GT.createTable(mesi, chilometri, percentuali, anni);
    if (summaryElement)
      summaryElement.innerHTML = GT.createSummary(
        totale,
        kmMediPerCorsa,
        kmMediPerMese,
        totaleCorse,
        racesPerYear,
        racesPerMonth,
        mesi,
      );
  } catch (error) {
    console.error(`Errore durante il fetch: ${error}`);
  }
});
