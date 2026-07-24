// ============================================================
// config-mesi.js — L'ordine dei mesi, letto una volta sola
//
// Prima questa stessa funzione era copiata dentro GraficoTotale.js,
// GraficoTotaleMensile.js e StoricoMensile.js. Ora sta qui e i tre
// file la richiamano.
//
// Dopo carica() sono disponibili:
//   ConfigMesi.ordine  { Gennaio: 1, ... Dicembre: 12 }
//   ConfigMesi.elenco  ["Gennaio", ... "Dicembre"]
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

  C.carica = async function () {
    try {
      const response = await fetch("../Js/History/JSON/config-mesi.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const config = await response.json();
      C.ordine = config.orderMesi;
    } catch (error) {
      console.error(
        "Errore nel caricamento di config-mesi.json, uso fallback:",
        error,
      );
      C.ordine = RISERVA;
    }
    C.elenco = Object.keys(C.ordine);
    return C;
  };
})(window.ConfigMesi);
