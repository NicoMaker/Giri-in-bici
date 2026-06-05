// Calcolo_km_totali.js
// Dipendenze: JS/utils.js (caricato prima in HTML)

const processPeriodData = (periodData) => {
  if (Array.isArray(periodData)) {
    const kmValues = periodData
      .map((entry) => entry.distance)
      .filter((km) => typeof km === "number");
    return { kmValues, corse: periodData.length };
  } else {
    console.error("Formato JSON non valido: il dato non è un array.");
    return { kmValues: [], corse: 0 };
  }
};

const processSeasons = (data) => {
  if (!data.seasons || !Array.isArray(data.seasons)) {
    console.error("Dati stagionali (seasons) non trovati o non validi.");
    return;
  }

  const fetchPromises = data.seasons.flatMap((season) =>
    Object.values(season.subPeriods || {}).map((url) =>
      fetchJSON(url)
        .then((periodData) => {
          const { kmValues, corse } = processPeriodData(periodData);
          return { kmValues, corse, periodi: 1 };
        })
        .catch((error) => {
          console.error(`Errore nel fetch di un periodo: ${url} - ${error}`);
          return null;
        }),
    ),
  );

  Promise.all(fetchPromises)
    .then((results) => {
      const validResults = results.filter((r) => r !== null);
      const allKmValues = validResults.flatMap((r) => r.kmValues);
      const totaleCorse = validResults.reduce((acc, r) => acc + r.corse, 0);
      const totalePeriodi = validResults.reduce((acc, r) => acc + r.periodi, 0);

      const totalekm = allKmValues.reduce((total, km) => total + km, 0);
      const mediakm =
        totaleCorse > 0 ? formatNumber(totalekm / totaleCorse) : "0";
      const avgPeriod =
        totalePeriodi > 0 ? formatNumber(totalekm / totalePeriodi) : "N/A";

      stampaDati(totalekm, mediakm, avgPeriod, totaleCorse, totalePeriodi);
    })
    .catch((error) =>
      console.error(`Errore generale nel Promise.all dei JSON: ${error}`),
    );
};

const stampaDati = (totalekm, mediakm, avgPeriod, totaleCorse, totalePeriodi) => {
  const mediaCorsePerPeriodo =
    totalePeriodi > 0 ? formatNumber(totaleCorse / totalePeriodi) : "N/A";
  const mediaCorsePerStagione =
    totaleCorse > 0 ? formatNumber(totaleCorse / 3) : "N/A";

  const formattedTotaleKm = formatItalianNumber(totalekm);
  const formattedTotaleCorse = formatItalianNumber(totaleCorse);

  document.getElementById("km").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km ${formattedTotaleKm} <img src="Icons/traguardo.png" alt="Icona traguardo"></p>
      <p class="misuracolore">km medi per giro ${mediakm}</p>
      <p class="misuracolore">Media km per Periodo ${avgPeriod} km</p>
      <p class="misuracolore">Totale corse ${formattedTotaleCorse}</p>
      <p class="misuracolore">Media corse per periodo ${mediaCorsePerPeriodo}</p>
      <p class="misuracolore">Media corse per Stagione ${mediaCorsePerStagione}</p>
      <p class="misuracolore">Totale periodi ${totalePeriodi}</p>
    </div>
  `;
};

fetchJSON("Statistiche/Js/anni/stagioni/stagioni.json")
  .then(processSeasons)
  .catch((error) =>
    console.error(`Errore nel caricamento del file principale: ${error}`),
  );
