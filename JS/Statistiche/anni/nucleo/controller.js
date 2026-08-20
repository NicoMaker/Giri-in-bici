// ============================================================
// anni.js — Avvio della pagina di un singolo anno
//
// Solo l'avvio. I pezzi stanno in Statistiche/Js/anni_pagina/:
//   calcoli.js    medie e percentuali
//   tabella.js    tabella dei mesi
//   riepilogo.js  riquadro dei totali
//
// Il colore di ogni barra viene dalla mappa nome-mese -> colore
// stagione in json/Statistiche/History/config-mesi.json
// (coloriMesi), non piu' dal campo "colors" del json dell'anno:
// quel campo era un elenco a posizione fissa di 12 colori, ma un
// anno senza tutti i 12 mesi (es. 2020, che parte da Maggio) lo
// sfasava e i colori non corrispondevano piu' al mese giusto.
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
    const [jsonData, configMesi] = await Promise.all([
      Json.leggi(jsonUrl),
      Json.leggi("json/Statistiche/History/config-mesi.json"),
    ]);

    const { year, numberOfRaces: corse, data } = jsonData;
    const coloriMesi = configMesi.coloriMesi || {};

    const mesi = Object.keys(data);
    const chilometri = Object.values(data);
    const colors = mesi.map((mese) => coloriMesi[mese] || "blue");
    const totale = chilometri.reduce((acc, curr) => acc + curr, 0);

    const percentuali = calculatePercentuali(chilometri, totale);
    const kmMediPerCorsa = formatNumber(calculatekmMedi(totale, corse));
    const kmMediPerMese = formatNumber(calculatekmMedi(totale, mesi.length));

    const chartData = { year, data, colors };

    const axisOptions = { scales: { x: { title: { text: "Mesi" } } } };
    await window.chartRenderer.createChart("anniLine", chartData, axisOptions);
    await window.chartRenderer.createChart("anni", chartData, axisOptions);

    renderDataTable(mesi, chilometri, percentuali);
    renderSummary(totale, kmMediPerCorsa, kmMediPerMese, corse);
  } catch (error) {
    console.error(`Errore nel caricamento o elaborazione del JSON: ${error}`);
  }
});
