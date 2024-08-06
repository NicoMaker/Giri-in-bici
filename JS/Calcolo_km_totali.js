fetch("Statistiche/Js/History/JSON/GraficoTotale.json")
  .then((response) => response.json())
  .then((data) => {
    const { kmData, corse } = data,
      totaleKm = calcolaTotaleKm(kmData),
      mediaKm = calcolaMediaKm(totaleKm, corse);
    StampaDati(totaleKm, mediaKm);
  })
  .catch((error) => console.error("Errore nel caricamento del JSON:", error));

const calcolaTotaleKm = (kmData) =>
    Object.values(kmData).reduce((total, km) => total + km, 0),
  calcolaMediaKm = (totaleKm, corse) => (totaleKm / corse).toFixed(2),
  StampaDati = (totaleKm, mediaKm) =>
    (document.getElementById("km").innerHTML = `
      <div class="colore">
        <p class="misuracolore">Totale km ${totaleKm} <img src="Icons/traguardo.png" alt="Icona traguardo"></p>
        <p class="misuracolore">Km medi per giro percorsi ${mediaKm}</p>
      </div>
    `);