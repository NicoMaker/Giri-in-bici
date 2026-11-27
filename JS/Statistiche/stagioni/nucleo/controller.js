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

  await S.initializeConfiguration(
    "json/Statistiche/anni/stagioni/seasons-config.json",
  );

  const seasonsData = await S.loadJSON(
    "json/Statistiche/anni/stagioni/stagioni.json",
  );
  if (!seasonsData || !Array.isArray(seasonsData.seasons)) {
    document.getElementById("dati").innerHTML =
      '<p class="errore">Errore nel caricamento dei dati delle stagioni</p>';
    return;
  }

  const numPeriodiTutti = { primavera: 0, estate: 0, autunno_inverno: 0 };
  const seasonNameMap = {
    Primavera: "primavera",
    Estate: "estate",
    Autunno_Inverno: "autunno_inverno",
  };
  const NOMI_MESI = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
  const meseDi = (data) => {
    const m = String(data || "")
      .trim()
      .split(/\s+/)
      .pop()
      .toLowerCase();
    return NOMI_MESI.findIndex((x) => x.toLowerCase() === m);
  };

  // Ogni giro conserva stagione, periodo (anno) e mese: servono ai filtri.
  const giri = [];
  const resolvedSeasons = await Promise.all(
    seasonsData.seasons.map(async (season) => {
      const seasonKey =
        seasonNameMap[season.name] ||
        season.name.toLowerCase().replace("-", "_");
      numPeriodiTutti[seasonKey] = Object.keys(season.subPeriods).length;

      const subPeriodsData = await Promise.all(
        Object.entries(season.subPeriods).map(async ([periodo, subFile]) => {
          const correctedPath = subFile.startsWith("../")
            ? subFile
            : `../${subFile}`;
          const subData = await S.loadJSON(correctedPath);
          const lista = subData && Array.isArray(subData) ? subData : [];
          lista.forEach((g) =>
            giri.push({
              stagione: season.name,
              chiave: seasonKey,
              periodo,
              mese: meseDi(g.date),
              km: g.distance || 0,
              giro: g,
            }),
          );
          return lista;
        }),
      );
      return { name: season.name, data: subPeriodsData.flat() };
    }),
  );

  if (
    !["Primavera", "Estate", "Autunno_Inverno"].every((n) =>
      resolvedSeasons.some((s) => s.name === n),
    )
  ) {
    document.getElementById("dati").innerHTML =
      '<p class="errore">Stagioni non trovate nei dati</p>';
    return;
  }

  const labels = ["Primavera", "Estate", "Autunno-Inverno"];
  const canvas = document.getElementById("doughnut-chart");
  if (!canvas) {
    console.error("Canvas doughnut-chart non trovato!");
    return;
  }
  document.getElementById("legenda-stagioni").innerHTML = S.renderLegenda();

  const periodiUnici = [...new Set(giri.map((g) => g.periodo))].sort();
  const mesiUsati = NOMI_MESI.filter((_, i) => giri.some((g) => g.mese === i));
  const nomiStagioni = ["Primavera", "Estate", "Autunno_Inverno"];
  const etichettaStagione = (n) =>
    n === "Autunno_Inverno" ? "Autunno-Inverno" : n;

  // Filtri: stagioni, periodi, mesi e km per giro. Schede, percentuali, totali e grafici
  // si ricalcolano solo sui giri che si vedono.
  const ridisegna = () => {
    const st = filtri.stato;
    const visibili = giri.filter(
      (g) =>
        st.stagioni.has(etichettaStagione(g.stagione)) &&
        st.anni.has(g.periodo) &&
        st.mesi.has(mesiUsati.indexOf(NOMI_MESI[g.mese])) &&
        filtri.passa(g.km),
    );
    const per = (nome) =>
      visibili.filter((g) => g.stagione === nome).map((g) => g.giro);
    const numPeriodi = filtri.filtrato()
      ? {
          primavera: new Set(
            visibili
              .filter((g) => g.chiave === "primavera")
              .map((g) => g.periodo),
          ).size,
          estate: new Set(
            visibili.filter((g) => g.chiave === "estate").map((g) => g.periodo),
          ).size,
          autunno_inverno: new Set(
            visibili
              .filter((g) => g.chiave === "autunno_inverno")
              .map((g) => g.periodo),
          ).size,
        }
      : numPeriodiTutti;

    const calculatedData = S.calculateData(
      per("Primavera"),
      per("Estate"),
      per("Autunno_Inverno"),
      numPeriodi,
    );
    const chartData = [calculatedData.p, calculatedData.e, calculatedData.ai];

    S.disegnaGraficoLinea(labels, chartData);
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

    const tuttiKm = giri.reduce((a, g) => a + g.km, 0);
    filtri.sintesi(
      `<strong>${visibili.length}</strong> ${visibili.length === 1 ? "giro" : "giri"} su ${giri.length} · totale <strong>${formatNumber(calculatedData.totale)}</strong> km · <strong>${formatNumber(tuttiKm > 0 ? (calculatedData.totale / tuttiKm) * 100 : 0)}%</strong> di tutti i km`,
    );
  };

  const filtri = FiltriStatistiche.crea({
    stagioni: nomiStagioni.map(etichettaStagione),
    anni: periodiUnici,
    titoloAnni: "Periodi",
    mesi: mesiUsati,
    titoloKm: "Distanza per giro",
    onChange: ridisegna,
  });
  document.getElementById("dati").before(filtri.elemento);
  ridisegna();
});
