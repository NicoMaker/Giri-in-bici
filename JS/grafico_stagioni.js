// ============================================================
// grafico_stagioni.js — Avvio della pagina di una stagione
//
// Qui c'e' solo l'avvio: legge il JSON della stagione, disegna i
// grafici e passa la palla ai componenti in JS/grafico_stagioni/:
//   dati.js        somma km e corse dei sottoperiodi
//   schede.js      HTML delle schede periodo
//   paginazione.js due periodi per volta, con avanti e indietro
//   riepilogo.js   riquadro con i totali della stagione
//
// Dipendenze: JS/utils.js, JS/chart/chart-configs.js,
//             JS/chart/chart-renderer.js
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error(
      "Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js",
    );
    return;
  }

  const jsonUrl = document.getElementById("json").getAttribute("link");

  try {
    const seasonData = await fetchJSON(jsonUrl);
    const { season, image, path, cssclass, colors } = seasonData;

    const subPeriodData = await fetchSubPeriods(seasonData.subPeriods);
    const labels = Object.keys(subPeriodData);
    const values = labels.map((label) => subPeriodData[label].totalDistance);
    const totale = values.reduce((acc, cur) => acc + cur, 0);
    const totalRaces = labels.reduce(
      (acc, label) => acc + subPeriodData[label].numberOfRaces,
      0,
    );
    const avgValues = labels.map((label) => {
      const pct = (subPeriodData[label].totalDistance / totale) * 100;
      return formatNumber(pct);
    });
    const totalePeriodi = labels.length;

    const chartData = { season, image, path, cssclass, colors, subPeriodData };

    await window.chartRenderer.createChart("stagioniLine", chartData);
    await window.chartRenderer.createChart("stagioni", chartData);

    renderDataList(
      labels,
      subPeriodData,
      path,
      image,
      season,
      cssclass,
      avgValues,
    );
    renderSeasonSummary(season, totale, totalePeriodi, totalRaces);
    adjustContainerLayout(cssclass);

    // "Tappe più lunghe" di TUTTI gli anni di questa stagione messi
    // insieme: ogni uscita viene etichettata con "data + periodo"
    // (es. "29 Giugno 2025"), altrimenti la sola data sarebbe
    // ambigua fra un anno e l'altro. Usa gli stessi dati già
    // scaricati sopra (subPeriodData[periodo].tappe), nessuna
    // richiesta in piu'.
    if (window.TappePiuLunghe) {
      const tutteLeTappe = labels.reduce((acc, periodo) => {
        const tappeDelPeriodo = (subPeriodData[periodo].tappe || []).map(
          (r) => {
            const info = TappePiuLunghe.analizzaLuogo(r.place);
            return {
              nome: info.nome,
              nomeTesto: info.nomeTesto,
              href: info.href,
              linkMultipli: info.linkMultipli,
              etichetta: `${r.date} ${periodo}`,
              distance: r.distance,
            };
          },
        );
        return acc.concat(tappeDelPeriodo);
      }, []);
      TappePiuLunghe.mostra("tappe-podio", "tappe-lista", tutteLeTappe, 10);
    }
  } catch (error) {
    console.error(`Error loading the JSON data: ${error}`);
  }
});
