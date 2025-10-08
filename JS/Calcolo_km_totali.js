const fetchJSON = (url) =>
    fetch(url).then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    }),
  processPeriodData = (periodData, kmData) => {
    if (Array.isArray(periodData)) {
      // Filtra solo i numeri validi, anche se distance dovrebbe essere sempre un numero
      const kmValues = periodData.map((entry) => entry.distance).filter(km => typeof km === 'number');
      kmData.push(...kmValues);
      return periodData.length;
    } else {
      console.error("Formato JSON non valido: il dato non è un array.");
      return 0;
    }
  },
  processSeasons = (data) => {
    let kmData = [],
      totaleCorse = 0,
      totalePeriodi = 0;

    // Assicurati che 'data.seasons' sia un array valido
    if (!data.seasons || !Array.isArray(data.seasons)) {
        console.error("Dati stagionali (seasons) non trovati o non validi.");
        return;
    }

    const fetchPromises = data.seasons.flatMap((season) =>
      // Assicurati che 'season.subPeriods' esista
      Object.values(season.subPeriods || {}).map((url) =>
        fetchJSON(url).then((periodData) => {
          totaleCorse += processPeriodData(periodData, kmData);
          totalePeriodi++;
        }).catch(error => {
            console.error(`Errore nel fetch di un periodo: ${url} - ${error}`);
            // Non bloccare Promise.all se un periodo fallisce, ma registra l'errore.
        }),
      ),
    );

    Promise.all(fetchPromises)
      .then(() => {
        const totalekm = calcolaTotalekm(kmData);
        // NOTA: Passiamo il totale grezzo e le corse/periodi, la formattazione è nelle funzioni
        const mediakm = calcolaMediakm(totalekm, totaleCorse);
        const avgPeriod = calcolaMediaPeriodo(totalekm, totalePeriodi);

        StampaDati(totalekm, mediakm, avgPeriod);
      })
      .catch((error) =>
        console.error(`Errore generale nel Promise.all dei JSON: ${error}`),
      );
  },
  calcolaTotalekm = (kmData) => kmData.reduce((total, km) => total + km, 0),

  // ---------------- MODIFICHE QUI ----------------

  formatoCondizionale = (valore) => {
    // Controlla se il valore è un intero
    if (Number.isInteger(valore)) {
      // Se è intero (es. 10.0), restituisce il numero intero
      return valore.toString();
    } else {
      // Altrimenti, restituisce con due cifre decimali (es. 10.33)
      return valore.toFixed(2);
    }
  },

  calcolaMediakm = (totalekm, corse) => {
    if (corse > 0) {
      const media = totalekm / corse;
      return formatoCondizionale(media);
    }
    return '0'; // Se non ci sono corse, restituisce '0'
  },

  calcolaMediaPeriodo = (totalekm, periodi) => {
    if (periodi > 0) {
      const media = totalekm / periodi;
      return formatoCondizionale(media);
    }
    return "N/A"; // Se non ci sono periodi, restituisce 'N/A'
  },
  // ---------------- FINE MODIFICHE ----------------

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