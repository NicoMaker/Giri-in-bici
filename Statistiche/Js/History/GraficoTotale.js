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

document.addEventListener("DOMContentLoaded", async () => {
  // Assicurati che le dipendenze siano caricate
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error('Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js');
    return;
  }

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
      percentuali.push(totale > 0 ? ChartConfigs.formatItalianNumber(((chilometriMensili / totale) * 100), true, true) : "0,00");
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
      if (totale === 0) return "0,00";
      return formatItalianNumber(((chilometri[index] / totale) * 100), true);
    });
    
    return {
      percentuali: percentuali,
      kmMediPerCorsa: formatNumberConditionally(rawKmMediPerCorsa),
      kmMediPerMese: formatNumberConditionally(rawKmMediPerMese),
      racesPerYear: formatNumberConditionally(rawRacesPerYear),
      racesPerMonth: formatNumberConditionally(rawRacesPerMonth),
    };
  }

// Funzione createChartConfig rimossa - ora gestita dal sistema centralizzato

  // Funzione renderChart rimossa - ora gestita dal sistema centralizzato

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
    const formattedTotaleCorse = formatItalianNumber(totaleCorse);
    
    return `
      <a href="Statistiche_Mensili.html">
        <div class="colore">
          <p class="misuracolore">Totale km ${formatNumberConditionally(totale)} <img src="../../Icons/traguardo.png"></p>
          <p class="misuracolore">Km medi per corsa ${kmMediPerCorsa}</p>
          <p class="misuracolore">Km medi per mese ${kmMediPerMese}</p>
          <p class="misuracolore">Totale corse ${formattedTotaleCorse}</p>
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
        
        // Usa il sistema centralizzato per creare il grafico
        const chartData = {
          labels: mesi,
          values: chilometri,
          anni,
          percentuali
        };
        
        await window.chartRenderer.createChart('graficoTotale', chartData);

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