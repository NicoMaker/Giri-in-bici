// Funzione di utilità per la formattazione condizionale
// Always show 2 decimal places for tables
const formatNumberConditionally = (value) => {
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

// 🔹 Funzione generica: media su 12 mesi
const getMediaPer12 = (totale) => {
  const mediaRaw = totale / 12;
  return formatNumberConditionally(mediaRaw);
};

document.addEventListener("DOMContentLoaded", async () => {
  // Assicurati che le dipendenze siano caricate
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error('Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js');
    return;
  }

  const mesiOrdinati = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  const getTotale = (chilometri) =>
    chilometri.reduce((acc, curr) => acc + curr, 0);

  const getPercentuali = (chilometri, totale) =>
    chilometri.map((km) => ((km / totale) * 100).toFixed(2));

  // 🔹 Calcolo km medi per mese
  const getkmPerMese = (mesi, chilometri, mesiPercorsi) =>
    mesi.map((mese, index) => {
      let kmMediMese = 0;
      if (mesiPercorsi[index] > 0) {
        kmMediMese = chilometri[index] / mesiPercorsi[index];
        kmMediMese = kmMediMese.toFixed(2);
      }
      return { mese, kmMediMese };
    });

  const getTotaleCorse = (allData) => {
    let totaleCorse = 0;
    allData.forEach((json) => {
      totaleCorse += json.numberOfRaces || 0;
    });
    return totaleCorse;
  };

  // Funzioni di configurazione grafico rimosse - ora gestite dal sistema centralizzato

  const createTableHTML = (kmPerMese, chilometri, percentuali, mesiPercorsi) => `
    <tr class="grassetto">
      <th>Mese</th>
      <th>km <img src="../../Icons/traguardo.png"></th>
      <th>Percentuale sul totale</th>
      <th>Mesi di Corsa</th>
      <th>km <img src="../../Icons/traguardo.png"> medi mensili</th>
     </tr>
    ${kmPerMese
      .map(
        ({ mese, kmMediMese }, index) => `
       <tr>
        <td>${mese}</td>
        <td>${formatItalianNumber(chilometri[index])}</td>
        <td>${percentuali[index]} %</td>
        <td>${mesiPercorsi[index]}</td>
        <td>${formatItalianNumber(kmMediMese)}</td>
       </tr>`
      )
      .join("")}
  `;

  const createSummaryHTML = (totale, mediaComplessiva, totaleCorse, mediacorse) => {
    const formattedTotale = formatItalianNumber(totale);
    const formattedTotaleCorse = formatItalianNumber(totaleCorse);
    
    return `
    <a href="StoricoMensile.html">
      <div class="colore">
          <p class="misuracolore">totale km ${formattedTotale} <img src="../../Icons/traguardo.png"></p>
          <p class="misuracolore">km totali medi per mese ${mediaComplessiva}</p>
          <p class="misuracolore">Totale corse ${formattedTotaleCorse}</p>
          <p class="misuracolore">Medie corse per mese (12 mesi) ${mediacorse}</p>
      </div>
    </a>`;
  };

  fetch("../Js/History/JSON/GraficoTotale.json")
    .then((response) => response.json())
    .then((statistics) => {
      const allDataPromises = [];

      Object.keys(statistics.statistics).forEach((year) => {
        const filePath = statistics.statistics[year];
        allDataPromises.push(
          fetch(filePath).then((response) => response.json())
        );
      });

      Promise.all(allDataPromises)
        .then(async (allData) => {
          let chilometriTotali = new Array(12).fill(0);
          let mesiPercorsi = new Array(12).fill(0);
          const coloriGlobali = statistics.colors;

          allData.forEach((json) => {
            const data = json.data;
            mesiOrdinati.forEach((mese, index) => {
              if (data[mese]) {
                chilometriTotali[index] += data[mese];
                mesiPercorsi[index] += 1;
              }
            });
          });

          const totaleChilometri = getTotale(chilometriTotali);
          const percentuali = getPercentuali(chilometriTotali, totaleChilometri);
          const kmPerMese = getkmPerMese(mesiOrdinati, chilometriTotali, mesiPercorsi);

          // ✅ km medi per mese su 12
          const mediaComplessiva = getMediaPer12(totaleChilometri);
          const totaleCorse = getTotaleCorse(allData);

          // ✅ medie corse per mese su 12
          const mediacorse = getMediaPer12(totaleCorse);

          // Usa il sistema centralizzato per creare entrambi i grafici
          const chartData = {
            labels: mesiOrdinati,
            values: chilometriTotali,
            colors: coloriGlobali,
            percentuali
          };
          
          // Crea grafico a barre
          await window.chartRenderer.createChart('graficoTotaleMensile', chartData);
          
          // Crea grafico a linee (stesso dati ma tipo diverso)
          await window.chartRenderer.createChart('graficoTotaleMensileLine', chartData);

          // 🔹 Tabella mesi
          document.getElementById("mesi").innerHTML = createTableHTML(
            kmPerMese,
            chilometriTotali,
            percentuali,
            mesiPercorsi
          );

          // 🔹 Riepilogo totale
          document.getElementById("totale").innerHTML = createSummaryHTML(
            totaleChilometri,
            mediaComplessiva,
            totaleCorse,
            mediacorse
          );
        })
        .catch((error) => {
          console.error(`Errore nel caricamento dei file JSON: ${error}`);
        });
    })
    .catch((error) => {
      console.error(`Errore nel caricamento del file statistics.json: ${error}`);
    });
});

document.getElementById("grafici").innerHTML = `
    <br />
    <canvas id="line-chart"></canvas>
    <br />

    <br />
    <canvas id="bar-chart"></canvas>
    <br />
 `;