// Funzione di utilità per la formattazione condizionale (DEVE ESSERE DEFINITA FUORI DA DOMContentLoaded se usata come variabile globale, o interna se non lo è)
const formatNumberConditionally = (value) => {
    // Se il valore è un intero (es. 10.0), lo mostra senza decimali
    if (Number.isInteger(value)) {
        return value.toString();
    }
    // Altrimenti, lo formatta con due decimali (es. 10.33)
    return value.toFixed(2);
};

document.addEventListener("DOMContentLoaded", async () => {
    async function fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok)
                throw new new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            return null;
        }
    }

    async function fetchData() {
        const mainData = await fetchJSON(
            "Statistiche/Js/History/JSON/Generale.json",
        );
        if (!mainData || !mainData.statistics) {
            console.error("Main data not available or statistics field missing");
            return null;
        }

        const statistics = await Promise.all(
            Object.keys(mainData.statistics).map(async (year) => {
                const data = await fetchJSON(mainData.statistics[year]);
                return data
                    ? {
                        year: data.year,
                        km: Object.values(data.data).reduce((sum, val) => sum + val, 0),
                        numberOfRaces: data.numberOfRaces,
                        monthlyData: data.data,
                    }
                    : null;
            }),
        );

        return {
            mainData,
            statistics: statistics.filter((data) => data !== null),
        };
    }

    function calculateAverages(statistics) {
        const totalekm = statistics.reduce((acc, cur) => acc + cur.km, 0),
            totaleCorse = statistics.reduce((acc, cur) => acc + cur.numberOfRaces, 0),
            totalMonthlykm = statistics.reduce(
                (acc, cur) =>
                    acc +
                    Object.values(cur.monthlyData).reduce((sum, val) => sum + val, 0),
                0,
            ),
            totalMonths = statistics.reduce(
                (acc, cur) => acc + Object.keys(cur.monthlyData).length,
                0,
            );

        // --- APPLICAZIONE DELLA FORMATTAZIONE CONDIZIONALE QUI ---
        const avgkmPerRaceRaw = totaleCorse > 0 ? totalekm / totaleCorse : 0;
        const avgkmPerYearRaw = statistics.length > 0 ? totalekm / statistics.length : 0;
        const avgkmPerMonthRaw = totalMonths > 0 ? totalMonthlykm / totalMonths : 0;

        return {
            totalekm,
            // Restituisce i valori formattati
            avgkmPerRace: formatNumberConditionally(avgkmPerRaceRaw),
            avgkmPerYear: formatNumberConditionally(avgkmPerYearRaw),
            avgkmPerMonth: formatNumberConditionally(avgkmPerMonthRaw),
            avgValues: statistics.map((entry) =>
                ((entry.km / totalekm) * 100).toFixed(2),
            ),
        };
    }
    // -------------------------------------------------------------

    function createChartConfig(labels, data, colors) {
        return {
            type: "doughnut",
            data: {
                labels,
                datasets: [
                    {
                        label: "km totali",
                        backgroundColor: colors,
                        borderColor: ["black"],
                        borderWidth: 1,
                        data,
                    },
                ],
            },
        };
    }

    const renderStampa = (statistics, avgValues, itemsPerPage, currentPage) => {
        const storageKey = "page_statistiche";
        const lastPage = Math.ceil(statistics.length / itemsPerPage);

        if (currentPage > lastPage) currentPage = 1;

        localStorage.setItem(storageKey, currentPage);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentStatistics = statistics.slice(startIndex, endIndex);
        const isOdd = currentStatistics.length === 1;
        const containerClass = isOdd ? "container odd-items" : "container";

        document.getElementById("stampa").innerHTML = `
      <div class="${containerClass}">
        ${currentStatistics
                .map(
                    (entry, index) => `
              <div class="Statistiche">
                <a href="Statistiche/Anni/${entry.year}.html">
                  <img class="immaginestagione" src="Icons/Statistiche.png">
                  <p class="titoli">Statistiche ${entry.year}</p>
                  <p>km totali ${entry.km} <img src="Icons/traguardo.png"></p>
                  <p>${avgValues[startIndex + index]} %</p>
                </a>
              </div>
            `,
                )
                .join("")}
      </div>`;

        const pagination = document.getElementById("pagination");
        pagination.innerHTML = `
      <button id="prev">
        <span class="material-icons">arrow_back</span>
      </button>
      <span id="page-indicator">Dati Statistiche: <br/> Anni ${currentPage} di ${lastPage}</span>
      <button id="next">
        <span class="material-icons">arrow_forward</span>
      </button>
    `;

        document.getElementById("prev").addEventListener("click", () => {
            const newPage = currentPage === 1 ? lastPage : currentPage - 1;
            renderStampa(statistics, avgValues, itemsPerPage, newPage);
        });

        document.getElementById("next").addEventListener("click", () => {
            const newPage = currentPage === lastPage ? 1 : currentPage + 1;
            renderStampa(statistics, avgValues, itemsPerPage, newPage);
        });
    };

    // renderSummary non ha bisogno di modifiche perché riceve già i valori formattati
    const renderSummary = (totalekm, avgkmPerRace, avgkmPerYear, avgkmPerMonth) =>
        (document.getElementById("totale").innerHTML = `
        <a href="Statistiche/History/Statistiche_Totali.html">
          <div class="colore">
            <p>Totale km ${totalekm} <img src="Icons/traguardo.png"></p>
            <p>km medi per giro ${avgkmPerRace}</p>
            <p>km medi per anno ${avgkmPerYear}</p>
            <p>km medi per mese ${avgkmPerMonth}</p>
          </div>
        </a>`);

    const renderChart = (labels, data, colors) => {
        const doughnutConfig = createChartConfig(labels, data, colors);
        const doughnutCtx = document
            .getElementById("doughnut-chart")
            .getContext("2d");
        new Chart(doughnutCtx, doughnutConfig);
    };

    const dataResult = await fetchData();

    if (dataResult && dataResult.mainData) {
        const { mainData, statistics } = dataResult;
        const { colors } = mainData;
        const { totalekm, avgkmPerRace, avgkmPerYear, avgkmPerMonth, avgValues } =
            calculateAverages(statistics); // I valori medi sono ora formattati

        const labels = statistics.map((entry) => `km ${entry.year}`);
        const values = statistics.map((entry) => entry.km);
        const itemsPerPage = 2;

        renderChart(labels, values, colors);
        renderSummary(totalekm, avgkmPerRace, avgkmPerYear, avgkmPerMonth);

        // 🔁 Recupera pagina salvata o default 1
        const savedPage = parseInt(localStorage.getItem("page_statistiche")) || 1;
        renderStampa(statistics, avgValues, itemsPerPage, savedPage);
    } else {
        console.error("Nessun dato ricevuto");
    }
});