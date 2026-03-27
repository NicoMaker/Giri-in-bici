const fetchJSON = (url) =>
  fetch(url).then((response) => {
    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }),

processPeriodData = (periodData) => {
  if (Array.isArray(periodData)) {
    const kmValues = periodData
      .map((entry) => entry.distance)
      .filter((km) => typeof km === "number");
    return { kmValues, corse: periodData.length };
  } else {
    console.error("Formato JSON non valido: il dato non è un array.");
    return { kmValues: [], corse: 0 };
  }
},

processSeasons = (data) => {
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
        })
    )
  );

  Promise.all(fetchPromises)
    .then((results) => {
      const validResults = results.filter((r) => r !== null);

      // Somma tutti i risultati in modo sicuro
      const allKmValues = validResults.flatMap((r) => r.kmValues);
      const totaleCorse = validResults.reduce((acc, r) => acc + r.corse, 0);
      const totalePeriodi = validResults.reduce((acc, r) => acc + r.periodi, 0);

      const totalekm = calcolaTotalekm(allKmValues);
      const mediakm = calcolaMediakm(totalekm, totaleCorse);
      const avgPeriod = calcolaMediaPeriodo(totalekm, totalePeriodi);

      StampaDati(totalekm, mediakm, avgPeriod, totaleCorse, totalePeriodi);
    })
    .catch((error) =>
      console.error(`Errore generale nel Promise.all dei JSON: ${error}`)
    );
},

calcolaTotalekm = (kmData) => kmData.reduce((total, km) => total + km, 0),

formatoCondizionale = (valore) => {
  if (Number.isInteger(valore)) {
    return valore.toString();
  } else {
    return valore.toFixed(2);
  }
},

calcolaMediakm = (totalekm, corse) => {
  if (corse > 0) {
    const media = totalekm / corse;
    return formatoCondizionale(media);
  }
  return "0";
},

calcolaMediaPeriodo = (totalekm, periodi) => {
  if (periodi > 0) {
    const media = totalekm / periodi;
    return formatoCondizionale(media);
  }
  return "N/A";
},

StampaDati = (totalekm, mediakm, avgPeriod, totaleCorse, totalePeriodi) => {
  const mediaCorsePerPeriodo =
    totalePeriodi > 0 ? formatoCondizionale(totaleCorse / totalePeriodi) : "N/A";
  const mediaCorsePerStagione =
    formatoCondizionale(totaleCorse / 3) == 0
      ? "N/A"
      : formatoCondizionale(totaleCorse / 3);

  document.getElementById("km").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km ${totalekm} <img src="Icons/traguardo.png" alt="Icona traguardo"></p>
      <p class="misuracolore">km medi per giro ${mediakm}</p>
      <p class="misuracolore">Media km per Periodo ${avgPeriod} km</p>
      <p class="misuracolore">Totale corse ${totaleCorse}</p>
      <p class="misuracolore">Media corse per periodo ${mediaCorsePerPeriodo}</p>
      <p class="misuracolore">Media corse per Stagione ${mediaCorsePerStagione}</p>
    </div>
  `;
};

fetchJSON("Statistiche/Js/anni/stagioni/stagioni.json")
  .then(processSeasons)
  .catch((error) =>
    console.error(`Errore nel caricamento del file principale: ${error}`)
  );