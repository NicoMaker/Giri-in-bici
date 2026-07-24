// ============================================================
// stagioni.js — Avvio della pagina "Confronto tra le stagioni"
//
// Questo file mette insieme i pezzi e basta. La logica sta nei
// componenti dentro Statistiche/Js/stagioni/:
//   dati.js     legge i JSON e fa i conti
//   schede.js   costruisce l'HTML delle schede
//   grafici.js  disegna i due grafici
//
// Vanno caricati prima di questo file (vedi stagioni.html).
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  const S = window.Stagioni;

  await S.initializeConfiguration("Js/anni/stagioni/seasons-config.json");

  const seasonsData = await S.loadJSON("Js/anni/stagioni/stagioni.json");
  if (!seasonsData || !Array.isArray(seasonsData.seasons)) {
    document.getElementById("dati").innerHTML =
      '<p class="errore">Errore nel caricamento dei dati delle stagioni</p>';
    return;
  }

  const numPeriodi = { primavera: 0, estate: 0, autunno_inverno: 0 };
  const seasonNameMap = {
    Primavera: "primavera",
    Estate: "estate",
    Autunno_Inverno: "autunno_inverno",
  };

  const resolvedSeasons = await Promise.all(
    seasonsData.seasons.map(async (season) => {
      const seasonKey =
        seasonNameMap[season.name] ||
        season.name.toLowerCase().replace("-", "_");
      numPeriodi[seasonKey] = Object.keys(season.subPeriods).length;

      const subPeriodsData = await Promise.all(
        Object.entries(season.subPeriods).map(async ([, subFile]) => {
          const correctedPath = subFile.startsWith("../")
            ? subFile
            : `../${subFile}`;
          const subData = await S.loadJSON(correctedPath);
          return subData && Array.isArray(subData) ? subData : [];
        }),
      );

      return { name: season.name, data: subPeriodsData.flat() };
    }),
  );

  const primaveraData = resolvedSeasons.find((s) => s.name === "Primavera");
  const estateData = resolvedSeasons.find((s) => s.name === "Estate");
  const autunnoInvernoData = resolvedSeasons.find(
    (s) => s.name === "Autunno_Inverno",
  );

  if (!primaveraData || !estateData || !autunnoInvernoData) {
    document.getElementById("dati").innerHTML =
      '<p class="errore">Stagioni non trovate nei dati</p>';
    return;
  }

  const calculatedData = S.calculateData(
    primaveraData.data,
    estateData.data,
    autunnoInvernoData.data,
    numPeriodi,
  );

  const labels = ["Primavera", "Estate", "Autunno-Inverno"];
  const chartData = [calculatedData.p, calculatedData.e, calculatedData.ai];

  S.disegnaGraficoLinea(labels, chartData);

  const canvas = document.getElementById("doughnut-chart");
  if (!canvas) {
    console.error("Canvas doughnut-chart non trovato!");
    return;
  }

  if (window.myChart) window.myChart.destroy();

  document.getElementById("dati").innerHTML = S.renderStampa(
    calculatedData,
    numPeriodi,
  );
  document.getElementById("totale").innerHTML = S.createStampat(
    calculatedData,
    numPeriodi,
  );

  S.disegnaGraficoCiambella(canvas, labels, chartData);
});
