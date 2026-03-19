// Funzione di utilità per la formattazione condizionale
const formatNumberConditionally = (value) => {
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(2);
};

document.addEventListener("DOMContentLoaded", () => {
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

  // ✅ CONFIGURAZIONE STAGIONI - FACILE DA MODIFICARE
  const SEASONS_CONFIG = [
    {
      containerClass: "primavera",
      link: "../Primavera.html",
      imgClass: "immaginestagionestat",
      icon: "primavera.png",
      name: "Primavera",
      dataKey: "p",
      raceKey: "corsep",
      avgKey: "avgp",
    },
    {
      containerClass: "estate",
      link: "../Estate.html",
      imgClass: "immaginestagionestatsx",
      icon: "estate.png",
      name: "Estate",
      dataKey: "e",
      raceKey: "corsee",
      avgKey: "avge",
    },
    {
      containerClass: "autunno_inverno",
      link: "../Autunno_Inverno.html",
      imgClass: "immaginestagionestat",
      icon: "inverno.png",
      name: "Autunno - Inverno",
      dataKey: "ai",
      raceKey: "corseai",
      avgKey: "avgai",
    },
  ];

  // ✅ RENDERIZZA UNA SINGOLA STAGIONE
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

  // ✅ RENDERIZZA TUTTE LE STAGIONI DINAMICAMENTE
  const renderStampa = (data) => {
    return SEASONS_CONFIG.map((season) => renderSeasonDiv(season, data)).join("");
  };

  const createStampat = (data) => `
    <div class="colore">
      <p class="misuracolore">Totale km ${formatNumberConditionally(data.totale)} <img src="../Icons/traguardo.png"></p>
      <p class="misuracolore">Media km per Stagione ${data.avgmediastagione} km</p>
      <p class="misuracolore">Media km per Periodo ${data.avgperiod} km</p>
      <p class="misuracolore">Totale corse ${data.corseTotale}</p>
    </div>`;

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

    let avgperiodFormatted;
    if (totalePeriodi > 0) {
      avgperiodFormatted = formatNumberConditionally(totale / totalePeriodi);
    } else {
      avgperiodFormatted = "N/A";
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
      avgp: (primavera / totale) * 100,
      avge: (estate / totale) * 100,
      avgai: (autunno_inverno / totale) * 100,
      avgmediastagione: avgmediastagioneFormatted,
      avgperiod: avgperiodFormatted,
    };
  }

  async function loadAndRenderData() {
    const seasonsData = await fetchJSON("Js/anni/stagioni.json");

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
      document.getElementById("totale").innerHTML = createStampat(calculatedData);

      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              label: "km totali stagione",
              backgroundColor: ["lightgreen", "red", "lightblue"],
              borderColor: ["black"],
              borderWidth: 1,
              data: chartData,
            },
          ],
        },
      });
    } else {
      console.error("Errore durante il caricamento dei dati");
    }
  }

  loadAndRenderData();
});