// ============================================================
// dati.js — Somma chilometri e corse di ogni sottoperiodo
// Richiamato da JS/grafico_stagioni.js
// ============================================================

async function fetchSubPeriods(subPeriods) {
  const promises = Object.entries(subPeriods).map(([period, file]) =>
    fetchJSON(file).then((data) => {
      const totalDistance = data.reduce((acc, e) => acc + e.distance, 0);
      return { [period]: { totalDistance, numberOfRaces: data.length } };
    }),
  );
  const results = await Promise.all(promises);
  return results.reduce((acc, curr) => Object.assign(acc, curr), {});
}
