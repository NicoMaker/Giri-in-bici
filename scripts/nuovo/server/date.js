"use strict";

const parseData = (testo) => {
  const valore = String(testo || "").trim();
  const italiana = valore.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const iso = valore.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!italiana && !iso)
    throw new Error("Scrivi la data nel formato gg/mm/aaaa.");
  const [giorno, mese, anno] = italiana
    ? italiana.slice(1).map(Number)
    : [Number(iso[3]), Number(iso[2]), Number(iso[1])];
  const d = new Date(Date.UTC(anno, mese - 1, giorno));
  if (
    d.getUTCFullYear() !== anno ||
    d.getUTCMonth() !== mese - 1 ||
    d.getUTCDate() !== giorno
  )
    throw new Error("La data inserita non esiste.");
  return { anno, mese: mese - 1, giorno };
};

module.exports = { parseData };
