// Funzione di utilità per la formattazione condizionale
const formatNumberConditionally = (value) => {
    // Se il valore è un intero, lo restituisce come stringa intera (es. 10)
    if (Number.isInteger(value)) {
        return value.toString();
    }
    // Altrimenti, lo formatta con due decimali (es. 10.33)
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
    },renderStampa = (data) => `
  <div class="primavera">
      <a href="../Primavera.html">
          <img class="immaginestagionestat" src="../Icons/primavera.png">
          <p class="contornostagione misuracolore">Primavera</p>
          <p class="misuracolore">
              km totali ${formatNumberConditionally(data.p)} 
              <img src="../Icons/traguardo.png">
          </p>
          <p class="misuracolore">${formatNumberConditionally(parseFloat(data.avgp))} %</p>
      </a>
  </div>

  <div class="estate">
      <a href="../Estate.html">
          <img class="immaginestagionestatsx" src="../Icons/estate.png">
          <p class="contornostagione misuracolore">Estate</p>
          <p class="misuracolore">
              km totali ${formatNumberConditionally(data.e)} 
              <img src="../Icons/traguardo.png">
          </p>
          <p class="misuracolore">${formatNumberConditionally(parseFloat(data.avge))} %</p>
      </a>
  </div>

  <div class="autunno_inverno">
      <a href="../Autunno_Inverno.html">
          <img class="immaginestagionestat" src="../Icons/inverno.png">
          <p class="contornostagione misuracolore">Autunno - Inverno</p>
          <p class="misuracolore">
              km totali ${formatNumberConditionally(data.ai)} 
              <img src="../Icons/traguardo.png">
          </p>
          <p class="misuracolore">${formatNumberConditionally(parseFloat(data.avgai))} %</p>
      </a>
  </div>`,

        createStampat = (data) => `
      <div class="colore">
          <p class="misuracolore">Totale km ${data.totale} <img src="../Icons/traguardo.png"></p>
          <p class="misuracolore">Media km per Stagione ${data.avgmediastagione} km</p>
          <p class="misuracolore">Media km per Periodo ${data.avgperiod} km</p>
      </div>`;

    function calculateData(
        estateData,
        primaveraData,
        autunnoInvernoData,
        numPeriodi
    ) {
        const estate = sumData(estateData),
            primavera = sumData(primaveraData),
            autunno_inverno = sumData(autunnoInvernoData),
            totale = estate + primavera + autunno_inverno,
            totalePeriodi =
                numPeriodi.estate + numPeriodi.primavera + numPeriodi.autunno_inverno;

        // Calcola la media km per Stagione (3 stagioni/periodi principali)
        const rawAvgSeason = totale / 3;
        const avgmediastagioneFormatted = formatNumberConditionally(rawAvgSeason);

        // Calcola la media km per Periodo (totale periodi secondari)
        let avgperiodFormatted;
        if (totalePeriodi > 0) {
            const rawAvgPeriod = totale / totalePeriodi;
            avgperiodFormatted = formatNumberConditionally(rawAvgPeriod);
        } else {
            avgperiodFormatted = "N/A";
        }

        return {
            e: estate,
            p: primavera,
            ai: autunno_inverno,
            totale,
            avge: ((estate / totale) * 100).toFixed(2),
            avgp: ((primavera / totale) * 100).toFixed(2),
            avgai: ((autunno_inverno / totale) * 100).toFixed(2),
            // Restituisce i valori formattati
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
            estate: 0,
            primavera: 0,
            autunno_inverno: 0,
        },
            seasonDataPromises = seasonsData.seasons.map(async (season) => {
                const periodCount = Object.keys(season.subPeriods).length;
                // NOTA: Ho corretto l'assegnazione per usare l'indice corretto
                numPeriodi[season.name.toLowerCase().replace("-", "_")] = periodCount; 

                const subPeriodsData = await Promise.all(
                    Object.entries(season.subPeriods).map(async ([, subFile]) => {
                        const correctedPath = subFile.startsWith("../")
                            ? subFile
                            : `../${subFile}`,
                            subData = await fetchJSON(correctedPath);
                        return subData ? subData : [];
                    })
                );

                return {
                    name: season.name,
                    data: subPeriodsData.flat(),
                };
            }),
            [primaveraPromise, estatePromise, autunnoInvernoPromise] = await Promise.all( // Ordine cambiato per coerenza con l'array
                seasonDataPromises
            );

        if (primaveraPromise && estatePromise && autunnoInvernoPromise) {
            const calculatedData = calculateData(
                estatePromise.data, // Dati Estate
                primaveraPromise.data, // Dati Primavera
                autunnoInvernoPromise.data, // Dati Autunno/Inverno
                numPeriodi
            ),
                labels = ["Primavera", "Estate", "Autunno-Inverno"],
                chartData = [calculatedData.p, calculatedData.e, calculatedData.ai],
                ctx = document.getElementById("doughnut-chart").getContext("2d");

            document.getElementById("dati").innerHTML = renderStampa(calculatedData);
            document.getElementById("totale").innerHTML =
                createStampat(calculatedData);
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
        } else console.error("Errore durante il caricamento dei dati");
    }

    loadAndRenderData();
});