"use strict";

const fs = require("fs");
const path = require("path");
const { RADICE } = require("./impostazioni");

// Luogo di un giro: nome + eventuali bandiere + uno o più link (ciascuno con il suo titolo).
//
// Come nei giri già presenti nei JSON, la bandiera sta nel testo, subito dopo il posto a cui si riferisce:
//   "Da Tarvisio a Bled {SI} e Lubiana {SI}"   →   <img src="/img/Icons/Slovenia.png" alt="Slovenia"> al posto di {SI}
// {XX} usa il codice del paese (SI, AT, HR…); le bandiere personalizzate usano un codice automatico.
// L'immagine sta in Img/Icons/<Paese>.png|svg: se manca, il programma la crea da scripts/nuovo/base/bandiere/.
//
// Il JSON dei giri continua a salvare tutto in `place` (HTML), il formato che il sito pubblico già legge:
//   senza link          →  "Cividale + Dobrovo <img…>"
//   un link senza titolo →  "<a href=…>Dobrovo <img…></a>"
//   uno o più link       →  "Udine <br><a href=…>Andata</a><br><a href=…>Ritorno</a>"

const PAESI = [
  ["IT", "Italia"],
  ["SI", "Slovenia"],
  ["AT", "Austria"],
  ["HR", "Croazia"],
  ["CH", "Svizzera"],
  ["DE", "Germania"],
  ["FR", "Francia"],
  ["ES", "Spagna"],
  ["PT", "Portogallo"],
  ["SM", "San Marino"],
  ["VA", "Vaticano"],
  ["MC", "Monaco"],
  ["LI", "Liechtenstein"],
  ["LU", "Lussemburgo"],
  ["BE", "Belgio"],
  ["NL", "Paesi Bassi"],
  ["DK", "Danimarca"],
  ["SE", "Svezia"],
  ["NO", "Norvegia"],
  ["FI", "Finlandia"],
  ["IS", "Islanda"],
  ["IE", "Irlanda"],
  ["GB", "Regno Unito"],
  ["PL", "Polonia"],
  ["CZ", "Cechia"],
  ["SK", "Slovacchia"],
  ["HU", "Ungheria"],
  ["RO", "Romania"],
  ["BG", "Bulgaria"],
  ["RS", "Serbia"],
  ["BA", "Bosnia ed Erzegovina"],
  ["ME", "Montenegro"],
  ["MK", "Macedonia del Nord"],
  ["AL", "Albania"],
  ["GR", "Grecia"],
  ["MT", "Malta"],
  ["CY", "Cipro"],
  ["EE", "Estonia"],
  ["LV", "Lettonia"],
  ["LT", "Lituania"],
  ["UA", "Ucraina"],
  ["TR", "Turchia"],
  ["US", "Stati Uniti"],
  ["CA", "Canada"],
  ["MX", "Messico"],
  ["BR", "Brasile"],
  ["AR", "Argentina"],
  ["JP", "Giappone"],
  ["CN", "Cina"],
  ["AU", "Australia"],
  ["NZ", "Nuova Zelanda"],
  ["ZA", "Sudafrica"],
  ["MA", "Marocco"],
].map(([codice, nome]) => ({ codice, nome, bandiera: bandiera(codice) }));

function bandiera(codice) {
  return [...codice]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

const CODICI = new Set(PAESI.map((p) => p.codice));
const FILE_BANDIERE_PERSONALIZZATE = path.join(
  RADICE,
  "json",
  "Bandiere-personalizzate.json",
);
const leggiBandierePersonalizzate = () => {
  if (!fs.existsSync(FILE_BANDIERE_PERSONALIZZATE)) return [];
  const dati = JSON.parse(fs.readFileSync(FILE_BANDIERE_PERSONALIZZATE, "utf8"));
  if (!Array.isArray(dati))
    throw new Error("Il catalogo delle bandiere personalizzate non è valido.");
  return dati.filter(
    (b) =>
      b &&
      /^CUSTOM_[A-Z0-9_]+$/.test(b.codice) &&
      typeof b.nome === "string" &&
      typeof b.file === "string" &&
      /^custom-[a-z0-9-]+\.(?:png|jpe?g|webp)$/i.test(b.file),
  );
};
const paesePersonalizzato = (codice) =>
  leggiBandierePersonalizzate().find((b) => b.codice === codice);
// Una bandiera standard è "disponibile" nel menu solo se l'immagine esiste davvero
// in Img/Icons (oggi Austria e Slovenia). Le altre restano valide nei giri già salvati.
const bandieraPresente = (p) =>
  [".png", ".svg"].some((est) =>
    fs.existsSync(path.join(RADICE, "Img", "Icons", nomeFile(p.nome) + est)),
  );
const elencoPaesi = () => [
  ...PAESI.map((p) => ({
    ...p,
    src: `/img/Bandiere/${p.codice.toLowerCase()}.svg`,
    disponibile: bandieraPresente(p),
  })),
  ...leggiBandierePersonalizzate().map((p) => ({
    ...p,
    bandiera: "🏳️",
    src: immagineBandiera(p.codice).url,
    personalizzata: true,
    disponibile: true,
  })),
];
const nomePaese = (codice) =>
  PAESI.find((p) => p.codice === codice)?.nome ||
  paesePersonalizzato(codice)?.nome ||
  codice;

// I testi finiscono in HTML già esistente: conserva apostrofi e & in modo sicuro.
const esc = (s) =>
  String(s).replace(/[&<>\"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
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
