// ============================================================
// data-attivita.js — Data di oggi nel piè di pagina
// Riempie ogni elemento con [data-fine-periodo] con la data
// odierna ("30/05/2026", formato gg/mm/aaaa) e si riaggiorna da solo
// allo scoccare della mezzanotte, come anno.js.
// Nessuna dipendenza.
// ============================================================

(() => {
  "use strict";

  const dataOdierna = () => {
    const elementi = document.querySelectorAll("[data-fine-periodo]");
    if (!elementi.length) return;

    // Imposta la data e programma il prossimo aggiornamento
    const impostaData = () => {
      const adesso = new Date();
      const giorno = String(adesso.getDate()).padStart(2, "0");
      const mese = String(adesso.getMonth() + 1).padStart(2, "0");
      const anno = adesso.getFullYear();
      const testo = giorno + "/" + mese + "/" + anno;

      elementi.forEach((el) => {
        el.textContent = testo;
      });

      // Calcola la prossima mezzanotte (inizio del giorno successivo)
      const prossimaMezzanotte = new Date(adesso);
      prossimaMezzanotte.setDate(adesso.getDate() + 1);
      prossimaMezzanotte.setHours(0, 0, 0, 0);
      const millisecondiMancanti = prossimaMezzanotte - adesso;

      // Schedula l'aggiornamento al prossimo scoccare delle 00:00
      setTimeout(() => {
        impostaData(); // richiama se stessa ricorsivamente
      }, millisecondiMancanti);
    };

    impostaData();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", dataOdierna);
  } else {
    dataOdierna();
  }
})();
