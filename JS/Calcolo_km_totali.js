// Calcolo_km_totali.js
// Dipendenze: JS/utils.js (caricato prima in HTML)

// Processa i dati da Storico.json e dai file annuali
const processHistoricalData = (data) => {
  if (!data.anni || typeof data.anni !== "object") {
    console.error("Dati anni non trovati o non validi.");
    return null;
  }

  const yearUrls = Object.values(data.anni);
  const fetchPromises = yearUrls.map((url) =>
    fetchJSON(url)
      .then((yearData) => {
        if (!yearData || typeof yearData !== "object") {
          console.error(`Dati anno non validi per ${url}`);
          return null;
        }
        const monthEntries = Object.entries(yearData.data || {});
        const kmValues = monthEntries
          .map(([month, km]) => km)
          .filter((km) => typeof km === "number" && km > 0);
        const totalKm = kmValues.reduce((sum, km) => sum + km, 0);
        const months = monthEntries.length; // tutti i mesi presenti (anche con 0)
        const corse =
          typeof yearData.numberOfRaces === "number"
            ? yearData.numberOfRaces
            : 0;
        return { totalKm, months, corse, year: yearData.year };
      })
      .catch((error) => {
        console.error(`Errore nel fetch di ${url}: ${error}`);
        return null;
      }),
  );

  return Promise.all(fetchPromises).then((results) => {
    const validResults = results.filter((r) => r !== null);
    const totalKmAll = validResults.reduce((sum, r) => sum + r.totalKm, 0);
    const totalMonthsAll = validResults.reduce((sum, r) => sum + r.months, 0);
    const totalRacesAll = validResults.reduce((sum, r) => sum + r.corse, 0);
    const totalYears = validResults.length;
    return {
      totalKm: totalKmAll,
      totalMonths: totalMonthsAll,
      totalRaces: totalRacesAll,
      totalYears,
    };
  });
};

// Stampa i dati nel div #km
const stampaDati = (totalKm, totalMonths, totalRaces, totalYears) => {
  const avgKmPerRace =
    totalRaces > 0 ? formatNumber(totalKm / totalRaces) : "0";
  const avgKmPerMonth =
    totalMonths > 0 ? formatNumber(totalKm / totalMonths) : "N/A";
  const avgRacesPerMonth =
    totalMonths > 0 ? formatNumber(totalRaces / totalMonths) : "N/A";
  const avgRacesPerYear =
    totalYears > 0 ? formatNumber(totalRaces / totalYears) : "N/A";
  const avgKmPerYear =
    totalYears > 0 ? formatNumber(totalKm / totalYears) : "N/A";

  const formattedTotalKm = formatItalianNumber(totalKm);
  const formattedTotalRaces = formatItalianNumber(totalRaces);

  document.getElementById("km").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km ${formattedTotalKm} <img src="/img/Icons/traguardo.png" alt="Icona traguardo"></p>
      <p class="misuracolore">km medi per giro ${avgKmPerRace}</p>
      <p class="misuracolore">Media km per mese ${avgKmPerMonth}</p>
      <p class="misuracolore">km medi per anno ${avgKmPerYear}</p>
      <p class="misuracolore">Totale corse ${formattedTotalRaces}</p>
      <p class="misuracolore">Corse medie per mese ${avgRacesPerMonth}</p>
      <p class="misuracolore">Corse medie per anno ${avgRacesPerYear}</p>
      <p class="misuracolore">Totale anni di corsa ${formatItalianNumber(totalYears)}</p>
      <p class="misuracolore">Totale mesi di corsa ${formatItalianNumber(totalMonths)}</p>
      <span class="colore__vai-a">Vai alle statistiche complete <span class="freccia" aria-hidden="true">→</span></span>
    </div>
  `;
};

// Avvio: carica Storico.json
fetchJSON("json/Statistiche/History/Storico.json")
  .then((data) => processHistoricalData(data))
  .then((result) => {
    if (result) {
      stampaDati(
        result.totalKm,
        result.totalMonths,
        result.totalRaces,
        result.totalYears,
      );
    }
  })
  .catch((error) =>
    console.error(`Errore nel caricamento del file Storico.json: ${error}`),
  );
