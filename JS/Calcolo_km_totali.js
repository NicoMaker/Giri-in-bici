const fetchJSON = (url) =>
    fetch(url).then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    }),
  processPeriodData = (periodData, kmData) => {
    if (Array.isArray(periodData)) {
      const kmValues = periodData
        .map((entry) => entry.distance)
        .filter((km) => typeof km === "number");
      kmData.push(...kmValues);
      return periodData.length; // Numero di corse in questo periodo
    } else {
      console.error("Formato JSON non valido: il dato non è un array.");
      return 0;
    }
  },
  processSeasons = (data) => {
    let kmData = [],
      totaleCorse = 0,
      totalePeriodi = 0;

    if (!data.seasons || !Array.isArray(data.seasons)) {
      console.error("Dati stagionali (seasons) non trovati o non validi.");
      return;
    }

    const fetchPromises = data.seasons.flatMap((season) =>
      Object.values(season.subPeriods || {}).map((url) =>
        fetchJSON(url)
          .then((periodData) => {
            totaleCorse += processPeriodData(periodData, kmData);
            totalePeriodi++;
          })
          .catch((error) => {
            console.error(`Errore nel fetch di un periodo: ${url} - ${error}`);
          }),
      ),
    );

    Promise.all(fetchPromises)
      .then(() => {
        const totalekm = calcolaTotalekm(kmData);
        const mediakm = calcolaMediakm(totalekm, totaleCorse);
        const avgPeriod = calcolaMediaPeriodo(totalekm, totalePeriodi);

        // ✅ FIX: Passa totaleCorse come parametro
        StampaDati(totalekm, mediakm, avgPeriod, totaleCorse);
      })
      .catch((error) =>
        console.error(`Errore generale nel Promise.all dei JSON: ${error}`),
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
  // ✅ FIX: Aggiungi totaleCorse come parametro
  StampaDati = (totalekm, mediakm, avgPeriod, totaleCorse) =>
    (document.getElementById("km").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km ${totalekm} <img src="Icons/traguardo.png" alt="Icona traguardo"></p>
      <p class="misuracolore">km medi per giro ${mediakm}</p>
      <p class="misuracolore">Media km per Periodo ${avgPeriod} km</p>
      <p class="misuracolore">Totale corse ${totaleCorse}</p>
    </div>
  `);

fetchJSON("Statistiche/Js/anni/stagioni.json")
  .then(processSeasons)
  .catch((error) =>
    console.error(`Errore nel caricamento del file principale: ${error}`),
  );
