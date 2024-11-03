document.addEventListener("DOMContentLoaded", () => {
  async function fetchData(file) {
    try {
      const response = await fetch(file);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching data from ${file}:`, error);
      return null;
    }
  }

  const sumData = (data) => {
    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      return 0;
    }

    return data.reduce((total, km) => {
      const distanceValue = km.distance || 0;
      return total + distanceValue;
    }, 0);
  }, renderStampa = (data) => `
           <div class="primavera">
          <a href="../Primavera.html">
              <img class="immaginestagionestat" src="../Icons/primavera.png">
              <p class="contornostagione misuracolore">Primavera</p>
              <p class="misuracolore">km totali ${data.p} <img src="../Icons/traguardo.png"></p>
              <p class="misuracolore">${data.avgp} %</p>
          </a>
      </div>
 <div class="estate">
          <a href="../Estate.html">
              <img class="immaginestagionestat" src="../Icons/estate.png">
              <p class="contornostagione misuracolore">Estate</p>
              <p class="misuracolore">km totali ${data.e} <img src="../Icons/traguardo.png"></p>
              <p class="misuracolore">${data.avge} %</p>
          </a>
      </div>
      <div class="autunno_inverno">
          <a href="../Autunno_Inverno.html">
              <img class="immaginestagionestat" src="../Icons/inverno.png">
              <p class="contornostagione misuracolore">Autunno - Inverno</p>
              <p class="misuracolore">km totali ${data.ai} <img src="../Icons/traguardo.png"></p>
              <p class="misuracolore">${data.avgai} %</p>
          </a>
      </div>`,createStampat = (data) => `
      <div class="colore">
          <p class="misuracolore">totale km ${data.totale} <img src="../Icons/traguardo.png"></p>
          <p class="misuracolore">Media km per Stagione ${data.avgmediastagione} km</p>
      </div>`;

  function calculateData(estateData, primaveraData, autunnoInvernoData) {
    const estate = sumData(estateData),
      primavera = sumData(primaveraData),
      autunno_inverno = sumData(autunnoInvernoData),
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
          backgroundColor: ["lightgreen","red","lightblue"],
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
    const seasonsData = await fetchData("Js/anni/stagioni.json");

    if (!seasonsData || !Array.isArray(seasonsData.seasons)) {
      console.error("Invalid seasons data");
      return;
    }

    const seasonDataPromises = seasonsData.seasons.map(async (season) => {
        const subPeriodsData = await Promise.all(
          Object.entries(season.subPeriods).map(async ([year, subFile]) => {
            const subData = await fetchData(subFile);
            console.log(`Data for ${year}:`, subData);
            return subData ? subData : [];
          })
        );

        return {
          name: season.name,
          data: subPeriodsData.flat(),
        };
      }),
      [estateData, primaveraData, autunnoInvernoData] = await Promise.all(
        seasonDataPromises
      );

    if (estateData && primaveraData && autunnoInvernoData) {
      const calculatedData = calculateData(
          estateData.data,
          primaveraData.data,
          autunnoInvernoData.data
        ),
        labels = ["Primavera","Estate","Autunno-Inverno"],
        chartData = [calculatedData.p, calculatedData.e, calculatedData.ai],
        ctx = document.getElementById("doughnut-chart").getContext("2d");

      document.getElementById("dati").innerHTML = renderStampa(calculatedData);
      document.getElementById("totale").innerHTML =
        createStampat(calculatedData);
      const chartConfig = createChartConfig(labels, chartData);
      new Chart(ctx, chartConfig);
    } else {
      console.error("Errore durante il caricamento dei dati");
    }
  }

  loadAndRenderData();
});
