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
  },
  processSeasons = (data) => {
    let kmData = [],
      totaleCorse = 0,
      totalePeriodi = 0;

    const fetchPromises = data.seasons.flatMap((season) =>
      Object.values(season.subPeriods).map((url) =>
        fetchJSON(url).then((periodData) => {
          totaleCorse += processPeriodData(periodData, kmData);
          totalePeriodi++;
        }),
      ),
    );

    Promise.all(fetchPromises)
      .then(() => {
        const totalekm = calcolaTotalekm(kmData),
          mediakm = calcolaMediakm(totalekm, totaleCorse),
          avgPeriod = calcolaMediaPeriodo(totalekm, totalePeriodi);

        StampaDati(totalekm, mediakm, avgPeriod);
      })
      .catch((error) =>
        console.error(`Errore nel caricamento dei JSON: ${error}`),
      );
  },
  calcolaTotalekm = (kmData) => kmData.reduce((total, km) => total + km, 0),
  calcolaMediakm = (totalekm, corse) =>
    corse > 0 ? (totalekm / corse).toFixed(2) : 0,
  calcolaMediaPeriodo = (totalekm, periodi) =>
    periodi > 0 ? (totalekm / periodi).toFixed(2) : "N/A",
  StampaDati = (totalekm, mediakm, avgPeriod) =>
    (document.getElementById("km").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km ${totalekm} <img src="Icons/traguardo.png" alt="Icona traguardo"></p>
      <p class="misuracolore">km medi per giro ${mediakm}</p>
      <p class="misuracolore">Media km per Periodo ${avgPeriod} km</p>
    </div>
  `);
fetchJSON("Statistiche/Js/anni/stagioni.json")
  .then(processSeasons)
  .catch((error) =>
    console.error(`Errore nel caricamento del file principale: ${error}`),
  );
