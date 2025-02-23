const fetchJSON = (url) => fetch(url).then((response) => response.json()),
  processPeriodData = (periodData, kmData) => {
    if (Array.isArray(periodData)) {
      const kmValues = periodData.map((entry) => entry.distance);
      kmData.push(...kmValues);
      return periodData.length;
    } else {
      console.error("Formato JSON non valido");
      return 0;
    }
  };

const processSeasons = (data) => {
  let kmData = [],
    totaleCorse = 0,
    totalePeriodi = 0;

  const fetchPromises = data.seasons.flatMap((season) =>
    Object.values(season.subPeriods).map((url) =>
      fetchJSON(url).then((periodData) => {
        totaleCorse += processPeriodData(periodData, kmData);
        totalePeriodi++;
      })
    )
  );

  Promise.all(fetchPromises)
    .then(() => {
      const totaleKm = calcolaTotaleKm(kmData),
        mediaKm = calcolaMediaKm(totaleKm, totaleCorse),
        avgPeriod = calcolaMediaPeriodo(totaleKm, totalePeriodi);

      StampaDati(totaleKm, mediaKm, avgPeriod);
    })
    .catch((error) =>
      console.error(`Errore nel caricamento dei JSON: ${error}`)
    );
};

const calcolaTotaleKm = (kmData) => kmData.reduce((total, km) => total + km, 0),
  calcolaMediaKm = (totaleKm, corse) =>
    corse > 0 ? (totaleKm / corse).toFixed(2) : 0,
  calcolaMediaPeriodo = (totaleKm, periodi) =>
    periodi > 0 ? (totaleKm / periodi).toFixed(2) : "N/A",
  StampaDati = (totaleKm, mediaKm, avgPeriod) => {
    document.getElementById("km").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km ${totaleKm} <img src="Icons/traguardo.png" alt="Icona traguardo"></p>
      <p class="misuracolore">Km medi per corsa ${mediaKm}</p>
      <p class="misuracolore">Media km per Periodo ${avgPeriod} km</p>
    </div>
  `;
  };

fetchJSON("Statistiche/Js/anni/stagioni.json")
  .then(processSeasons)
  .catch((error) =>
    console.error(`Errore nel caricamento del file principale: ${error}`)
  );
