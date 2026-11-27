// ============================================================
// statistiche-mensili.js — Avvio della pagina Statistiche Mensili
//
// Solo l'avvio. I pezzi stanno in History/statistiche-mensili/:
//   calcoli.js    totali, percentuali e medie
//   tabella.js    tabella dei dodici mesi
//   riepilogo.js  riquadro dei totali
//   canvas.js     crea i riquadri dei grafici se mancano
// L'ordine dei mesi arriva da History/comune/config-mesi.js
//
// Dati letti da json/Statistiche/History/Storico.json: gli anni
// vengono da "anni". La tavolozza dei 12 colori per i mesi arriva
// invece da ConfigMesi (json/Statistiche/History/config-mesi.json,
// chiave "coloriMesi"): e' la stessa mappa nome-mese -> colore usata
// dalla pagina del singolo anno (JS/Statistiche/anni.js), cosi' i
// colori dei mesi sono identici su tutte le pagine del sito.
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
    // Carica la configurazione dei mesi (ordine + colori) prima di tutto
    await ConfigMesi.carica();

    const storico = await fetchJSON("json/Statistiche/History/Storico.json");
    const allData = await Json.leggiTutti(Object.values(storico.anni));

    const coloriGlobali = ConfigMesi.elenco.map(
      (mese) => ConfigMesi.coloriMesi[mese] || "blue",
    );
    const anniUnici = allData.map((j) => String(j.year));
    const tableEl = document.getElementById("mesi");
    const axisOptions = { scales: { x: { title: { text: "Mesi" } } } };

    // Filtri: anni, mesi e km a scelta. Tutto (tabella, percentuali, medie, totali, grafici)
    // si ricalcola solo su quello che si vede.
    const ridisegna = async () => {
      const scelti = allData.filter((j) =>
        filtri.stato.anni.has(String(j.year)),
      );
      const kmMese = new Array(12).fill(0);
      const mesiCorsa = new Array(12).fill(0);
      scelti.forEach((json) => {
        ConfigMesi.elenco.forEach((mese, index) => {
          if (json.data[mese]) {
            kmMese[index] += json.data[mese];
            mesiCorsa[index] += 1;
          }
        });
      });
      const idx = ConfigMesi.elenco
        .map((_, i) => i)
        .filter((i) => filtri.stato.mesi.has(i) && filtri.passa(kmMese[i]));
      const mesi = idx.map((i) => ConfigMesi.elenco[i]);
      const chilometri = idx.map((i) => kmMese[i]);
      const mesiPercorsi = idx.map((i) => mesiCorsa[i]);
      const totale = GTM.getTotale(chilometri);
      const percentuali = chilometri.map((km) =>
        formatPercentage(totale > 0 ? (km / totale) * 100 : 0),
      );
      const kmPerMese = GTM.getkmPerMese(mesi, chilometri, mesiPercorsi);
      const completo =
        !filtri.filtrato() ||
        (filtri.stato.mesi.size === 12 &&
          !Number.isFinite(filtri.stato.min) &&
          !Number.isFinite(filtri.stato.max));
      const totaleCorse = scelti.reduce(
        (a, j) => a + (j.numberOfRaces || 0),
        0,
      );
      const media = formatNumber(mesi.length ? totale / mesi.length : 0);
      const mediaCorse = completo ? GTM.getMediaPer12(totaleCorse) : "n/d";

      const chartData = {
        labels: mesi,
        values: chilometri,
        colors: idx.map((i) => coloriGlobali[i]),
        percentuali,
      };
      await window.chartRenderer.createChart(
        "graficoTotaleMensile",
        chartData,
        axisOptions,
      );
      await window.chartRenderer.createChart(
        "graficoTotaleMensileLine",
        chartData,
        axisOptions,
      );

      tableEl.innerHTML = GTM.createTableHTML(
        kmPerMese,
        chilometri,
        percentuali,
        mesiPercorsi,
      );
      document.getElementById("totale").innerHTML = GTM.createSummaryHTML(
        totale,
        media,
        completo ? totaleCorse : null,
        mediaCorse,
      );
      const tuttiKm = allData.reduce(
        (a, j) => a + Object.values(j.data).reduce((x, y) => x + y, 0),
        0,
      );
      filtri.sintesi(
        `<strong>${scelti.length}</strong> ${scelti.length === 1 ? "anno" : "anni"} · <strong>${mesi.length}</strong> ${mesi.length === 1 ? "mese" : "mesi"} su 12 · totale <strong>${formatNumber(totale)}</strong> km · <strong>${formatNumber(tuttiKm > 0 ? (totale / tuttiKm) * 100 : 0)}%</strong> di tutti i km`,
      );
    };

    const filtri = FiltriStatistiche.crea({
      anni: anniUnici,
      mesi: ConfigMesi.elenco,
      onChange: ridisegna,
    });
    (tableEl.closest(".table-wrap") || tableEl).before(filtri.elemento);
    await ridisegna();
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
