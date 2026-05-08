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


// Funzione per calcolare il valore medio (grezzo, non formattato)
const calculatekmMedi = (totale, divider, isPercentage = false) => {
  const result = totale / divider;
  return isPercentage ? result * 100 : result;
};


// Funzione per calcolare le percentuali con formattazione condizionale
const calculatePercentuali = (chilometri, totale) =>
  chilometri.map((km) => {
    const rawPercentage = calculatekmMedi(km, totale, true);
    return formatNumberConditionally(rawPercentage);
  });


// Funzione principale (eseguita dopo il caricamento del DOM)
document.addEventListener("DOMContentLoaded", async () => {
  // Assicurati che le dipendenze siano caricate
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error('Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js');
    return;
  }

  const jsonUrl = document.getElementById("json").getAttribute("link");

  try {
    const response = await fetch(jsonUrl);
    const jsonData = await response.json();

    const { year, numberOfRaces: corse, data, colors } = jsonData;

    const mesi = Object.keys(data);
    const chilometri = Object.values(data);
    const totale = chilometri.reduce((acc, curr) => acc + curr, 0);

    // Calcolo percentuali con la funzione aggiornata
    const percentuali = calculatePercentuali(chilometri, totale);

    // Calcoli grezzi
    const rawKmMediPerCorsa = calculatekmMedi(totale, corse);
    const rawKmMediPerMese = calculatekmMedi(totale, mesi.length);

    // Applicazione formattazione condizionale
    const kmMediPerCorsa = formatNumberConditionally(rawKmMediPerCorsa);
    const kmMediPerMese = formatNumberConditionally(rawKmMediPerMese);

    // Usa il sistema centralizzato per creare il grafico
    const chartData = {
      year,
      data,
      colors
    };
    
    await window.chartRenderer.createChart('anni', chartData);

    // Render delle sezioni rimanenti
    renderDataTable(mesi, chilometri, percentuali);
    renderSummary(totale, kmMediPerCorsa, kmMediPerMese, corse);
  } catch (error) {
    console.error(`Errore nel caricamento o elaborazione del JSON: ${error}`);
  }
});


// --- FUNZIONI DI RENDER ---


// Funzione renderChart rimossa - ora gestita dal sistema centralizzato


function renderDataTable(mesi, chilometri, percentuali) {
  const tabellaDati = `
        <tr class="grassetto">
            <th>Mese</th>
            <th>km <img src="../../Icons/traguardo.png" alt="traguardo"></th>
            <th>Percentuale sull'anno</th>
        </tr>
        ${mesi
          .map(
            (mese, index) => `
                <tr>
                    <td>${mese}</td>
                    <td>${formatItalianNumber(chilometri[index])}</td>
                    <td>${percentuali[index]} %</td>
                </tr>`,
          )
          .join("")}
    `;
  document.getElementById("mesi").innerHTML = tabellaDati;
}


function renderSummary(totale, kmMediPerCorsa, kmMediPerMese, totaleCorse) {
  // 🛡️ controllo input
  const mesiCount = document.getElementById("mesi")?.querySelectorAll("tr").length - 1 || 0;
  const validoMesi = mesiCount > 0;
  const validoCorse = totaleCorse != null && totaleCorse > 0;

  let mediaCorsePerMese = "N/A";
  if (validoMesi && validoCorse) {
    const rawMedia = totaleCorse / mesiCount;
    mediaCorsePerMese = formatNumberConditionally(rawMedia);
  }

  const formattedTotale = formatItalianNumber(totale);
  const formattedTotaleCorse = formatItalianNumber(totaleCorse);

  const stampat = `
        <div class="colore">
            <p class="misuracolore">Totale km ${formattedTotale} <img src="../../Icons/traguardo.png" alt="traguardo"></p>
            <p class="misuracolore">km medi per corsa ${kmMediPerCorsa}</p>
            <p class="misuracolore">km medi per mese ${kmMediPerMese}</p>
            <p class="misuracolore">Totale corse ${formattedTotaleCorse}</p>
            <p class="misuracolore">Medie corse per mese ${mediaCorsePerMese}</p>
        </div>
    `;
  document.getElementById("totale").innerHTML = stampat;
}

