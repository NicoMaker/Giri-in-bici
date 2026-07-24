// ============================================================
// dati.js — Legge i JSON degli anni e calcola totali e medie
// Dipendenze: JS/utils.js (fetchJSON, formatNumber, formatPercentage)
// Richiamato da Statistiche/Js/generaleStatistiche.js
// ============================================================

window.StatGenerali = window.StatGenerali || {};

(function (SG) {
  "use strict";

  SG.fetchData = async function () {
    const mainData = await fetchJSON(
      "json/Statistiche/History/Generale.json",
    );
    if (!mainData || !mainData.statistics) {
      console.error("Main data not available or statistics field missing");
      return null;
    }

    const statistics = await Promise.all(
      Object.keys(mainData.statistics).map(async (year) => {
        const data = await fetchJSON(mainData.statistics[year]);
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
      mainData,
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
