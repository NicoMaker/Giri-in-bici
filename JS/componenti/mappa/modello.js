// modello.js — Dall'indice del sito alla "pianta" della mappa: corsie > righe > pagine.
//
// Home a sinistra · una corsia per gruppo (Stagioni, Statistiche, ...) ·
// in ogni riga una pagina capofila e, accanto, le sue pagine figlie (anni e periodi).

import { GRUPPI } from "../sito/gruppi.js";
import { chiave } from "../sito/percorsi.js";

export const CHIAVE_HOME = "/giri.html";

export const costruisciModello = (indice) => {
  const note = new Map(indice.pagine.map((p) => [chiave(p.url), p]));
  const figli = new Map();
  const radici = [];
  let home = null;

  indice.pagine.forEach((p) => {
    const k = chiave(p.url);
    if (k === CHIAVE_HOME) {
      home = p;
      return;
    }
    const padre = p.padre ? chiave(p.padre) : "";
    if (padre && padre !== CHIAVE_HOME && note.has(padre)) figli.set(padre, [...(figli.get(padre) || []), p]);
    else radici.push(p);
  });

  const corsie = GRUPPI.map((gruppo) => ({
    gruppo,
    righe: radici
      .filter((p) => (p.gruppo || "altro") === gruppo.id)
      .map((hub) => ({ hub, figli: figli.get(chiave(hub.url)) || [] })),
  })).filter((c) => c.righe.length);

  const colori = Object.fromEntries(GRUPPI.map((g) => [g.id, g.colore]));
  return { home, corsie, note, colori };
};

// Archi "di struttura": Home -> capofila, capofila -> cornice che raggruppa le figlie
export const archiStruttura = (modello) => {
  const archi = [];
  modello.corsie.forEach((c) =>
    c.righe.forEach(({ hub, figli }) => {
      if (modello.home) archi.push([CHIAVE_HOME, chiave(hub.url)]);
      if (figli.length) archi.push([chiave(hub.url), `figli:${chiave(hub.url)}`]);
    }),
  );
  return archi;
};
