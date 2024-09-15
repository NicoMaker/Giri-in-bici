document.addEventListener("DOMContentLoaded", () => {
  async function fetchDataForSeason(seasonFile) {
    try {
      const response = await fetch(seasonFile);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching data for ${seasonFile}:`, error);
      return null;
    }
  }

  const sumData = (data) =>
      Object.values(data).reduce((total, km) => total + km, 0),
    renderStampa = (data) => `
      <div class="estate">
          <a href="../Estate.html">
              <img class="immaginestagionestat" src="../Icons/estate.png">
              <p class="contornostagione misuracolore">Estate</p>
              <p class="misuracolore">km totali ${data.e} <img src="../Icons/traguardo.png"></p>
              <p class="misuracolore">${data.avge} %</p>
          </a>
      </div>
      <div class="primavera">
          <a href="../Primavera.html">
              <img class="immaginestagionestat" src="../Icons/primavera.png">
              <p class="contornostagione misuracolore">Primavera</p>
              <p class="misuracolore">km totali ${data.p} <img src="../Icons/traguardo.png"></p>
              <p class="misuracolore">${data.avgp} %</p>
          </a>
      </div>
      <div class="autunno_inverno">
          <a href="../Autunno_Inverno.html">
              <img class="immaginestagionestat" src="../Icons/inverno.png">
              <p class="contornostagione misuracolore">Autunno - Inverno</p>
              <p class="misuracolore">km totali ${data.ai} <img src="../Icons/traguardo.png"></p>
              <p class="misuracolore">${data.avgai} %</p>
          </a>
      </div>`,
    createStampat = (data) => `
      <div class="colore">
          <p class="misuracolore">totale km ${data.totale} <img src="../Icons/traguardo.png"></p>
          <p class="misuracolore">Media km per Stagione ${data.avgmediastagione} km</p>
      </div>
    `;

  function calculateData(estateData, primaveraData, autunnoInvernoData) {
    const estate = sumData(estateData.data),
      primavera = sumData(primaveraData.data),
      autunno_inverno = sumData(autunnoInvernoData.data),
      totale = estate + primavera + autunno_inverno;

    return {
      e: estate,
      p: primavera,
      ai: autunno_inverno,
      totale,
      avge: ((estate / totale) * 100).toFixed(2),
      avgp: ((primavera / totale) * 100).toFixed(2),
      avgai: ((autunno_inverno / totale) * 100).toFixed(2),
      avgmediastagione: (totale / 3).toFixed(2),
    };
  }

  function createDati(labels, data) {
    return {
      labels,
      datasets: [
        {
          label: "km totali stagione",
          backgroundColor: ["red", "lightgreen", "lightblue"],
          borderColor: ["black"],
          borderWidth: 1,
          data,
        },
      ],
    };
  }

  function createChartConfig(labels, data) {
    return {
      type: "doughnut",
      data: createDati(labels, data),
    };
  }

  async function loadAndRenderData() {
    const estateData = await fetchDataForSeason("../Estate/estate.json"),
      primaveraData = await fetchDataForSeason("../Primavera/primavera.json"),
      autunnoInvernoData = await fetchDataForSeason(
        "../Autunno_Inverno/autunno-inverno.json"
      );

    if (estateData && primaveraData && autunnoInvernoData) {
      const calculatedData = calculateData(
          estateData,
          primaveraData,
          autunnoInvernoData
        ),
        labels = ["Estate", "Primavera", "Autunno-Inverno"],
        chartData = [calculatedData.e, calculatedData.p, calculatedData.ai],
        ctx = document.getElementById("doughnut-chart").getContext("2d");

      document.getElementById("dati").innerHTML = renderStampa(calculatedData);
      document.getElementById("totale").innerHTML =
        createStampat(calculatedData);
      const chartConfig = createChartConfig(labels, chartData);
      new Chart(ctx, chartConfig);
    } else console.error("Errore durante il caricamento dei dati");
  }

  loadAndRenderData();
});
