// ============================================================
// config-mesi.js — L'ordine dei mesi, letto una volta sola
//
// Prima questa stessa funzione era copiata dentro statistiche-totali.js,
// statistiche-mensili.js e storico-mensile.js. Ora sta qui e i tre
// file la richiamano.
//
// Dopo carica() sono disponibili:
//   ConfigMesi.ordine      { Gennaio: 1, ... Dicembre: 12 }
//   ConfigMesi.elenco      ["Gennaio", ... "Dicembre"]
//   ConfigMesi.coloriMesi  { Gennaio: "darkblue", ... }
// ============================================================

window.ConfigMesi = window.ConfigMesi || {};

(function (C) {
  "use strict";

  // Usato se il file di configurazione non si carica
  const RISERVA = {
    Gennaio: 1,
    Febbraio: 2,
    Marzo: 3,
    Aprile: 4,
    Maggio: 5,
    Giugno: 6,
    Luglio: 7,
    Agosto: 8,
    Settembre: 9,
    Ottobre: 10,
    Novembre: 11,
    Dicembre: 12,
  };

  C.ordine = {};
  C.elenco = [];
  C.coloriMesi = {};

  C.carica = async function () {
    try {
      const config = await Json.leggi(
        "json/Statistiche/History/config-mesi.json",
      );
      C.ordine = config.orderMesi;
      C.coloriMesi = config.coloriMesi || {};
    } catch (error) {
      console.error(
        "Errore nel caricamento di config-mesi.json, uso fallback:",
        error,
      );
      C.ordine = RISERVA;
      C.coloriMesi = {};
    }
    C.elenco = Object.keys(C.ordine);
    return C;
  };
})(window.ConfigMesi);
