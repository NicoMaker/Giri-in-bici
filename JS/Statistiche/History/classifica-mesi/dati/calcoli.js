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
      kmMedi: occorrenze[index] > 0 ? chilometri[index] / occorrenze[index] : 0,
      percentuale: totale > 0 ? (chilometri[index] / totale) * 100 : 0,
    }));

    righe.sort((a, b) => b.km - a.km);

    return { righe, totale };
  };

  // Una riga per OGNI mese di OGNI anno, senza aggregare per nome
  // mese: "Settembre 2024", "Ottobre 2025", ecc. Così si vede quale
  // singolo mese, in quale anno preciso, ha totalizzato più
  // chilometri di tutti — un vero e proprio record per record.
  CM.calcolaRecordMesi = function (allData, mesiElenco) {
    const righe = [];

    allData.forEach((json) => {
      if (!json || !json.data) return;
      const anno = json.year || "Sconosciuto";
      mesiElenco.forEach((mese) => {
        if (json.data[mese]) {
          righe.push({
            nome: `${mese} ${anno}`,
            mese,
            anno,
            km: json.data[mese],
          });
        }
      });
    });

    const totale = righe.reduce((tot, r) => tot + r.km, 0);
    righe.forEach((r) => {
      r.percentuale = totale > 0 ? (r.km / totale) * 100 : 0;
    });

    righe.sort((a, b) => b.km - a.km);

    return { righe, totale };
  };

  // Una riga per OGNI ANNO INTERO (2020, 2021, ecc.), non per mese:
  // qui si confronta un anno intero con un altro, non un mese con un
  // altro mese. Ogni riga somma tutti i mesi presenti in quell'anno.
  // corse = numberOfRaces dell'anno (json/Statistiche/anni/<anno>.json).
  // kmMedi = km medi per singola corsa in quell'anno (km / corse).
  CM.calcolaAnni = function (allData) {
    const righe = allData
      .filter((json) => json && json.data)
      .map((json) => {
        const km = Object.values(json.data).reduce(
          (tot, valore) => tot + (valore || 0),
          0,
        );
        const corse =
          typeof json.numberOfRaces === "number" ? json.numberOfRaces : 0;
        const kmMedi = corse > 0 ? km / corse : 0;
        return { nome: `${json.year}`, anno: json.year, km, corse, kmMedi };
      });

    const totale = righe.reduce((tot, r) => tot + r.km, 0);
    righe.forEach((r) => {
      r.percentuale = totale > 0 ? (r.km / totale) * 100 : 0;
    });

    righe.sort((a, b) => b.km - a.km);

    return { righe, totale };
  };
})(window.ClassificaMesi);
