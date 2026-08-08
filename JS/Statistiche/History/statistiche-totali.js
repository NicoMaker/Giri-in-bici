// ============================================================
// statistiche-totali.js — Avvio della pagina Statistiche Totali
//
// Solo l'avvio. I pezzi stanno in History/statistiche-totali/:
//   dati.js       lettura e ordinamento dei dati annuali
//   tabella.js    tabella mese per mese
//   riepilogo.js  riquadro dei totali
// L'ordine dei mesi arriva da History/comune/config-mesi.js
//
// Dati letti da json/Statistiche/History/Storico.json (campo
// "anni"): sostituisce il vecchio GraficoTotale.json, che
// ripeteva la stessa mappa anno->percorso già presente in
// Generale.json e StoricoMensile.json.
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

    const storico = await fetchJSON("json/Statistiche/History/Storico.json");
    if (!storico || !storico.anni) {
      console.error("Struttura anni mancante");
      return;
    }

    let yearlyData = [];
    let totaleCorse = 0;

    await Promise.all(
      Object.entries(storico.anni).map(([year, url]) =>
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

    // Larghezza del canvas in base al numero di mesi: cosi' ogni
    // etichetta ha il suo spazio in verticale, senza sovrapporsi, e il
    // riquadro scorre in orizzontale invece di comprimerle o saltarle.
    const scorriEl = document.querySelector(".grafico-tutti-mesi__scorri");
    if (scorriEl) {
      const larghezzaMinima = scorriEl.parentElement
        ? scorriEl.parentElement.clientWidth
        : 0;
      const larghezza = Math.max(mesi.length * 30, larghezzaMinima);
      scorriEl.style.setProperty("--larghezza-mesi", larghezza + "px");
    }

    await window.chartRenderer.createChart(
      "graficoTotale",
      {
        labels: mesi,
        values: chilometri,
        anni,
        percentuali,
      },
      { scales: { x: { title: { text: "Mesi" } } } },
    );

    const tableElement = document.getElementById("mesi");
    const summaryElement = document.getElementById("totale");
    if (tableElement)
      tableElement.innerHTML = GT.createTable(
        mesi,
        chilometri,
        percentuali,
        anni,
      );
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