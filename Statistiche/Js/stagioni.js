// stagioni.js (Statistiche/Js/stagioni.js)
// Dipendenze: JS/utils.js

let SEASONS_CONFIG = [];
let CHART_CONFIG = {};

async function loadJSON(jsonFilePath) {
  try {
    const response = await fetch(jsonFilePath);
    if (!response.ok)
      throw new Error(`Failed to load ${jsonFilePath}: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Errore nel caricamento di ${jsonFilePath}:`, error);
    return null;
  }
}

async function initializeConfiguration(jsonFilePath) {
  const config = await loadJSON(jsonFilePath);
  if (config) {
    SEASONS_CONFIG = config.seasons;
    CHART_CONFIG = config.chart;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await initializeConfiguration("Js/anni/stagioni/seasons-config.json");
  loadAndRenderData();

  const sumData = (data) => {
    if (!Array.isArray(data)) return 0;
    return data.reduce((total, km) => total + (km.distance || 0), 0);
  };

  const countRaces = (data) => (Array.isArray(data) ? data.length : 0);

  const renderSeasonDiv = (season, data, numPeriods) => `
    <div class="${season.containerClass}">
      <a href="${season.link}">
        <img class="${season.imgClass}" src="../Icons/${season.icon}" onerror="this.src='../Icons/default.png'">
        <p class="contornostagione misuracolore">${season.name}</p>
        <p class="misuracolore">
          km totali ${formatNumber(data[season.dataKey])}
          <img src="../Icons/traguardo.png" onerror="this.style.display='none'">
        </p>
        <p class="misuracolore">${formatNumber(parseFloat(data[season.avgKey]))} %</p>
        <p class="misuracolore">Totale corse ${data[season.raceKey]}</p>
        <p class="misuracolore">📅 Periodi: ${numPeriods}</p>
        <p class="misuracolore">km medi per periodo ${formatNumber(data[season.dataKey] / numPeriods)}</p>
        <p class="misuracolore">km medi per corsa ${formatNumber(data[season.dataKey] / data[season.raceKey])}</p>
      </a>
    </div>`;

  const renderStampa = (data, numPeriodsPerSeason) => {
    return SEASONS_CONFIG.map((season) => {
      const numPeriods =
        season.name === "Primavera"
          ? numPeriodsPerSeason.primavera
          : season.name === "Estate"
            ? numPeriodsPerSeason.estate
            : numPeriodsPerSeason.autunno_inverno;
      return renderSeasonDiv(season, data, numPeriods);
    }).join("");
  };

  const createStampat = (data, numPeriodsPerSeason) => {
    const totalePeriodi =
      numPeriodsPerSeason.primavera +
      numPeriodsPerSeason.estate +
      numPeriodsPerSeason.autunno_inverno;

    return `
      <div class="colore">
        <p class="misuracolore">Totale km ${formatNumber(data.totale)} <img src="../Icons/traguardo.png" onerror="this.style.display='none'"></p>
        <p class="misuracolore">Media km per Stagione ${data.avgmediastagione} km</p>
        <p class="misuracolore">Media km per Periodo ${data.avgperiod} km</p>
        <p class="misuracolore">Totale corse ${formatItalianNumber(data.corseTotale)}</p>
        <p class="misuracolore">Media corse per periodo ${formatNumber(data.corseTotale / totalePeriodi)}</p>
        <p class="misuracolore">Media corse per stagione ${formatNumber(data.corseTotale / 3)}</p>
        <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.3);">
        <p class="misuracolore" style="text-align: center;">📊 DETTAGLIO PERIODI PER STAGIONE</p>
        <div style="display: flex; justify-content: space-between; margin-top: 10px; flex-wrap: wrap;">
          <div style="flex: 1; text-align: center; padding: 5px;">
            <p class="misuracolore">🌸 PRIMAVERA</p>
            <p class="misuracolore">${numPeriodsPerSeason.primavera} periodi</p>
          </div>
          <div style="flex: 1; text-align: center; padding: 5px;">
            <p class="misuracolore">☀️ ESTATE</p>
            <p class="misuracolore">${numPeriodsPerSeason.estate} periodi</p>
          </div>
          <div style="flex: 1; text-align: center; padding: 5px;">
            <p class="misuracolore">🍂 AUTUNNO-INVERNO</p>
            <p class="misuracolore">${numPeriodsPerSeason.autunno_inverno} periodi</p>
          </div>
        </div>
        <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.3);">
        <p class="misuracolore">📅 TOTALE PERIODI COMPLESSIVI</p>
        <p class="misuracolore">${totalePeriodi} periodi</p>
      </div>`;
  };

  function calculateData(
    primaveraData,
    estateData,
    autunnoInvernoData,
    numPeriodi,
  ) {
    const primavera = sumData(primaveraData);
    const estate = sumData(estateData);
    const autunno_inverno = sumData(autunnoInvernoData);
    const corsep = countRaces(primaveraData);
    const corsee = countRaces(estateData);
    const corseai = countRaces(autunnoInvernoData);
    const corseTotale = corsep + corsee + corseai;
    const totale = primavera + estate + autunno_inverno;
    const totalePeriodi =
      numPeriodi.primavera + numPeriodi.estate + numPeriodi.autunno_inverno;

    return {
      p: primavera,
      e: estate,
      ai: autunno_inverno,
      corsep,
      corsee,
      corseai,
      corseTotale,
      totale,
      totalePeriodi,
      avgp: totale > 0 ? (primavera / totale) * 100 : 0,
      avge: totale > 0 ? (estate / totale) * 100 : 0,
      avgai: totale > 0 ? (autunno_inverno / totale) * 100 : 0,
      avgmediastagione: formatNumber(totale / 3),
      avgperiod: totalePeriodi > 0 ? formatNumber(totale / totalePeriodi) : "0",
    };
  }

  async function loadAndRenderData() {
    const seasonsData = await loadJSON("Js/anni/stagioni/stagioni.json");
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
            const subData = await loadJSON(correctedPath);
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

    const calculatedData = calculateData(
      primaveraData.data,
      estateData.data,
      autunnoInvernoData.data,
      numPeriodi,
    );

    const labels = ["Primavera", "Estate", "Autunno-Inverno"];
    const chartData = [calculatedData.p, calculatedData.e, calculatedData.ai];

    // Grafico a linea
    const lineCanvas = document.getElementById("line-chart");
    if (lineCanvas) {
      if (window.myLineChart) window.myLineChart.destroy();
      window.myLineChart = new Chart(lineCanvas.getContext("2d"), {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "km stagioni (andamento)",
              data: chartData,
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "transparent",
              borderWidth: 3,
              pointBackgroundColor: "rgba(54, 162, 235, 1)",
              pointBorderColor: "rgba(255, 255, 255, 1)",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              tension: 0.35,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Chilometri" },
              ticks: { callback: (value) => formatItalianNumber(value) },
            },
            x: { title: { display: true } },
          },
          plugins: {
            legend: {
              position: "top",
              labels: { font: { size: 12, weight: "bold" } },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const km = formatNumber(context.raw);
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = formatItalianNumber(
                    total > 0 ? (context.raw / total) * 100 : 0,
                    true,
                  );
                  return `${context.dataset.label}: ${km} km (${pct}%)`;
                },
              },
            },
          },
        },
      });
    }

    // Grafico a ciambella
    const canvas = document.getElementById("doughnut-chart");
    if (!canvas) {
      console.error("Canvas doughnut-chart non trovato!");
      return;
    }

    if (window.myChart) window.myChart.destroy();

    document.getElementById("dati").innerHTML = renderStampa(
      calculatedData,
      numPeriodi,
    );
    document.getElementById("totale").innerHTML = createStampat(
      calculatedData,
      numPeriodi,
    );

    window.myChart = new Chart(canvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            label: "km totali stagione",
            backgroundColor: CHART_CONFIG.colors || [
              "#ff9999",
              "#66b3ff",
              "#99ff99",
            ],
            borderColor: CHART_CONFIG.borderColor || "black",
            borderWidth: CHART_CONFIG.borderWidth || 1,
            data: chartData,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "top",
            labels: { font: { size: 12, weight: "bold" } },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = formatItalianNumber((value / total) * 100, true);
                return `${context.label}: ${formatNumber(value)} km (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }
});
