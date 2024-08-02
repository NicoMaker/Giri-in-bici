document.addEventListener("DOMContentLoaded", () => {
  async function fetchData() {
    try {
      const response = await fetch("JS/Anni/Stagioni.json"),
        jsonData = await response.json();
      return jsonData;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  function calculateData(data) {
    const { estate, primavera, autunno_inverno } = data,
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

  const renderStampa = (data) => `
    <div class="estate">
        <a href="../Estate.html">
            <img class="immaginestagionestat" src="../Icons/estate.png">
            <p class="contornostagione misuracolre">Estate</p>
            <p class="misuracolre">km totali ${data.e} <img src="../Icons/traguardo.png"></p>
            <p class="misuracolre">${data.avge} %</p>
        </a>
    </div>
    <div class="primavera">
        <a href="../Primavera.html">
            <img class="immaginestagionestat" src="../Icons/primavera.png">
            <p class="contornostagione misuracolre">Primavera</p>
            <p class="misuracolre">km totali ${data.p} <img src="../Icons/traguardo.png"></p>
            <p class="misuracolre">${data.avgp} %</p>
        </a>
    </div>
    <div class="autunno_inverno">
        <a href="../Autunno_Inverno.html">
            <img class="immaginestagionestat" src="../Icons/inverno.png">
            <p class="contornostagione misuracolre">Autunno - Inverno</p>
            <p class="misuracolre">km totali ${data.ai} <img src="../Icons/traguardo.png"></p>
            <p class="misuracolre">${data.avgai} %</p>
        </a>
    </div>
  `;

  const createStampat = (data) => `
    <div class="colore">
        <p class="misuracolre">totale km ${data.totale} <img src="../Icons/traguardo.png"></p>
        <p class="misuracolre">Media km per Stagione ${data.avgmediastagione} km</p>
    </div>
  `;

  fetchData()
    .then((data) => {
      if (data) {
        const calculatedData = calculateData(data),
          labels = ["Estate", "Primavera", "Autunno-Inverno"],
          chartData = [calculatedData.e, calculatedData.p, calculatedData.ai],
          ctx = document.getElementById("doughnut-chart").getContext("2d");

        document.getElementById("dati").innerHTML =
          renderStampa(calculatedData);
        document.getElementById("totale").innerHTML =
          createStampat(calculatedData);
        const chartConfig = createChartConfig(labels, chartData);
        new Chart(ctx, chartConfig);
      } else {
        console.error("Nessun dato ricevuto");
      }
    })
    .catch((error) => {
      console.error("Errore durante il fetch:", error);
    });
});
