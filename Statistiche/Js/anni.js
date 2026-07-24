// ============================================================
// anni.js — Avvio della pagina di un singolo anno
//
// Solo l'avvio. I pezzi stanno in Statistiche/Js/anni_pagina/:
//   calcoli.js    medie e percentuali
//   tabella.js    tabella dei mesi
//   riepilogo.js  riquadro dei totali
//
// Dipendenze: JS/utils.js, JS/chart/chart-configs.js,
//             JS/chart/chart-renderer.js
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error(
      "Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js",
    );
    return;
  }

  const jsonUrl = document.getElementById("json").getAttribute("link");

  try {
    const jsonData = await Json.leggi(jsonUrl);

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
