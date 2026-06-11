// GraficoTotaleMensile.js
// Dipendenze: JS/utils.js, JS/chart/chart-configs.js, JS/chart/chart-renderer.js

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error(
      "Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js",
    );
    return;
  }

  let mesiOrdinati = [];

  // Carica la configurazione dei mesi
  async function loadMonthConfig() {
    try {
      const response = await fetch("../Js/History/JSON/config-mesi.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const config = await response.json();
      // Estrae i mesi ordinati dalle chiavi del config
      mesiOrdinati = Object.keys(config.orderMesi);
    } catch (error) {
      console.error(
        "Errore nel caricamento di config-mesi.json, uso fallback:",
        error,
      );
      // Fallback hardcoded
      mesiOrdinati = [
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
    }
  }

  const getTotale = (chilometri) =>
    chilometri.reduce((acc, curr) => acc + curr, 0);
  const getPercentuali = (chilometri, totale) =>
    chilometri.map((km) => formatPercentage((km / totale) * 100));
  const getMediaPer12 = (totale) => formatNumber(totale / 12);

  const getkmPerMese = (mesi, chilometri, mesiPercorsi) =>
    mesi.map((mese, index) => ({
      mese,
      kmMediMese:
        mesiPercorsi[index] > 0
          ? formatItalianNumber(chilometri[index] / mesiPercorsi[index], true)
          : "0,00",
    }));

  const getTotaleCorse = (allData) =>
    allData.reduce((total, json) => total + (json.numberOfRaces || 0), 0);

  const createTableHTML = (
    kmPerMese,
    chilometri,
    percentuali,
    mesiPercorsi,
  ) => `
    <tr class="grassetto">
      <th>Mese</th>
      <th>km <img src="../../Icons/traguardo.png"></th>
      <th>Percentuale sul totale</th>
      <th>Mesi di Corsa</th>
      <th>km <img src="../../Icons/traguardo.png"> medi mensili</th>
     </tr>
    ${kmPerMese
      .map(
        ({ mese, kmMediMese }, index) => `
      <tr>
        <td>${mese}</td>
        <td>${formatItalianNumber(chilometri[index])}</td>
        <td>${percentuali[index]} %</td>
        <td>${mesiPercorsi[index]}</td>
        <td>${kmMediMese}</td>
      </tr>`,
      )
      .join("")}
  `;

  const createSummaryHTML = (
    totale,
    mediaComplessiva,
    totaleCorse,
    mediacorse,
  ) => `
    <a href="StoricoMensile.html">
      <div class="colore">
        <p class="misuracolore">totale km ${formatItalianNumber(totale)} <img src="../../Icons/traguardo.png"></p>
        <p class="misuracolore">km totali medi per mese ${mediaComplessiva}</p>
        <p class="misuracolore">Totale corse ${formatItalianNumber(totaleCorse)}</p>
        <p class="misuracolore">Medie corse per mese (12 mesi) ${mediacorse}</p>
      </div>
    </a>`;

  try {
    // Carica la configurazione dei mesi prima di tutto
    await loadMonthConfig();

    const statistics = await fetchJSON("../Js/History/JSON/GraficoTotale.json");
    const allData = await Promise.all(
      Object.values(statistics.statistics).map((filePath) =>
        fetch(filePath).then((r) => r.json()),
      ),
    );

    let chilometriTotali = new Array(12).fill(0);
    let mesiPercorsi = new Array(12).fill(0);
    const coloriGlobali = statistics.colors;

    allData.forEach((json) => {
      mesiOrdinati.forEach((mese, index) => {
        if (json.data[mese]) {
          chilometriTotali[index] += json.data[mese];
          mesiPercorsi[index] += 1;
        }
      });
    });

    const totaleChilometri = getTotale(chilometriTotali);
    const percentuali = getPercentuali(chilometriTotali, totaleChilometri);
    const kmPerMese = getkmPerMese(
      mesiOrdinati,
      chilometriTotali,
      mesiPercorsi,
    );
    const mediaComplessiva = getMediaPer12(totaleChilometri);
    const totaleCorse = getTotaleCorse(allData);
    const mediacorse = getMediaPer12(totaleCorse);

    const chartData = {
      labels: mesiOrdinati,
      values: chilometriTotali,
      colors: coloriGlobali,
      percentuali,
    };

    await window.chartRenderer.createChart("graficoTotaleMensile", chartData);
    await window.chartRenderer.createChart(
      "graficoTotaleMensileLine",
      chartData,
    );

    document.getElementById("mesi").innerHTML = createTableHTML(
      kmPerMese,
      chilometriTotali,
      percentuali,
      mesiPercorsi,
    );
    document.getElementById("totale").innerHTML = createSummaryHTML(
      totaleChilometri,
      mediaComplessiva,
      totaleCorse,
      mediacorse,
    );
  } catch (error) {
    console.error(`Errore nel caricamento: ${error}`);
  }
});

// Aggiungi i canvas per i grafici se non esistono già
if (document.getElementById("grafici")) {
  document.getElementById("grafici").innerHTML = `
    <br />
    <canvas id="line-chart"></canvas>
    <br /><br />
    <canvas id="bar-chart"></canvas>
    <br />
  `;
}
