// ============================================================
// GraficoTotaleMensile.js — Avvio della pagina Statistiche Mensili
//
// Solo l'avvio. I pezzi stanno in History/GraficoTotaleMensile/:
//   calcoli.js    totali, percentuali e medie
//   tabella.js    tabella dei dodici mesi
//   riepilogo.js  riquadro dei totali
//   canvas.js     crea i riquadri dei grafici se mancano
// L'ordine dei mesi arriva da History/comune/config-mesi.js
//
// Dipendenze: JS/utils.js, JS/chart/chart-configs.js,
//             JS/chart/chart-renderer.js
// ============================================================

const GTM = window.GraficoTotaleMensile;

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

    const statistics = await fetchJSON(
      "json/Statistiche/History/GraficoTotale.json",
    );
    const allData = await Json.leggiTutti(Object.values(statistics.statistics));

    let chilometriTotali = new Array(12).fill(0);
    let mesiPercorsi = new Array(12).fill(0);
    const coloriGlobali = statistics.colors;

    allData.forEach((json) => {
      ConfigMesi.elenco.forEach((mese, index) => {
        if (json.data[mese]) {
          chilometriTotali[index] += json.data[mese];
          mesiPercorsi[index] += 1;
        }
      });
    });

    const totaleChilometri = GTM.getTotale(chilometriTotali);
    const percentuali = GTM.getPercentuali(chilometriTotali, totaleChilometri);
    const kmPerMese = GTM.getkmPerMese(
      ConfigMesi.elenco,
      chilometriTotali,
      mesiPercorsi,
    );
    const mediaComplessiva = GTM.getMediaPer12(totaleChilometri);
    const totaleCorse = GTM.getTotaleCorse(allData);
    const mediacorse = GTM.getMediaPer12(totaleCorse);

    const chartData = {
      labels: ConfigMesi.elenco,
      values: chilometriTotali,
      colors: coloriGlobali,
      percentuali,
    };

    await window.chartRenderer.createChart("graficoTotaleMensile", chartData);
    await window.chartRenderer.createChart(
      "graficoTotaleMensileLine",
      chartData,
    );

    document.getElementById("mesi").innerHTML = GTM.createTableHTML(
      kmPerMese,
      chilometriTotali,
      percentuali,
      mesiPercorsi,
    );
    document.getElementById("totale").innerHTML = GTM.createSummaryHTML(
      totaleChilometri,
      mediaComplessiva,
      totaleCorse,
      mediacorse,
    );
  } catch (error) {
    console.error(`Errore nel caricamento: ${error}`);
    const box = document.getElementById("grafici");
    if (box)
      box.innerHTML =
        '<p class="errore-grafico">Non è stato possibile caricare i dati dei grafici: ' +
        error.message +
        "</p>";
  }
});
