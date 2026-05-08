// Funzione di utilità per la formattazione condizionale
const formatNumberConditionally = (value) => {
  // Always show 2 decimal places for tables
  return formatItalianNumber(value, true);
};

// Funzione per formattazione italiana con separatori di migliaia
const formatItalianNumber = (num, forceDecimals = false) => {
  if (typeof num === 'string') {
    num = parseFloat(num);
  }
  if (isNaN(num)) return '0';
  
  // For tables, always show 2 decimal places
  let decimalString = '';
  if (forceDecimals || !Number.isInteger(num)) {
    const decimalPart = num.toFixed(2).split('.')[1];
    // Only add decimal part if it's not "00"
    if (decimalPart !== '00') {
      decimalString = ',' + decimalPart;
    }
  }
  
  // Handle decimal part - use comma for Italian format
  const parts = num.toString().split('.');
  let integerPart = parts[0];
  
  // Add thousand separators (periods)
  if (integerPart.length > 3) {
    const groups = [];
    let i = integerPart.length;
    while (i > 0) {
      const start = Math.max(0, i - 3);
      groups.unshift(integerPart.substring(start, i));
      i -= 3;
    }
    integerPart = groups.join('.');
  }
  
  return integerPart + decimalString;
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
  // RENDERING DINAMICO - CON PERIODI PER SINGOLA STAGIONE
  // ============================================

  const renderSeasonDiv = (season, data, numPeriods) => `
    <div class="${season.containerClass}">
      <a href="${season.link}">
        <img class="${season.imgClass}" src="../Icons/${season.icon}" onerror="this.src='../Icons/default.png'">
        <p class="contornostagione misuracolore">${season.name}</p>
        <p class="misuracolore">
          km totali ${formatNumberConditionally(data[season.dataKey])} 
          <img src="../Icons/traguardo.png" onerror="this.style.display='none'">
        </p>
        <p class="misuracolore">${formatNumberConditionally(parseFloat(data[season.avgKey]))} %</p>
        <p class="misuracolore">Totale corse ${data[season.raceKey]}</p>
        <p class="misuracolore">📅 Periodi: ${numPeriods}</p>
      </a>
    </div>`;

  const renderStampa = (data, numPeriodsPerSeason) => {
    return SEASONS_CONFIG.map((season) => {
      let numPeriods = 0;
      if (season.name === "Primavera") numPeriods = numPeriodsPerSeason.primavera;
      else if (season.name === "Estate") numPeriods = numPeriodsPerSeason.estate;
      else if (season.name === "Autunno - Inverno") numPeriods = numPeriodsPerSeason.autunno_inverno;

      return renderSeasonDiv(season, data, numPeriods);
    }).join("");
  };

  const createStampat = (data, numPeriodsPerSeason) => {
    const totalePeriodi = numPeriodsPerSeason.primavera +
      numPeriodsPerSeason.estate +
      numPeriodsPerSeason.autunno_inverno;

    const formattedCorseTotale = formatItalianNumber(data.corseTotale);

    return `
      <div class="colore">
        <p class="misuracolore">Totale km ${formatNumberConditionally(data.totale)} <img src="../Icons/traguardo.png" onerror="this.style.display='none'"></p>
        <p class="misuracolore">Media km per Stagione ${data.avgmediastagione} km</p>
        <p class="misuracolore">Media km per Periodo ${data.avgperiod} km</p>
        <p class="misuracolore">Totale corse ${formattedCorseTotale}</p>
        <p class="misuracolore">Media corse per periodo: ${formatNumberConditionally(data.corseTotale / totalePeriodi)}</p>
        <p class="misuracolore">Media corse per stagione: ${formatNumberConditionally(data.corseTotale / 3)}</p>
        
        <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.3);">
        
        <p class="misuracolore"text-align: center;">📊 DETTAGLIO PERIODI PER STAGIONE</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 10px; flex-wrap: wrap;">
          <div style="flex: 1; text-align: center; padding: 5px;">
            <p class="misuracolore"">🌸 PRIMAVERA</p>
            <p class="misuracolore"">${numPeriodsPerSeason.primavera} periodi</p>
          </div>
          <div style="flex: 1; text-align: center; padding: 5px;">
            <p class="misuracolore"">☀️ ESTATE</p>
            <p class="misuracolore"">${numPeriodsPerSeason.estate} periodi</p>
          </div>
          <div style="flex: 1; text-align: center; padding: 5px;">
            <p class="misuracolore">🍂 AUTUNNO-INVERNO</p>
            <p class="misuracolore"">${numPeriodsPerSeason.autunno_inverno} periodi</p>
          </div>
        </div>
        
        <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.3);">
        
        <p class="misuracolore"">📅 TOTALE PERIODI COMPLESSIVI</p>
        <p class="misuracolore">${totalePeriodi} periodi</p>
      </div>`;
  };

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
    const totalePeriodi = numPeriodi.primavera + numPeriodi.estate + numPeriodi.autunno_inverno;

    const avgmediastagioneFormatted = formatNumberConditionally(totale / 3);

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
      totalePeriodi,
      avgp: totale > 0 ? (primavera / totale) * 100 : 0,
      avge: totale > 0 ? (estate / totale) * 100 : 0,
      avgai: totale > 0 ? (autunno_inverno / totale) * 100 : 0,
      avgmediastagione: avgmediastagioneFormatted,
      avgperiod: avgperiodFormatted,
    };
  }

  // ============================================
  // CARICAMENTO E RENDERING
  // ============================================

  async function loadAndRenderData() {
    console.log("🔄 Caricamento dati stagioni...");

    const seasonsData = await fetchJSON("Js/anni/stagioni/stagioni.json");

    if (!seasonsData || !Array.isArray(seasonsData.seasons)) {
      console.error("❌ Invalid seasons data", seasonsData);
      document.getElementById("dati").innerHTML = '<p class="errore">Errore nel caricamento dei dati delle stagioni</p>';
      return;
    }

    console.log(`✅ seasonsData caricato: ${seasonsData.seasons.length} stagioni trovate`);

    const numPeriodi = {
      primavera: 0,
      estate: 0,
      autunno_inverno: 0,
    };

    // Mappa per associare i nomi del JSON ai nomi della configurazione
    const seasonNameMap = {
      "Primavera": "primavera",
      "Estate": "estate",
      "Autunno_Inverno": "autunno_inverno"
    };

    const seasonDataPromises = seasonsData.seasons.map(async (season) => {
      console.log(`📋 Processando stagione: "${season.name}"`);

      // Usa la mappa per ottenere la chiave corretta
      const seasonKey = seasonNameMap[season.name] || season.name.toLowerCase().replace("-", "_");
      const periodCount = Object.keys(season.subPeriods).length;
      numPeriodi[seasonKey] = periodCount;
      console.log(`📅 ${season.name}: ${periodCount} periodi (chiave: ${seasonKey})`);

      const subPeriodsData = await Promise.all(
        Object.entries(season.subPeriods).map(async ([periodName, subFile]) => {
          console.log(`📂 Caricamento ${season.name} - ${periodName}: ${subFile}`);
          const correctedPath = subFile.startsWith("../") ? subFile : `../${subFile}`;
          const subData = await fetchJSON(correctedPath);
          if (subData && Array.isArray(subData)) {
            console.log(`✅ ${season.name} - ${periodName}: ${subData.length} corse`);
          } else {
            console.warn(`⚠️ Nessun dato per ${season.name} - ${periodName}`);
          }
          return subData ? subData : [];
        }),
      );

      const flatData = subPeriodsData.flat();
      console.log(`📊 ${season.name}: totale ${flatData.length} corse`);

      return {
        name: season.name,
        data: flatData,
      };
    });

    const resolvedSeasons = await Promise.all(seasonDataPromises);

    console.log("📋 Stagioni risolte:", resolvedSeasons.map(s => s.name));

    // Trova le stagioni usando i nomi esatti dal file JSON
    const primaveraData = resolvedSeasons.find((s) => s.name === "Primavera");
    const estateData = resolvedSeasons.find((s) => s.name === "Estate");
    const autunnoInvernoData = resolvedSeasons.find((s) => s.name === "Autunno_Inverno");

    console.log("🔍 Ricerca stagioni:", {
      primavera: primaveraData ? "✅ Trovata" : "❌ Non trovata",
      estate: estateData ? "✅ Trovata" : "❌ Non trovata",
      autunnoInverno: autunnoInvernoData ? "✅ Trovata" : "❌ Non trovata"
    });

    if (primaveraData && estateData && autunnoInvernoData) {
      console.log("✅ Tutte le stagioni trovate, calcolo dati...");

      const calculatedData = calculateData(
        primaveraData.data,
        estateData.data,
        autunnoInvernoData.data,
        numPeriodi,
      );

      console.log("📊 Dati calcolati:", {
        totale: calculatedData.totale,
        corseTotale: calculatedData.corseTotale,
        periodi: calculatedData.totalePeriodi,
        primavera_km: calculatedData.p,
        estate_km: calculatedData.e,
        autunno_km: calculatedData.ai
      });

      const labels = ["Primavera", "Estate", "Autunno-Inverno"];
      const chartData = [calculatedData.p, calculatedData.e, calculatedData.ai];
      const canvas = document.getElementById("doughnut-chart");

      if (!canvas) {
        console.error("❌ Canvas doughnut-chart non trovato!");
        return;
      }

      const ctx = canvas.getContext("2d");

      if (window.myChart) {
        window.myChart.destroy();
      }

      const datiElement = document.getElementById("dati");
      const totaleElement = document.getElementById("totale");

      if (datiElement) {
        datiElement.innerHTML = renderStampa(calculatedData, numPeriodi);
        console.log("✅ Render stampa completato");
      }

      if (totaleElement) {
        totaleElement.innerHTML = createStampat(calculatedData, numPeriodi);
        console.log("✅ Render totale completato");
      }

      window.myChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              label: "km totali stagione",
              backgroundColor: CHART_CONFIG.colors || ["#ff9999", "#66b3ff", "#99ff99"],
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
              position: 'top',
              labels: {
                font: { size: 12, weight: 'bold' }
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentageRaw = (value / total) * 100;
                  const percentage = formatItalianNumber(percentageRaw, true, true);
                  return `${label}: ${formatNumberConditionally(value)} km (${percentage}%)`;
                }
              }
            }
          }
        },
      });

      console.log("✅ Grafico creato con successo");
    } else {
      console.error("❌ Stagioni non trovate:", {
        primavera: !!primaveraData,
        estate: !!estateData,
        autunnoInverno: !!autunnoInvernoData
      });
      document.getElementById("dati").innerHTML = '<p class="errore">Stagioni non trovate nei dati</p>';
    }
  }
});