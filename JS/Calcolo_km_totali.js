fetch("Statistiche/Js/History/JSON/Generale.json")
  .then((response) => response.json())
  .then((data) => {
    let kmData = [],
      totaleCorse = 0;

    const { statistics } = data,
      fetchPromises = Object.values(statistics).map((url) =>
        fetch(url)
          .then((response) => response.json())
          .then((annoData) => {
            if (annoData.data && typeof annoData.data === "object") {
              const kmValues = Object.values(annoData.data);
              kmData = [...kmData, ...kmValues];
            } else
              console.error(
                `Dati dei chilometri mancanti o non validi in: ${url}`
              );
            if (typeof annoData.numberOfRaces === "number")
              totaleCorse += annoData.numberOfRaces;
            else
              console.error(`numberOfRaces non è un numero valido in: ${url}`);
          })
      );

    Promise.all(fetchPromises)
      .then(() => {
        const totaleKm = calcolaTotaleKm(kmData),
          mediaKm = calcolaMediaKm(totaleKm, totaleCorse);

        StampaDati(totaleKm, mediaKm);
      })
      .catch((error) =>
        console.error("Errore nel caricamento dei file JSON:", error)
      );
  })
  .catch((error) =>
    console.error("Errore nel caricamento del file principale:", error)
  );

const calcolaTotaleKm = (kmData) => kmData.reduce((total, km) => total + km, 0),
  calcolaMediaKm = (totaleKm, corse) =>
    corse > 0 ? (totaleKm / corse).toFixed(2) : 0,
  StampaDati = (totaleKm, mediaKm) => {
    document.getElementById("km").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km ${totaleKm} <img src="Icons/traguardo.png" alt="Icona traguardo"></p>
      <p class="misuracolore">Km medi per corsa ${mediaKm}</p>
    </div>
  `;
  };
