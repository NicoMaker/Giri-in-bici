"use strict";

// Elenco (sola lettura): anni di Statistiche e giri di ogni stagione.
// Lo usa il server web (leggiElenco).

const {
  MESI,
  PERCORSO_STORICO_JSON,
  STAGIONI,
} = require("../base/impostazioni");
const { leggiJson, ordinaPeriodi } = require("../base/utilita");

const testoLuogo = (place) =>
  String(place)
    .replace(/<[^>]*>/g, "")
    .trim();

const linkLuogo = (place) =>
  (String(place).match(/href="([^"]+)"/) || [])[1] || "";

const somma = (lista, campo) =>
  lista.reduce((t, x) => t + (Number(x[campo]) || 0), 0);

const leggiElenco = (piano) => {
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const anni = Object.keys(storico.anni)
    .sort(ordinaPeriodi)
    .map((anno, i) => {
      const j = leggiJson(piano, storico.anni[anno]);
      const mesi = MESI.filter((m) => m in j.data).map((mese) => ({
        mese,
        km: Number(j.data[mese]) || 0,
      }));
      return {
        anno,
        colore: (storico.coloriAnni || [])[i] || null,
        corse: Number(j.numberOfRaces) || 0,
        mesi,
        km: somma(mesi, "km"),
      };
    });

  const stagioni = Object.entries(STAGIONI).map(([chiave, s]) => {
    const g = leggiJson(piano, `json/${s.cartella}/generale.json`);
    const periodi = Object.keys(g.subPeriods)
      .sort(ordinaPeriodi)
      .map((periodo, i) => {
        const giri = leggiJson(piano, g.subPeriods[periodo]).map((x) => ({
          data: x.date,
          luogo: testoLuogo(x.place),
          link: linkLuogo(x.place),
          km: Number(x.distance) || 0,
        }));
        return {
          periodo,
          colore: (g.colors || [])[i] || null,
          giri,
          km: somma(giri, "km"),
        };
      });
    return {
      chiave,
      etichetta: s.etichetta,
      testo: s.testo,
      formato: s.formato,
      periodi,
    };
  });
  return { anni, stagioni };
};

module.exports = { leggiElenco };
