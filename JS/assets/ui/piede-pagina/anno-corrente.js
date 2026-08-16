// ============================================================
// anno.js — Anno corrente nel piè di pagina
// Riempie ogni elemento con [data-anno] e si riaggiorna da solo
// allo scoccare della mezzanotte.
// Nessuna dipendenza.
// ============================================================

(function () {
  "use strict";

  function annoCorrente() {
    var elementi = document.querySelectorAll("[data-anno]");
    if (!elementi.length) return;

    // Imposta l'anno e programma il prossimo aggiornamento
    function impostaAnno() {
      var adesso = new Date();
      var anno = adesso.getFullYear();
      elementi.forEach(function (el) {
        el.textContent = anno;
      });

      // Calcola il prossimo mezzanotte (inizio del giorno successivo)
      var prossimaMezzanotte = new Date(adesso);
      prossimaMezzanotte.setDate(adesso.getDate() + 1);
      prossimaMezzanotte.setHours(0, 0, 0, 0);
      var millisecondiMancanti = prossimaMezzanotte - adesso;

      // Schedula l'aggiornamento al prossimo scoccare delle 00:00
      setTimeout(function () {
        impostaAnno(); // richiama se stesso ricorsivamente
      }, millisecondiMancanti);
    }

    impostaAnno();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", annoCorrente);
  } else {
    annoCorrente();
  }
})();
