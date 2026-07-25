// ============================================================
// dati.js — Legge i JSON degli anni e calcola totali e medie
// Dipendenze: JS/utils.js (fetchJSON, formatNumber, formatPercentage)
// Richiamato da Statistiche/statistiche-generali.js
//
// I dati vengono da json/Statistiche/History/Storico.json (campi
// "anni" e "coloriAnni"), che sostituisce il vecchio Generale.json.
// ============================================================

window.StatGenerali = window.StatGenerali || {};

(function (SG) {
  "use strict";

  SG.fetchData = async function () {
    const storico = await fetchJSON("json/Statistiche/History/Storico.json");
    if (!storico || !storico.anni) {
      console.error("Storico.json non disponibile o campo anni mancante");
      return null;
    }

    const statistics = await Promise.all(
      Object.keys(storico.anni).map(async (year) => {
        const data = await fetchJSON(storico.anni[year]);
        return data
          ? {
              year: data.year,
              km: Object.values(data.data).reduce((sum, val) => sum + val, 0),
              numberOfRaces: data.numberOfRaces,
              monthlyData: data.data,
            }
          : null;
      }),
    );

    return {
      colors: storico.coloriAnni,
      statistics: statistics.filter((d) => d !== null),
    };
  };

  SG.calculateAverages = function (statistics) {
    const totalekm = statistics.reduce((acc, cur) => acc + cur.km, 0);
    const totaleCorse = statistics.reduce(
      (acc, cur) => acc + cur.numberOfRaces,
      0,
    );
    const totalYears = statistics.length;
    const totalMonths = statistics.reduce(
      (acc, cur) => acc + Object.keys(cur.monthlyData).length,
      0,
    );

    const avgValues = statistics.map((entry) =>
      formatPercentage((entry.km / totalekm) * 100),
    );

    return {
      totalekm,
      totaleCorse,
      totalYears,
      totalMonths,
      avgkmPerRace: formatNumber(totaleCorse > 0 ? totalekm / totaleCorse : 0),
      avgkmPerYear: formatNumber(totalYears > 0 ? totalekm / totalYears : 0),
      avgkmPerMonth: formatNumber(totalMonths > 0 ? totalekm / totalMonths : 0),
      avgRacesPerYear: formatNumber(
        totalYears > 0 ? totaleCorse / totalYears : 0,
      ),
      avgRacesPerMonth: formatNumber(
        totalMonths > 0 ? totaleCorse / totalMonths : 0,
      ),
      avgValues,
    };
  };
})(window.StatGenerali);
