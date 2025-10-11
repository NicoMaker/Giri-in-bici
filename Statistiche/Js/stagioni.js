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

    const renderStampa = (data) => `
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
        </div>`;

    const createStampat = (data) => `
        <div class="colore">
            <p class="misuracolore">Totale km ${formatNumberConditionally(data.totale)} <img src="../Icons/traguardo.png"></p>
            <p class="misuracolore">Media km per Stagione ${data.avgmediastagione} km</p>
            <p class="misuracolore">Media km per Periodo ${data.avgperiod} km</p>
        </div>`;

    // ✅ Ordine dei parametri corretto: primavera, estate, autunno_inverno
    function calculateData(primaveraData, estateData, autunnoInvernoData, numPeriodi) {
        const primavera = sumData(primaveraData),
            estate = sumData(estateData),
            autunno_inverno = sumData(autunnoInvernoData),
            totale = primavera + estate + autunno_inverno,
            totalePeriodi =
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
                })
            );

            return {
                name: season.name,
                data: subPeriodsData.flat(),
            };
        });

        const resolvedSeasons = await Promise.all(seasonDataPromises);

        // 🔍 Trova le stagioni per nome, indipendentemente dall’ordine
        const primaveraPromise = resolvedSeasons.find((s) =>
                s.name.toLowerCase().includes("primavera")
            ),
            estatePromise = resolvedSeasons.find((s) =>
                s.name.toLowerCase().includes("estate")
            ),
            autunnoInvernoPromise = resolvedSeasons.find((s) =>
                s.name.toLowerCase().includes("inverno")
            );

        if (primaveraPromise && estatePromise && autunnoInvernoPromise) {
            const calculatedData = calculateData(
                primaveraPromise.data,
                estatePromise.data,
                autunnoInvernoPromise.data,
                numPeriodi
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
