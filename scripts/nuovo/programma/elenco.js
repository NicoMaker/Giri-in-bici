"use strict";

// Elenco (sola lettura): anni di Statistiche e giri di ogni stagione.
// Lo usano sia il terminale (stampaElenco) sia il server web (leggiElenco).

const {
  MESI,
  PERCORSO_STORICO_JSON,
  STAGIONI,
} = require("../base/impostazioni");
const {
  chiediValido,
  grassetto,
  grigio,
  scegli,
} = require("../base/terminale");
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

// Terminale: scegli cosa vedere e stampa.
const mostraElenco = async (piano) => {
  const e = leggiElenco(piano);
  const cosa = await scegli("Cosa vuoi vedere?", [
    { tasto: 1, testo: "Anni di Statistiche (mesi, km, corse)" },
    { tasto: 2, testo: "Giri di una stagione" },
  ]);
  if (cosa.tasto === 1) {
    console.log("");
    e.anni.forEach((a) => {
      console.log(
        `${grassetto(a.anno)}  ${a.km} km · ${a.corse} corse ${grigio(`(${a.colore || "senza colore"})`)}`,
      );
      console.log(
        grigio(`   ${a.mesi.map((m) => `${m.mese} ${m.km}`).join(" · ")}`),
      );
    });
    return;
  }
  const s = (
    await scegli(
      "Quale stagione?",
      e.stagioni.map((x) => ({ chiave: x.chiave, testo: x.etichetta })),
    )
  ).chiave;
  const stagione = e.stagioni.find((x) => x.chiave === s);
  const nomi = stagione.periodi.map((p) => p.periodo);
  const nome = await chiediValido(
    `Periodo (${nomi.join(", ")})`,
    nomi[nomi.length - 1],
    (v) => (nomi.includes(v) ? null : `Scegli tra: ${nomi.join(", ")}.`),
  );
  const p = stagione.periodi.find((x) => x.periodo === nome);
  console.log(
    `\n${grassetto(`${stagione.testo} ${p.periodo}`)}  ${p.giri.length} giri · ${p.km} km\n`,
  );
  p.giri.forEach((g, i) =>
    console.log(
      `  ${String(i + 1).padStart(2)}. ${g.data.padEnd(12)} ${String(g.km).padStart(4)} km  ${g.luogo}${g.link ? grigio("  🔗") : ""}`,
    ),
  );
};

module.exports = { leggiElenco, mostraElenco };
