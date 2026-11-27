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

    const {
      chilometri: kmTutti,
      mesi: mesiTutti,
      anni: anniTutti,
    } = GT.calculateTotals(yearlyData);
    const corsePerAnno = {};
    yearlyData.forEach(
      (y) => (corsePerAnno[String(y.year)] = y.numberOfRaces || 0),
    );
    const anniUnici = [...new Set(anniTutti.map(String))];
    const mesiUnici = ConfigMesi.elenco.filter((m) => mesiTutti.includes(m));

    const tableElement = document.getElementById("mesi");
    const summaryElement = document.getElementById("totale");
    const scorriEl = document.querySelector(".grafico-tutti-mesi__scorri");

    // Filtri: anni, mesi e km a scelta. Tabella, percentuali, totali e grafico
    // si ricalcolano solo sulle righe che si vedono.
    const ridisegna = async () => {
      const righe = mesiTutti
        .map((_, i) => i)
        .filter(
          (i) =>
            filtri.stato.anni.has(String(anniTutti[i])) &&
            filtri.stato.mesi.has(mesiUnici.indexOf(mesiTutti[i])) &&
            filtri.passa(kmTutti[i]),
        );
      const chilometri = righe.map((i) => kmTutti[i]);
      const mesi = righe.map((i) => mesiTutti[i]);
      const anni = righe.map((i) => anniTutti[i]);
      const totale = chilometri.reduce((a, b) => a + b, 0);
      const percentuali = chilometri.map((km) =>
        formatPercentage(totale > 0 ? (km / totale) * 100 : 0),
      );
      const anniScelti = [...new Set(anni.map(String))];
      // le corse si conoscono solo per anno intero: con mesi o km filtrati non si possono dividere
      const completo =
        filtri.stato.mesi.size === mesiUnici.length &&
        !Number.isFinite(filtri.stato.min) &&
        !Number.isFinite(filtri.stato.max);
      const corse = [...filtri.stato.anni].reduce(
        (a, y) => a + (corsePerAnno[y] || 0),
        0,
      );
      const corseNote = completo ? corse : null;
      const mediaCorsa =
        completo && corse > 0 ? formatNumber(totale / corse) : "n/d";
      const mediaMese = formatNumber(mesi.length ? totale / mesi.length : 0);
      const corseAnno =
        completo && filtri.stato.anni.size
          ? formatNumber(corse / filtri.stato.anni.size)
          : null;
      const corseMese =
        completo && mesi.length ? formatNumber(corse / mesi.length) : null;

      if (scorriEl) {
        const larghezzaMinima = scorriEl.parentElement
          ? scorriEl.parentElement.clientWidth
          : 0;
        scorriEl.style.setProperty(
          "--larghezza-mesi",
          Math.max(mesi.length * 30, larghezzaMinima) + "px",
        );
      }
      await window.chartRenderer.createChart(
        "graficoTotale",
        { labels: mesi, values: chilometri, anni, percentuali },
        { scales: { x: { title: { text: "Mesi" } } } },
      );
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
          mediaCorsa,
          mediaMese,
          corseNote,
          corseAnno,
          corseMese,
          mesi,
        );
      const tuttiKm = kmTutti.reduce((a, b) => a + b, 0);
      filtri.sintesi(
        `<strong>${anniScelti.length}</strong> ${anniScelti.length === 1 ? "anno" : "anni"} · <strong>${mesi.length}</strong> ${mesi.length === 1 ? "mese" : "mesi"} · totale <strong>${formatNumber(totale)}</strong> km · <strong>${formatNumber(tuttiKm > 0 ? (totale / tuttiKm) * 100 : 0)}%</strong> di tutti i km`,
      );
    };

    const filtri = FiltriStatistiche.crea({
      anni: anniUnici,
      mesi: mesiUnici,
      onChange: ridisegna,
    });
    (tableElement.closest(".table-wrap") || tableElement).before(
      filtri.elemento,
    );
    await ridisegna();
  } catch (error) {
    console.error(`Errore durante il fetch: ${error}`);
  }
});
