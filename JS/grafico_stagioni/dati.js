// ============================================================
// dati.js — Somma chilometri e corse di ogni sottoperiodo
// Richiamato da JS/grafico_stagioni.js
// ============================================================

async function fetchSubPeriods(subPeriods) {
  const promises = Object.entries(subPeriods).map(([period, file]) =>
    fetchJSON(file).then((data) => {
      const totalDistance = data.reduce((acc, e) => acc + e.distance, 0);
      // "tappe" tiene anche le uscite vere e proprie (data/luogo/km),
      // non solo il totale: serve a "tappe più lunghe" qui sotto per
      // mettere a confronto le uscite di tutti gli anni insieme,
      // senza dover richiedere di nuovo gli stessi file.
      return {
        [period]: { totalDistance, numberOfRaces: data.length, tappe: data },
      };
    }),
  );
  const results = await Promise.all(promises);
  return results.reduce((acc, curr) => Object.assign(acc, curr), {});
}
