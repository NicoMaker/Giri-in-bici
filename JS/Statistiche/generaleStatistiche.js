// ============================================================
// generaleStatistiche.js — Avvio della pagina Statistiche
//
// Solo l'avvio: prende i dati, disegna i grafici e richiama i
// componenti in Statistiche/Js/generaleStatistiche/:
//   dati.js       lettura dei JSON e calcolo delle medie
//   schede.js     schede degli anni con la paginazione
//   riepilogo.js  riquadro dei totali
//
// Dipendenze: JS/utils.js, JS/chart/chart-configs.js,
//             JS/chart/chart-renderer.js
// ============================================================

const SG = window.StatGenerali;

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error(
      "Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js",
    );
    return;
  }

  const dataResult = await SG.fetchData();
  if (dataResult && dataResult.mainData) {
    const { mainData, statistics } = dataResult;
    const { colors } = mainData;
    const {
      totalekm,
      totaleCorse,
      totalYears,
      totalMonths,
      avgkmPerRace,
      avgkmPerYear,
      avgkmPerMonth,
      avgRacesPerYear,
      avgRacesPerMonth,
      avgValues,
    } = SG.calculateAverages(statistics);

    const chartData = { statistics, colors };
    await window.chartRenderer.createChart(
      "generaleStatisticheLine",
      chartData,
    );
    await window.chartRenderer.createChart("generaleStatistiche", chartData);

    SG.renderSummary(
      totalekm,
      avgkmPerRace,
      avgkmPerYear,
      avgkmPerMonth,
      totaleCorse,
      avgRacesPerYear,
      avgRacesPerMonth,
      totalMonths,
      totalYears,
    );

    SG.renderStampa(
      statistics,
      avgValues,
      2,
      parseInt(localStorage.getItem("page_statistiche")) || 1,
    );
  } else {
    console.error("Nessun dato ricevuto");
  }
});
