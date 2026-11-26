"use strict";

const fs = require("fs");
const path = require("path");
const { RADICE } = require("./impostazioni");

// Luogo di un giro: nome + eventuali bandiere + uno o più link (ciascuno con il suo titolo).
//
// La bandiera sta nel testo, subito dopo il posto a cui si riferisce, come segnaposto {CODICE}:
//   "Da Tarvisio a Bled {CUSTOM_SLOVENIA}"   →   <img src="/img/Icons/Bandiere/Slovenia.png" alt="Slovenia">
// Esistono SOLO le bandiere create dall'utente (sezione "Bandiere" dell'interfaccia): ogni
// immagine sta direttamente in Img/Icons/Bandiere/<Nome>.png|jpg|webp ed è registrata in
// json/Bandiere-personalizzate.json (codice, nome, file).
// Se un'immagine viene messa in quella cartella a mano (o da codice), sincronizzaBandiere() la
// registra da sola nel catalogo: compare subito nel gestionale e nelle pagine del sito.
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
const RE_FILE_BANDIERA = /^[A-Za-z0-9_-]+\.(?:png|jpe?g|webp)$/i;
const RE_CODICE_BANDIERA = /^CUSTOM_[A-Z0-9_]+$/;
const cartellaBandiere = () => path.join(RADICE, CARTELLA_BANDIERE);

// "Friuli Venezia Giulia" → "Friuli_Venezia_Giulia" (nome del file, senza accenti né simboli)
const nomeCartella = (nome) =>
  String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48)
    .replace(/_+$/g, "");

const bandiereValide = (dati) =>
  dati.filter(
    (b) =>
      b &&
      RE_CODICE_BANDIERA.test(b.codice) &&
      typeof b.nome === "string" &&
      typeof b.file === "string" &&
      RE_FILE_BANDIERA.test(b.file),
  );
const leggiBandierePersonalizzate = () => {
  if (!fs.existsSync(FILE_BANDIERE_PERSONALIZZATE)) return [];
  const dati = JSON.parse(
    fs.readFileSync(FILE_BANDIERE_PERSONALIZZATE, "utf8"),
  );
  if (!Array.isArray(dati))
    throw new Error("Il catalogo delle bandiere personalizzate non è valido.");
  return bandiereValide(dati);
};
const paesePersonalizzato = (codice) =>
  leggiBandierePersonalizzate().find((b) => b.codice === codice);

// Allinea il catalogo alla cartella delle immagini:
//  - ripulisce le voci non valide (es. un `{}` rimasto nel JSON),
//  - aggiunge le immagini trovate in cartella che non sono ancora registrate.
// Ritorna true se ha riscritto il catalogo.
const sincronizzaBandiere = () => {
  let grezzo = [];
  if (fs.existsSync(FILE_BANDIERE_PERSONALIZZATE)) {
    try {
      const letto = JSON.parse(
        fs.readFileSync(FILE_BANDIERE_PERSONALIZZATE, "utf8"),
      );
      if (Array.isArray(letto)) grezzo = letto;
    } catch {
      return false; // JSON a metà scrittura: riprovo al prossimo giro
    }
  }
  const catalogo = bandiereValide(grezzo);
  const usati = new Set(catalogo.map((b) => b.file.toLowerCase()));
  const codici = new Set(catalogo.map((b) => b.codice));
  let cambiato = catalogo.length !== grezzo.length;
  const cartella = cartellaBandiere();
  const files = fs.existsSync(cartella)
    ? fs
        .readdirSync(cartella, { withFileTypes: true })
        .filter((d) => d.isFile() && RE_FILE_BANDIERA.test(d.name))
        .map((d) => d.name)
        .sort((a, b) => a.localeCompare(b, "it"))
    : [];
  for (const file of files) {
    if (usati.has(file.toLowerCase())) continue;
    const base = path.parse(file).name;
    let codice = `CUSTOM_${base.toUpperCase().replace(/-/g, "_")}`;
    for (let n = 2; codici.has(codice); n++) codice = `${codice}_${n}`;
    codici.add(codice);
    catalogo.push({ codice, nome: base.replace(/[_-]+/g, " ").trim(), file });
    cambiato = true;
  }
  if (!cambiato) return false;
  fs.mkdirSync(path.dirname(FILE_BANDIERE_PERSONALIZZATE), { recursive: true });
  const temp = `${FILE_BANDIERE_PERSONALIZZATE}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(catalogo, null, 2)}\n`, "utf8");
  fs.renameSync(temp, FILE_BANDIERE_PERSONALIZZATE);
  return true;
};

// Dove sta l'immagine: sempre Img/Icons/Bandiere/<file>.
const immagineBandiera = (codice) => {
  const bandiera = paesePersonalizzato(codice);
  if (!bandiera) throw new Error(`Bandiera non riconosciuta: ${codice}.`);
  const rel = `${CARTELLA_BANDIERE}/${bandiera.file}`;
  return { rel, url: "/" + rel.replace(/^Img\//, "img/") };
};
const elencoPaesi = () =>
  leggiBandierePersonalizzate().map((p) => {
    const { rel, url } = immagineBandiera(p.codice);
    let versione = 0;
    try {
      versione = Math.round(fs.statSync(path.join(RADICE, rel)).mtimeMs);
    } catch {
      /* file mancante: l'interfaccia lo segnala */
    }
    return {
      ...p,
      bandiera: "🏳️",
      src: versione ? `${url}?v=${versione}` : url,
      mancante: !versione,
      personalizzata: true,
    };
  });
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
