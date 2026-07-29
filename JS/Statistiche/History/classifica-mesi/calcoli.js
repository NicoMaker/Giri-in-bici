// ============================================================
// calcoli.js — Somma i chilometri di ogni mese su tutti gli anni
// e li ordina dal più pedalato al meno pedalato.
// Dipendenze: History/comune/config-mesi.js
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  // Una riga per mese: { mese, km, occorrenze, kmMedi, percentuale }
  // occorrenze = in quanti anni diversi si è pedalato in quel mese.
  // kmMedi = km medi nelle sole volte in cui quel mese è stato pedalato.
  CM.calcolaClassifica = function (allData, mesiElenco) {
    const chilometri = new Array(mesiElenco.length).fill(0);
    const occorrenze = new Array(mesiElenco.length).fill(0);

    allData.forEach((json) => {
      if (!json || !json.data) return;
      mesiElenco.forEach((mese, index) => {
        if (json.data[mese]) {
          chilometri[index] += json.data[mese];
          occorrenze[index] += 1;
        }
      });
    });

    const totale = chilometri.reduce((acc, km) => acc + km, 0);

    const righe = mesiElenco.map((mese, index) => ({
      mese,
      km: chilometri[index],
      occorrenze: occorrenze[index],
      kmMedi:
        occorrenze[index] > 0 ? chilometri[index] / occorrenze[index] : 0,
      percentuale: totale > 0 ? (chilometri[index] / totale) * 100 : 0,
    }));

    righe.sort((a, b) => b.km - a.km);

    return { righe, totale };
  };
})(window.ClassificaMesi);
