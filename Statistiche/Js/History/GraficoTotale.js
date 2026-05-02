// Funzione di utilità per la formattazione condizionale
const formatNumberConditionally = (value) => {
  // Se il valore è un intero (es. 10.0), lo mostra senza decimali
  if (Number.isInteger(value)) {
    return value.toString();
  }
  // Altrimenti, lo formatta con due decimali (es. 10.33)
  return value.toFixed(2);
};

document.addEventListener("DOMContentLoaded", () => {
  async function fetchData() {
    try {
      const response = await fetch("../Js/History/JSON/GraficoTotale.json"),
        jsonData = await response.json();
      return jsonData;
    } catch (error) {
      console.error(`Errore nel caricamento dei dati: ${error}`);
      return null;
    }
  }

  async function fetchYearData(url, year) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Validazione struttura dati
      if (!data || typeof data !== "object") {
        throw new Error("Dati non validi");
      }
      
      // Aggiunge l'anno ai dati se non presente
      if (!data.year && year) {
        data.year = year;
      }
      
      return data;
    } catch (error) {
      console.error(`Errore nel caricamento dei dati da ${url}: ${error}`);
      return null;
    }
  }

  function calculateTotals(yearlyData) {
    let totale = 0,
      chilometri = [],
      mesi = [],
      anni = [],
      percentuali = []; // Aggiunto per il grafico

    const combinedData = [];
    
    yearlyData.forEach((item) => {
      // Controllo struttura dati
      if (!item || !item.data) {
        console.error("Dato annuale non valido:", item);
        return;
      }
      
      const year = item.year || "Sconosciuto";
      
      for (let mese in item.data) {
        if (item.data.hasOwnProperty(mese)) {
          combinedData.push({ 
            mese: mese, 
            chilometri: item.data[mese], 
            year: year 
          });
        }
      }
    });

    // Ordinamento per anno e mese
    const orderMesi = {
      "Gennaio": 1, "Febbraio": 2, "Marzo": 3, "Aprile": 4,
      "Maggio": 5, "Giugno": 6, "Luglio": 7, "Agosto": 8,
      "Settembre": 9, "Ottobre": 10, "Novembre": 11, "Dicembre": 12
    };
    
    combinedData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return (orderMesi[a.mese] || 0) - (orderMesi[b.mese] || 0);
    });

    // Calcolo del totale per le percentuali
    totale = combinedData.reduce((acc, item) => acc + item.chilometri, 0);

    combinedData.forEach(({ chilometri: chilometriMensili, mese, year }) => {
      chilometri.push(chilometriMensili);
      mesi.push(mese);
      anni.push(year);
      // Calcolo percentuale per ogni punto
      percentuali.push(totale > 0 ? ((chilometriMensili / totale) * 100).toFixed(2) : "0.00");
    });

    return { totale, chilometri, mesi, anni, percentuali };
  }

  function calculateAverages(totale, totaleCorse, totaleAnni, chilometri, mesi) {
    // Calcolo dei valori grezzi
    const rawKmMediPerCorsa = totaleCorse > 0 ? totale / totaleCorse : 0;
    const rawKmMediPerMese   = mesi.length > 0 ? totale / mesi.length : 0;
    
    // Medie corse
    const rawRacesPerYear    = totaleAnni > 0 ? totaleCorse / totaleAnni : 0;
    const rawRacesPerMonth   = mesi.length > 0 ? totaleCorse / mesi.length : 0;
    
    // Calcolo percentuali con controllo divisione per zero
    const percentuali = mesi.map((mese, index) => {
      if (totale === 0) return "0.00";
      return ((chilometri[index] / totale) * 100).toFixed(2);
    });
    
    return {
      percentuali: percentuali,
      kmMediPerCorsa: formatNumberConditionally(rawKmMediPerCorsa),
      kmMediPerMese: formatNumberConditionally(rawKmMediPerMese),
      racesPerYear: formatNumberConditionally(rawRacesPerYear),
      racesPerMonth: formatNumberConditionally(rawRacesPerMonth),
    };
  }

function createChartConfig(labels, data, anni, percentuali) {
  return {
    type: "line",
    data: {
      labels: labels.map((mese, index) => `${mese} (${anni[index]})`),
      datasets: [
        {
          label: "km mensili per periodo totali",
          // RIMUOVI LA COLORAZIONE INTERNA
          backgroundColor: "transparent",  // ← TRANSPARENTE invece di rgba
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 3,  // Linea più spessa per visibilità
          fill: false,     // ← NESSUN FILL sotto la linea
          data: data,
          // Dati aggiuntivi per il tooltip
          percentuali: percentuali
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: { 
          beginAtZero: true,
          title: {
            display: true,
            text: "Chilometri"
          }
        },
        x: {
          title: {
            display: true,
            text: "Mese (Anno)"
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const km = formatNumberConditionally(context.raw);
              const perc = context.dataset.percentuali[context.dataIndex];
              return [
                `${context.dataset.label}: ${km} km`,
                `(${perc}%)`
              ];
            }
          }
        }
      }
    },
  };
}

  const renderChart = (config, ctx) => {
    if (!ctx) {
      console.error("Contesto canvas non disponibile");
      return null;
    }
    return new Chart(ctx, config);
  };

  function createTable(mesi, chilometri, percentuali, anni) {
    if (!mesi || !chilometri || !percentuali || !anni) {
      console.error("Dati mancanti per la tabella");
      return "<tr><td colspan='4'>Errore nel caricamento dei dati</td></tr>";
    }
    
    return `
      <tr class="grassetto">
        <th>Mese</th>
        <th>km <img src="../../Icons/traguardo.png"></th>
        <th>Percentuale sul totale</th>
        <th>Anno</th>
      </tr>
      ${mesi
        .map(
          (mese, index) => `
          <tr>
            <td>${mese || "N/D"}</td>
            <td>${formatNumberConditionally(chilometri[index] || 0)}</td>
            <td>${formatNumberConditionally(parseFloat(percentuali[index]) || 0)} %</td>
            <td>${anni[index] || "N/D"}</td>
          </tr>`,
        )
        .join("")}
    `;
  }

  function createSummary(
    totale,
    kmMediPerCorsa,
    kmMediPerMese,
    totaleCorse,
    racesPerYear,
    racesPerMonth,
    mesi
  ) {
    return `
      <a href="Statistiche_Mensili.html">
        <div class="colore">
          <p class="misuracolore">Totale km ${formatNumberConditionally(totale)} <img src="../../Icons/traguardo.png"></p>
          <p class="misuracolore">Km medi per corsa ${kmMediPerCorsa}</p>
          <p class="misuracolore">Km medi per mese ${kmMediPerMese}</p>
          <p class="misuracolore">Totale corse ${totaleCorse}</p>
          <p class="misuracolore">Corse medie per anno ${racesPerYear}</p>
          <p class="misuracolore">Corse medie per mese ${racesPerMonth}</p>
          <p class="misuracolore">Totale mesi di corsa ${mesi.length}</p>
        </div>
      </a>`;
  }

  // Esecuzione principale
  fetchData()
    .then(async (data) => {
      if (data && data.statistics) {
        const { statistics } = data;
        let yearlyData = [];
        let totaleCorse = 0;

        // Fetch con anno esplicito
        const fetchPromises = Object.entries(statistics).map(([year, url]) =>
          fetchYearData(url, year).then((yearData) => {
            if (yearData) {
              yearlyData.push(yearData);
              totaleCorse += yearData.numberOfRaces || 0;
            }
          })
        );

        await Promise.all(fetchPromises);

        if (yearlyData.length === 0) {
          console.error("Nessun dato annuale caricato");
          return;
        }

        const totaleAnni = yearlyData.length;
        const { totale, chilometri, mesi, anni, percentuali } = calculateTotals(yearlyData);
        
        const { 
          kmMediPerCorsa, 
          kmMediPerMese, 
          racesPerYear, 
          racesPerMonth 
        } = calculateAverages(
          totale,
          totaleCorse,
          totaleAnni,
          chilometri,
          mesi
        );
        
        const chartConfig = createChartConfig(mesi, chilometri, anni, percentuali);
        const canvas = document.getElementById("line-chart");
        
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            renderChart(chartConfig, ctx);
          } else {
            console.error("Contesto 2D non disponibile");
          }
        } else {
          console.error("Elemento canvas non trovato");
        }

        const tableHTML = createTable(mesi, chilometri, percentuali, anni);
        const summaryHTML = createSummary(
          totale,
          kmMediPerCorsa,
          kmMediPerMese,
          totaleCorse,
          racesPerYear,
          racesPerMonth,
          mesi
        );

        const tableElement = document.getElementById("mesi");
        const summaryElement = document.getElementById("totale");
        
        if (tableElement) {
          tableElement.innerHTML = tableHTML;
        } else {
          console.error("Elemento 'mesi' non trovato");
        }
        
        if (summaryElement) {
          summaryElement.innerHTML = summaryHTML;
        } else {
          console.error("Elemento 'totale' non trovato");
        }
        
      } else {
        console.error("Nessun dato ricevuto o struttura statistics mancante", data);
      }
    })
    .catch((error) => {
      console.error(`Errore durante il fetch: ${error}`);
    });
});