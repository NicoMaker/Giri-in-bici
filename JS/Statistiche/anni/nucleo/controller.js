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

    const mesiTutti = Object.keys(data);
    const kmTutti = Object.values(data);
    const axisOptions = { scales: { x: { title: { text: "Mesi" } } } };
    const tabella = document.getElementById("mesi");

    // Filtri: mesi a scelta e intervallo di km. Tabella, percentuali, totali e grafici
    // si ricalcolano solo sui mesi che si vedono.
    const ridisegna = async () => {
      const idx = mesiTutti
        .map((_, i) => i)
        .filter((i) => filtri.stato.mesi.has(i) && filtri.passa(kmTutti[i]));
      const mesi = idx.map((i) => mesiTutti[i]);
      const chilometri = idx.map((i) => kmTutti[i]);
      const colors = mesi.map((mese) => coloriMesi[mese] || "blue");
      const totale = chilometri.reduce((acc, curr) => acc + curr, 0);
      const completo = !filtri.filtrato();

      const percentuali =
        totale > 0
          ? calculatePercentuali(chilometri, totale)
          : chilometri.map(() => "0");
      const kmMediPerCorsa = completo
        ? formatNumber(calculatekmMedi(totale, corse))
        : "n/d";
      const kmMediPerMese = formatNumber(
        mesi.length ? calculatekmMedi(totale, mesi.length) : 0,
      );
      const dati = Object.fromEntries(mesi.map((m, i) => [m, chilometri[i]]));
      const chartData = { year, data: dati, colors };

      await window.chartRenderer.createChart(
        "anniLine",
        chartData,
        axisOptions,
      );
      await window.chartRenderer.createChart("anni", chartData, axisOptions);
      renderDataTable(mesi, chilometri, percentuali);
      renderSummary(
        totale,
        kmMediPerCorsa,
        kmMediPerMese,
        completo ? corse : null,
      );
      const tuttiKm = kmTutti.reduce((a, b) => a + b, 0);
      filtri.sintesi(
        `<strong>${mesi.length}</strong> ${mesi.length === 1 ? "mese" : "mesi"} su ${mesiTutti.length} · totale <strong>${formatNumber(totale)}</strong> km · <strong>${formatNumber(tuttiKm > 0 ? (totale / tuttiKm) * 100 : 0)}%</strong> dei km dell'anno`,
      );
    };

    const filtri = FiltriStatistiche.crea({
      mesi: mesiTutti,
      onChange: ridisegna,
    });
    (tabella.closest(".table-wrap") || tabella).before(filtri.elemento);
    await ridisegna();
  } catch (error) {
    console.error(`Errore nel caricamento o elaborazione del JSON: ${error}`);
  }
});
