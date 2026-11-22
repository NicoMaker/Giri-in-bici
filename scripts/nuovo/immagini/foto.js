"use strict";

// Foto: cartella Img, percorsi trascinati nel terminale ed elenco delle foto .jpg.

const fs = require("fs");
const path = require("path");
const { RADICE } = require("../base/impostazioni");

// La cartella delle immagini può chiamarsi Img o img (dipende dal sistema).
const cartellaImg = () => {
  try {
    const trovata = fs.readdirSync(RADICE, { withFileTypes: true }).find((d) => d.isDirectory() && /^img$/i.test(d.name));
    return trovata ? trovata.name : "Img";
  } catch {
    return "Img";
  }
};

// Pulisce un percorso trascinato/incollato nel terminale (virgolette, ~, spazi con "\").
const pulisciPercorso = (v) => {
  let t = v.trim().replace(/^file:\/\//, "");
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) t = t.slice(1, -1);
  t = t.replace(/\\ /g, " ");
  if (t.startsWith("~")) t = path.join(process.env.HOME || process.env.USERPROFILE || "", t.slice(1));
  return path.resolve(t);
};

const ordineNaturale = (a, b) => a.localeCompare(b, "it", { numeric: true, sensitivity: "base" });

// Ritorna { foto: [percorsi .jpg ordinati], ignorati: [nomi non copiabili] }
const elencaFoto = (cartella) => {
  const tutti = fs.readdirSync(cartella).filter((n) => !n.startsWith("."));
  const foto = tutti.filter((n) => /\.jpe?g$/i.test(n)).sort(ordineNaturale);
  const ignorati = tutti.filter((n) => !/\.jpe?g$/i.test(n) && fs.statSync(path.join(cartella, n)).isFile());
  return { foto: foto.map((n) => path.join(cartella, n)), ignorati };
};

module.exports = { cartellaImg, pulisciPercorso, ordineNaturale, elencaFoto };
