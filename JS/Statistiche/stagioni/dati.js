// ============================================================
// dati.js — Caricamento e calcolo dei dati delle stagioni
//
// Legge i file JSON, somma i chilometri, conta le corse e calcola
// medie e percentuali. Non tocca mai la pagina: restituisce numeri.
//
// Dipendenze: JS/json.js, JS/utils.js (formatNumber)
// ============================================================

window.Stagioni = window.Stagioni || {};

(function (S) {
  "use strict";

  // Riempite da caricaConfigurazione(), lette da schede.js e grafici.js
  S.SEASONS_CONFIG = [];
  S.CHART_CONFIG = {};

  // Un pezzo mancante non deve fermare la pagina: se un file non
  // arriva si va avanti con gli altri.
  S.loadJSON = Json.leggiOppureNull;

  S.initializeConfiguration = async function (jsonFilePath) {
    const config = await S.loadJSON(jsonFilePath);
    if (config) {
      S.SEASONS_CONFIG = config.seasons;
      S.CHART_CONFIG = config.chart;
    }
  };

  S.sumData = (data) => {
    if (!Array.isArray(data)) return 0;
    return data.reduce((total, km) => total + (km.distance || 0), 0);
  };

  S.countRaces = (data) => (Array.isArray(data) ? data.length : 0);

  S.calculateData = function (
    primaveraData,
    estateData,
    autunnoInvernoData,
    numPeriodi,
  ) {
    const primavera = S.sumData(primaveraData);
    const estate = S.sumData(estateData);
    const autunno_inverno = S.sumData(autunnoInvernoData);
    const corsep = S.countRaces(primaveraData);
    const corsee = S.countRaces(estateData);
    const corseai = S.countRaces(autunnoInvernoData);
    const corseTotale = corsep + corsee + corseai;
    const totale = primavera + estate + autunno_inverno;
    const totalePeriodi =
      numPeriodi.primavera + numPeriodi.estate + numPeriodi.autunno_inverno;

    return {
      p: primavera,
      e: estate,
      ai: autunno_inverno,
      corsep,
      corsee,
      corseai,
      corseTotale,
      totale,
      totalePeriodi,
      avgp: totale > 0 ? (primavera / totale) * 100 : 0,
      avge: totale > 0 ? (estate / totale) * 100 : 0,
      avgai: totale > 0 ? (autunno_inverno / totale) * 100 : 0,
      avgmediastagione: formatNumber(totale / 3),
      avgperiod: totalePeriodi > 0 ? formatNumber(totale / totalePeriodi) : "0",
    };
  };
})(window.Stagioni);
