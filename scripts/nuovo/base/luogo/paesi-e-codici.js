"use strict";

const fs = require("fs");
const path = require("path");
const { RADICE } = require("./impostazioni");

// Luogo di un giro: nome + eventuali bandiere + uno o più link (ciascuno con il suo titolo).
//
// La bandiera sta nel testo, subito dopo il posto a cui si riferisce, come segnaposto {CODICE}:
//   "Da Tarvisio a Bled {CUSTOM_SLOVENIA}"   →   <img src="/img/Icons/Bandiere/Slovenia/Slovenia.png" alt="Slovenia">
// Esistono SOLO le bandiere create dall'utente (sezione "Bandiere" dell'interfaccia): ognuna ha
// una sua sottocartella col nome scelto, Img/Icons/Bandiere/<Nome>/<Nome>.png|jpg|webp,
// ed è registrata in json/Bandiere-personalizzate.json (codice, nome, file).
//
// Il JSON dei giri continua a salvare tutto in `place` (HTML), il formato che il sito pubblico già legge:
//   senza link          →  "Cividale + Dobrovo <img…>"
//   un link senza titolo →  "<a href=…>Dobrovo <img…></a>"
//   uno o più link       →  "Udine <br><a href=…>Andata</a><br><a href=…>Ritorno</a>"

const CARTELLA_BANDIERE = "Img/Icons/Bandiere";
const FILE_BANDIERE_PERSONALIZZATE = path.join(
  RADICE,
  "json",
  "Bandiere-personalizzate.json",
);
const RE_FILE_BANDIERA =
  /^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.(?:png|jpe?g|webp)$/i;

// "Friuli Venezia Giulia" → "Friuli_Venezia_Giulia" (nome di cartella e di file, senza accenti né simboli)
const nomeCartella = (nome) =>
  String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48)
    .replace(/_+$/g, "");

const leggiBandierePersonalizzate = () => {
  if (!fs.existsSync(FILE_BANDIERE_PERSONALIZZATE)) return [];
  const dati = JSON.parse(
    fs.readFileSync(FILE_BANDIERE_PERSONALIZZATE, "utf8"),
  );
  if (!Array.isArray(dati))
    throw new Error("Il catalogo delle bandiere personalizzate non è valido.");
  return dati.filter(
    (b) =>
      b &&
      /^CUSTOM_[A-Z0-9_]+$/.test(b.codice) &&
      typeof b.nome === "string" &&
      typeof b.file === "string" &&
      RE_FILE_BANDIERA.test(b.file),
  );
};
const paesePersonalizzato = (codice) =>
  leggiBandierePersonalizzate().find((b) => b.codice === codice);

// Dove sta l'immagine: sempre Img/Icons/Bandiere/<Nome>/<file>.
const immagineBandiera = (codice) => {
  const bandiera = paesePersonalizzato(codice);
  if (!bandiera) throw new Error(`Bandiera non riconosciuta: ${codice}.`);
  const rel = `${CARTELLA_BANDIERE}/${bandiera.file}`;
  return { rel, url: "/" + rel.replace(/^Img\//, "img/") };
};
const elencoPaesi = () =>
  leggiBandierePersonalizzate().map((p) => ({
    ...p,
    bandiera: "🏳️",
    src: immagineBandiera(p.codice).url,
    personalizzata: true,
  }));
const nomePaese = (codice) => paesePersonalizzato(codice)?.nome || codice;

// I testi finiscono in HTML già esistente: conserva apostrofi e & in modo sicuro.
const esc = (s) =>
  String(s).replace(
    /[&<>\"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const unesc = (s) =>
  String(s)
    .replace(/<[^>]*>/g, " ")
    .replace(/&quot;/g, '\"')
    .replace(/&#39;/g, "'")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const validaLink = (url) => /^https?:\/\/[^\s"<>]+$/i.test(url);
