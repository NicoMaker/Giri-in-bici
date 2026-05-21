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
          }),
      ),
    );

    Promise.all(fetchPromises)
      .then((results) => {
        const validResults = results.filter((r) => r !== null);

        // Somma tutti i risultati in modo sicuro
        const allKmValues = validResults.flatMap((r) => r.kmValues);
        const totaleCorse = validResults.reduce((acc, r) => acc + r.corse, 0);
        const totalePeriodi = validResults.reduce(
          (acc, r) => acc + r.periodi,
          0,
        );

        const totalekm = calcolaTotalekm(allKmValues);
        const mediakm = calcolaMediakm(totalekm, totaleCorse);
        const avgPeriod = calcolaMediaPeriodo(totalekm, totalePeriodi);

        StampaDati(totalekm, mediakm, avgPeriod, totaleCorse, totalePeriodi);
      })
      .catch((error) =>
        console.error(`Errore generale nel Promise.all dei JSON: ${error}`),
      );
  },
  calcolaTotalekm = (kmData) => kmData.reduce((total, km) => total + km, 0),
  formatoCondizionale = (valore) => {
    // Always show 2 decimal places for tables
    return formatItalianNumber(valore, true);
  },
  formatItalianNumber = (num, forceDecimals = false) => {
    if (typeof num === "string") {
      num = parseFloat(num);
    }
    if (isNaN(num)) return "0";

    // For tables, always show 2 decimal places
    let decimalString = "";
    if (forceDecimals || !Number.isInteger(num)) {
      const decimalPart = num.toFixed(2).split(".")[1];
      // Only add decimal part if it's not "00"
      if (decimalPart !== "00") {
        decimalString = "," + decimalPart;
      }
    }

    // Handle decimal part - use comma for Italian format
    const parts = num.toString().split(".");
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
      integerPart = groups.join(".");
    }

    return integerPart + decimalString;
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
      totalePeriodi > 0
        ? formatoCondizionale(totaleCorse / totalePeriodi)
        : "N/A";
    const mediaCorsePerStagione =
      formatoCondizionale(totaleCorse / 3) == 0
        ? "N/A"
        : formatoCondizionale(totaleCorse / 3);

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
