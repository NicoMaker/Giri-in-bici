// ============================================================
// anno.js — Anno corrente nel piè di pagina
// Riempie ogni elemento con [data-anno] e si riaggiorna da solo
// allo scoccare della mezzanotte.
// Nessuna dipendenza.
// ============================================================

(() => {
  "use strict";
  const annoCorrente = () => {
    const elementi = document.querySelectorAll("[data-anno]");
    if (!elementi.length) return;

    // Imposta l'anno e programma il prossimo aggiornamento
    const impostaAnno = () => {
      const adesso = new Date();
      const anno = adesso.getFullYear();
      elementi.forEach((el) => {
        el.textContent = anno;
      });

      // Calcola il prossimo mezzanotte (inizio del giorno successivo)
      const prossimaMezzanotte = new Date(adesso);
      prossimaMezzanotte.setDate(adesso.getDate() + 1);
      prossimaMezzanotte.setHours(0, 0, 0, 0);
      const millisecondiMancanti = prossimaMezzanotte - adesso;

      // Schedula l'aggiornamento al prossimo scoccare delle 00:00
      setTimeout(() => {
        impostaAnno(); // richiama se stesso ricorsivamente
      }, millisecondiMancanti);
    };

    impostaAnno();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", annoCorrente);
  } else {
    annoCorrente();
  }
})();
