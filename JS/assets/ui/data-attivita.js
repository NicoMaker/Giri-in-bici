// ============================================================
// data-attivita.js — Data di oggi nel piè di pagina
// Riempie ogni elemento con [data-fine-periodo] con la data
// odierna ("30 Maggio") e si riaggiorna da solo allo scoccare
// della mezzanotte, come anno.js.
// Nessuna dipendenza.
// ============================================================

(function () {
  "use strict";

  var mesi = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  function dataOdierna() {
    var elementi = document.querySelectorAll("[data-fine-periodo]");
    if (!elementi.length) return;

    // Imposta la data e programma il prossimo aggiornamento
    function impostaData() {
      var adesso = new Date();
      var giorno = String(adesso.getDate()).padStart(2, "0");
      var mese = mesi[adesso.getMonth()];
      var anno = adesso.getFullYear();
      var testo = giorno + " " + mese + " " + anno;

      elementi.forEach(function (el) {
        el.textContent = testo;
      });

      // Calcola la prossima mezzanotte (inizio del giorno successivo)
      var prossimaMezzanotte = new Date(adesso);
      prossimaMezzanotte.setDate(adesso.getDate() + 1);
      prossimaMezzanotte.setHours(0, 0, 0, 0);
      var millisecondiMancanti = prossimaMezzanotte - adesso;

      // Schedula l'aggiornamento al prossimo scoccare delle 00:00
      setTimeout(function () {
        impostaData(); // richiama se stessa ricorsivamente
      }, millisecondiMancanti);
    }

    impostaData();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", dataOdierna);
  } else {
    dataOdierna();
  }
})();
