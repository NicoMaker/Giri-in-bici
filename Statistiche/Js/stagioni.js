// Funzione di utilità per la formattazione condizionale
const formatNumberConditionally = (value) => {
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(2);
};

// ============================================
// VARIABILE GLOBALE PER LA CONFIGURAZIONE
// ============================================
let SEASONS_CONFIG = [];
let CHART_CONFIG = {};

// ============================================
// FUNZIONE GENERICA PER LEGGERE JSON
// ============================================
async function loadJSON(jsonFilePath) {
  try {
    const response = await fetch(jsonFilePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${jsonFilePath}: ${response.status}`);
    }
    const config = await response.json();
    return config;
  } catch (error) {
    console.error(`❌ Errore nel caricamento di ${jsonFilePath}:`, error);
    return null;
  }
}

// ============================================
// INIZIALIZZA CONFIGURAZIONE DAL JSON
// ============================================
async function initializeConfiguration(jsonFilePath) {
  const config = await loadJSON(jsonFilePath);

  if (config) {
    SEASONS_CONFIG = config.seasons;
    CHART_CONFIG = config.chart;
    console.log(`✅ Configurazione caricata da ${jsonFilePath}`);
  } else {
    console.log("⚠️ Usata configurazione di fallback");
    loadDefaultConfiguration();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // ✅ CARICA LA CONFIGURAZIONE DAL FILE JSON
  await initializeConfiguration("Js/anni/stagioni/seasons-config.json");

  // ✅ POI ESEGUI LA FUNZIONE PRINCIPALE
  loadAndRenderData();

  // ============================================
  // FUNZIONI UTILITÀ
  // ============================================

  async function fetchJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return null;
    }
  }

  const sumData = (data) => {
    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      return 0;
    }
    return data.reduce((total, km) => total + (km.distance || 0), 0);
  };

  const countRaces = (data) => {
    if (!Array.isArray(data)) {
      return 0;
    }
    return data.length;
  };

  // ============================================
  // RENDERING DINAMICO
  // ============================================

  const renderSeasonDiv = (season, data) => `
    <div class="${season.containerClass}">
      <a href="${season.link}">
        <img class="${season.imgClass}" src="../Icons/${season.icon}">
        <p class="contornostagione misuracolore">${season.name}</p>
        <p class="misuracolore">
          km totali ${formatNumberConditionally(data[season.dataKey])} 
          <img src="../Icons/traguardo.png">
        </p>
        <p class="misuracolore">${formatNumberConditionally(parseFloat(data[season.avgKey]))} %</p>
        <p class="misuracolore">Totale corse ${data[season.raceKey]}</p>
      </a>
    </div>`;

  const renderStampa = (data) => {
    return SEASONS_CONFIG.map((season) => renderSeasonDiv(season, data)).join(
      "",
    );
  };

  const createStampat = (data) => `
    <div class="colore">
      <p class="misuracolore">Totale km ${formatNumberConditionally(data.totale)} <img src="../Icons/traguardo.png"></p>
      <p class="misuracolore">Media km per Stagione ${data.avgmediastagione} km</p>
      <p class="misuracolore">Media km per Periodo ${data.avgperiod} km</p>
      <p class="misuracolore">Totale corse ${data.corseTotale}</p>
      <p class="misuracolore">Media corse per periodo: ${formatNumberConditionally(data.corseTotale / data.totalePeriodi)}</p>
      <p class="misuracolore">Medie corse per stagione: ${formatNumberConditionally(data.corseTotale / 3)}</p>
    </div>`;

  // ============================================
  // CALCOLI DATI
  // ============================================

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

    const avgmediastagioneFormatted = formatNumberConditionally(totale / 3);

    // ✅ CORREZIONE: Calcola la media km per periodo
    let avgperiodFormatted;
    if (totalePeriodi > 0) {
      avgperiodFormatted = formatNumberConditionally(totale / totalePeriodi);
    } else {
      avgperiodFormatted = "0";
    }

    return {
      p: primavera,
      e: estate,
      ai: autunno_inverno,
      corsep,
      corsee,
      corseai,
      corseTotale,
      totale,
      totalePeriodi, // ✅ AGGIUNGI questo per debug
      avgp: (primavera / totale) * 100,
      avge: (estate / totale) * 100,
      avgai: (autunno_inverno / totale) * 100,
      avgmediastagione: avgmediastagioneFormatted,
      avgperiod: avgperiodFormatted,
    };
  }

  // ============================================
  // CARICAMENTO E RENDERING
  // ============================================

  async function loadAndRenderData() {
    const seasonsData = await fetchJSON("Js/anni/stagioni/stagioni.json");

    if (!seasonsData || !Array.isArray(seasonsData.seasons)) {
      console.error("Invalid seasons data");
      return;
    }

    const numPeriodi = {
      primavera: 0,
      estate: 0,
      autunno_inverno: 0,
    };

    const seasonDataPromises = seasonsData.seasons.map(async (season) => {
      const periodCount = Object.keys(season.subPeriods).length;
      numPeriodi[season.name.toLowerCase().replace("-", "_")] = periodCount;

      const subPeriodsData = await Promise.all(
        Object.entries(season.subPeriods).map(async ([, subFile]) => {
          const correctedPath = subFile.startsWith("../")
            ? subFile
            : `../${subFile}`;
          const subData = await fetchJSON(correctedPath);
          return subData ? subData : [];
        }),
      );

      return {
        name: season.name,
        data: subPeriodsData.flat(),
      };
    });

    const resolvedSeasons = await Promise.all(seasonDataPromises);

    // 🔍 Trova le stagioni per nome, indipendentemente dall'ordine
    const primaveraPromise = resolvedSeasons.find((s) =>
      s.name.toLowerCase().includes("primavera"),
    );
    const estatePromise = resolvedSeasons.find((s) =>
      s.name.toLowerCase().includes("estate"),
    );
    const autunnoInvernoPromise = resolvedSeasons.find((s) =>
      s.name.toLowerCase().includes("inverno"),
    );

    if (primaveraPromise && estatePromise && autunnoInvernoPromise) {
      const calculatedData = calculateData(
        primaveraPromise.data,
        estatePromise.data,
        autunnoInvernoPromise.data,
        numPeriodi,
      );

      const labels = ["Primavera", "Estate", "Autunno-Inverno"];
      const chartData = [calculatedData.p, calculatedData.e, calculatedData.ai];
      const ctx = document.getElementById("doughnut-chart").getContext("2d");

      document.getElementById("dati").innerHTML = renderStampa(calculatedData);
      document.getElementById("totale").innerHTML =
        createStampat(calculatedData);

      // ✅ USA LA CONFIGURAZIONE DEL CHART DAL JSON
      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              label: "km totali stagione",
              backgroundColor: CHART_CONFIG.colors,
              borderColor: CHART_CONFIG.borderColor,
              borderWidth: CHART_CONFIG.borderWidth,
              data: chartData,
            },
          ],
        },
      });
    } else {
      console.error("Errore durante il caricamento dei dati");
    }
  }
});
