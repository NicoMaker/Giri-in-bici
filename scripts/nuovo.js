#!/usr/bin/env node
/*
 * nuovo.js — Creazione GUIDATA di una nuova stagione o di un nuovo anno.
 *
 * Uso (dalla cartella principale del progetto):
 *     node scripts/nuovo.js
 *     node scripts/nuovo.js --prova      (mostra cosa farebbe, senza scrivere nulla)
 *
 *     # aggiungere un giro senza menu (quello che mancasse lo chiede):
 *     node scripts/nuovo.js --giro --stagione=Autunno_Inverno --data="22 Novembre 2026" \
 *          --km=95 --luogo="Pinzano" --link="https://www.komoot.com/..." [--si]
 *
 * Segue passo passo la logica del README ("Inizio di una Nuova Stagione" e
 * "Creazione di un Nuovo Anno"). Non servono librerie: basta Node.js.
 *
 *  NUOVA STAGIONE (Primavera / Estate / Autunno-Inverno)
 *    1. crea   <Stagione>/<periodo>.html            (copia dell'ultimo periodo)
 *    2. crea   json/<Stagione>/Periodi/<periodo>.json   (un solo giro d'esempio)
 *    3. aggiorna json/<Stagione>/generale.json      (subPeriods + colors)
 *    4. aggiorna json/Statistiche/anni/stagioni/stagioni.json
 *    5. foto: se indichi la cartella le copia come 1.jpg, 2.jpg... e la
 *       galleria della pagina HTML viene costruita con i blocchi giusti
 *
 *  NUOVO ANNO (Statistiche)
 *    1. crea   Statistiche/Anni/<anno>.html
 *    2. crea   json/Statistiche/anni/<anno>.json
 *    3. aggiorna json/Statistiche/History/Storico.json (anni + coloriAnni)
 *    4. icona (favicon) dell'anno: copia la tua immagine .jpg oppure la
 *       crea con l'anno scritto sul colore scelto, e collega la pagina
 *
 *  NUOVO GIRO  (il caso più frequente)
 *    "Il giorno X ho fatto un giro di N km": dati data, stagione, luogo, link e km
 *    1. aggiunge il giro nel JSON del periodo giusto, in ordine cronologico
 *    2. somma i km nel mese giusto dell'anno giusto (json/Statistiche/anni/<anno>.json);
 *       se quel mese non c'è ancora lo crea
 *    3. aumenta di 1 le corse dell'anno (numberOfRaces)
 *
 *  MESE   aggiunge (o corregge) un mese in un anno già esistente.
 *
 * I COLORI di stagioni e anni li scrivi sempre tu nel terminale (nome CSS, es.
 * gold, oppure #esadecimale): non c'è nessun colore suggerito.
 *
 * Tutte le modifiche vengono preparate in memoria, controllate (JSON valido,
 * nessun file sovrascritto) e scritte solo alla fine, dopo la conferma: se
 * qualcosa non va, non resta niente a metà.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const zlib = require("zlib");

/* ------------------------------------------------------------------ */
/* Impostazioni                                                         */
/* ------------------------------------------------------------------ */

const argomenti = process.argv.slice(2);
const PROVA = argomenti.includes("--prova");
const SI = argomenti.includes("--si"); // salta la domanda finale "Confermi?"
const MODO_GIRO = argomenti.includes("--giro");
const argRadice = argomenti.find((a) => a.startsWith("--radice="));
const RADICE = path.resolve(argRadice ? argRadice.split("=")[1] : path.join(__dirname, ".."));

// --nome=valore  ->  "valore" (oppure undefined se non c'è)
const opzione = (nome) => {
  const a = argomenti.find((x) => x.startsWith(`--${nome}=`));
  return a === undefined ? undefined : a.slice(nome.length + 3);
};

const STAGIONI = {
  Primavera: {
    etichetta: "Primavera 🌸",
    testo: "Primavera",
    cartella: "Primavera",
    formato: "anno",
    meseIniziale: "Marzo",
  },
  Estate: {
    etichetta: "Estate 🌞",
    testo: "Estate",
    cartella: "Estate",
    formato: "anno",
    meseIniziale: "Giugno",
  },
  Autunno_Inverno: {
    etichetta: "Autunno Inverno 🍁❄️",
    testo: "Autunno - Inverno",
    cartella: "Autunno_Inverno",
    formato: "biennio",
    meseIniziale: "Ottobre",
  },
};

const MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

// Nomi colore CSS validi (servono a controllare quello che scrivi e a disegnare
// l'icona dell'anno). Gli esadecimali (#ff0060) sono accettati sempre.
const COLORI_CSS = {
  aliceblue: "#F0F8FF", antiquewhite: "#FAEBD7", aqua: "#00FFFF", aquamarine: "#7FFFD4",
  azure: "#F0FFFF", beige: "#F5F5DC", bisque: "#FFE4C4", black: "#000000",
  blanchedalmond: "#FFEBCD", blue: "#0000FF", blueviolet: "#8A2BE2", brown: "#A52A2A",
  burlywood: "#DEB887", cadetblue: "#5F9EA0", chartreuse: "#7FFF00", chocolate: "#D2691E",
  coral: "#FF7F50", cornflowerblue: "#6495ED", cornsilk: "#FFF8DC", crimson: "#DC143C",
  cyan: "#00FFFF", darkblue: "#00008B", darkcyan: "#008B8B", darkgoldenrod: "#B8860B",
  darkgray: "#A9A9A9", darkgreen: "#006400", darkgrey: "#A9A9A9", darkkhaki: "#BDB76B",
  darkmagenta: "#8B008B", darkolivegreen: "#556B2F", darkorange: "#FF8C00",
  darkorchid: "#9932CC", darkred: "#8B0000", darksalmon: "#E9967A", darkseagreen: "#8FBC8F",
  darkslateblue: "#483D8B", darkslategray: "#2F4F4F", darkslategrey: "#2F4F4F",
  darkturquoise: "#00CED1", darkviolet: "#9400D3", deeppink: "#FF1493", deepskyblue: "#00BFFF",
  dimgray: "#696969", dimgrey: "#696969", dodgerblue: "#1E90FF", firebrick: "#B22222",
  floralwhite: "#FFFAF0", forestgreen: "#228B22", fuchsia: "#FF00FF", gainsboro: "#DCDCDC",
  ghostwhite: "#F8F8FF", gold: "#FFD700", goldenrod: "#DAA520", gray: "#808080",
  green: "#008000", greenyellow: "#ADFF2F", grey: "#808080", honeydew: "#F0FFF0",
  hotpink: "#FF69B4", indianred: "#CD5C5C", indigo: "#4B0082", ivory: "#FFFFF0",
  khaki: "#F0E68C", lavender: "#E6E6FA", lavenderblush: "#FFF0F5", lawngreen: "#7CFC00",
  lemonchiffon: "#FFFACD", lightblue: "#ADD8E6", lightcoral: "#F08080", lightcyan: "#E0FFFF",
  lightgoldenrodyellow: "#FAFAD2", lightgray: "#D3D3D3", lightgreen: "#90EE90",
  lightgrey: "#D3D3D3", lightpink: "#FFB6C1", lightsalmon: "#FFA07A", lightseagreen: "#20B2AA",
  lightskyblue: "#87CEFA", lightslategray: "#778899", lightslategrey: "#778899",
  lightsteelblue: "#B0C4DE", lightyellow: "#FFFFE0", lime: "#00FF00", limegreen: "#32CD32",
  linen: "#FAF0E6", magenta: "#FF00FF", maroon: "#800000", mediumaquamarine: "#66CDAA",
  mediumblue: "#0000CD", mediumorchid: "#BA55D3", mediumpurple: "#9370DB",
  mediumseagreen: "#3CB371", mediumslateblue: "#7B68EE", mediumspringgreen: "#00FA9A",
  mediumturquoise: "#48D1CC", mediumvioletred: "#C71585", midnightblue: "#191970",
  mintcream: "#F5FFFA", mistyrose: "#FFE4E1", moccasin: "#FFE4B5", navajowhite: "#FFDEAD",
  navy: "#000080", oldlace: "#FDF5E6", olive: "#808000", olivedrab: "#6B8E23",
  orange: "#FFA500", orangered: "#FF4500", orchid: "#DA70D6", palegoldenrod: "#EEE8AA",
  palegreen: "#98FB98", paleturquoise: "#AFEEEE", palevioletred: "#DB7093",
  papayawhip: "#FFEFD5", peachpuff: "#FFDAB9", peru: "#CD853F", pink: "#FFC0CB",
  plum: "#DDA0DD", powderblue: "#B0E0E6", purple: "#800080", rebeccapurple: "#663399",
  red: "#FF0000", rosybrown: "#BC8F8F", royalblue: "#4169E1", saddlebrown: "#8B4513",
  salmon: "#FA8072", sandybrown: "#F4A460", seagreen: "#2E8B57", seashell: "#FFF5EE",
  sienna: "#A0522D", silver: "#C0C0C0", skyblue: "#87CEEB", slateblue: "#6A5ACD",
  slategray: "#708090", slategrey: "#708090", snow: "#FFFAFA", springgreen: "#00FF7F",
  steelblue: "#4682B4", tan: "#D2B48C", teal: "#008080", thistle: "#D8BFD8", tomato: "#FF6347",
  turquoise: "#40E0D0", violet: "#EE82EE", wheat: "#F5DEB3", white: "#FFFFFF",
  whitesmoke: "#F5F5F5", yellow: "#FFFF00", yellowgreen: "#9ACD32",
};

const PERCORSO_STAGIONI_JSON = "json/Statistiche/anni/stagioni/stagioni.json";
const PERCORSO_STORICO_JSON = "json/Statistiche/History/Storico.json";

/* ------------------------------------------------------------------ */
/* Terminale                                                            */
/* ------------------------------------------------------------------ */

const colori = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (codice, t) => (colori ? `\x1b[${codice}m${t}\x1b[0m` : t);
const grassetto = (t) => c("1", t);
const verde = (t) => c("32", t);
const giallo = (t) => c("33", t);
const rosso = (t) => c("31", t);
const grigio = (t) => c("90", t);
const ciano = (t) => c("36", t);

// Le risposte arrivano da una coda di righe: funziona sia scrivendo a mano
// sia con input "incollato" o da file (nessuna riga si perde).
const rl = readline.createInterface({ input: process.stdin, terminal: false });
const righe = [];
const inAttesa = [];
let chiuso = false;
rl.on("line", (riga) => {
  if (inAttesa.length) inAttesa.shift()(riga);
  else righe.push(riga);
});
rl.on("close", () => {
  chiuso = true;
  while (inAttesa.length) inAttesa.shift()(null);
});

const leggiRiga = () =>
  new Promise((risolvi) => {
    if (righe.length) return risolvi(righe.shift());
    if (chiuso) return risolvi(null);
    inAttesa.push(risolvi);
  });

class Uscita extends Error {}

const chiedi = async (domanda, predefinito = "") => {
  const suggerimento = predefinito !== "" ? grigio(` [${predefinito}]`) : "";
  process.stdout.write(`${ciano("?")} ${domanda}${suggerimento}: `);
  const riga = await leggiRiga();
  if (riga === null) {
    process.stdout.write("\n");
    throw new Uscita("Input terminato.");
  }
  if (!process.stdin.isTTY) process.stdout.write(`${riga}\n`);
  const t = riga.trim();
  return t === "" ? predefinito : t;
};

const chiediValido = async (domanda, predefinito, valida) => {
  for (;;) {
    const r = await chiedi(domanda, predefinito);
    const errore = valida(r);
    if (!errore) return r;
    console.log(rosso(`  ✖ ${errore}`));
  }
};

const chiediSiNo = async (domanda, predefinito = true) => {
  const r = (await chiedi(`${domanda} (s/n)`, predefinito ? "s" : "n")).toLowerCase();
  return ["s", "si", "sì", "y", "yes"].includes(r);
};

const scegli = async (titolo, opzioni) => {
  console.log(`\n${grassetto(titolo)}`);
  opzioni.forEach((o, i) => console.log(`  ${grassetto(String(o.tasto ?? i + 1))}) ${o.testo}`));
  const tasti = opzioni.map((o, i) => String(o.tasto ?? i + 1));
  const r = await chiediValido("Scelta", "", (v) => (tasti.includes(v) ? null : "Scelta non valida."));
  return opzioni[tasti.indexOf(r)];
};

/* ------------------------------------------------------------------ */
/* File: tutto passa dal "Piano" (memoria -> controllo -> scrittura)    */
/* ------------------------------------------------------------------ */

class Piano {
  constructor() {
    this.contenuti = new Map(); // percorso relativo -> testo
    this.creati = new Set();
    this.modificati = new Set();
    this.cartelle = new Set();
    this.promemoria = [];
    this.note = []; // frasi di riepilogo (es. "Il 22 Novembre ho fatto un giro di 95 km")
    this.avvisi = [];
    this.esempio = false; // true se è rimasto un giro/mese d'esempio da sostituire
  }

  creaBinario(rel, buffer) {
    this.crea(rel, buffer);
  }

  assoluto(rel) {
    return path.join(RADICE, rel);
  }

  esiste(rel) {
    return this.contenuti.has(rel) || fs.existsSync(this.assoluto(rel));
  }

  leggi(rel) {
    if (this.contenuti.has(rel)) return this.contenuti.get(rel);
    const file = this.assoluto(rel);
    if (!fs.existsSync(file)) throw new Error(`File non trovato: ${rel}`);
    return fs.readFileSync(file, "utf8");
  }

  crea(rel, testo) {
    if (this.esiste(rel)) throw new Error(`Esiste già, non lo sovrascrivo: ${rel}`);
    this.contenuti.set(rel, testo);
    this.creati.add(rel);
  }

  modifica(rel, testo) {
    const prima = this.leggi(rel);
    if (prima === testo) return;
    this.contenuti.set(rel, testo);
    if (!this.creati.has(rel)) this.modificati.add(rel);
  }

  cartella(rel) {
    if (!fs.existsSync(this.assoluto(rel))) this.cartelle.add(rel);
  }

  valida() {
    for (const [rel, testo] of this.contenuti) {
      if (rel.endsWith(".json") && typeof testo === "string") {
        try {
          JSON.parse(testo);
        } catch (e) {
          throw new Error(`JSON non valido in ${rel}: ${e.message}`);
        }
      }
    }
  }

  scrivi() {
    for (const rel of this.cartelle) {
      fs.mkdirSync(this.assoluto(rel), { recursive: true });
      fs.writeFileSync(path.join(this.assoluto(rel), ".gitkeep"), "");
    }
    for (const [rel, testo] of this.contenuti) {
      const file = this.assoluto(rel);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, testo, "utf8");
    }
  }
}

/* ------------------------------------------------------------------ */
/* Modifica "chirurgica" dei JSON: si aggiunge solo la riga nuova, senza */
/* riformattare il resto (così in git cambia solo ciò che serve).       */
/* ------------------------------------------------------------------ */

// Cerca  "chiave": <apertura>  a partire da `da` e trova la chiusura.
const trovaBlocco = (testo, chiave, apertura, chiusura, da = 0) => {
  const re = new RegExp(`"${chiave}"\\s*:\\s*\\${apertura}`, "g");
  re.lastIndex = da;
  const m = re.exec(testo);
  if (!m) throw new Error(`Chiave "${chiave}" non trovata.`);
  const inizio = m.index + m[0].length;
  const fine = testo.indexOf(chiusura, inizio);
  if (fine === -1) throw new Error(`Chiusura di "${chiave}" non trovata.`);
  return { inizio, fine, posizione: m.index };
};

const accoda = (testo, inizio, fine, voce) => {
  const corpo = testo.slice(inizio, fine);
  const contenuto = corpo.replace(/\s+$/, "");
  const coda = corpo.slice(contenuto.length);
  const multiriga = corpo.includes("\n");
  let separatore = " "; // array su una sola riga: la virgola è già aggiunta sotto
  if (multiriga) {
    const ultima = contenuto.slice(contenuto.lastIndexOf("\n") + 1);
    separatore = `\n${ultima.match(/^[ \t]*/)[0]}`;
  }
  return testo.slice(0, inizio) + contenuto + "," + separatore + voce + coda + testo.slice(fine);
};

const aggiungiAOggetto = (testo, chiave, k, v, da = 0) => {
  const { inizio, fine } = trovaBlocco(testo, chiave, "{", "}", da);
  return accoda(testo, inizio, fine, `${JSON.stringify(k)}: ${JSON.stringify(v)}`);
};

const aggiungiAArray = (testo, chiave, valore, da = 0) => {
  const { inizio, fine } = trovaBlocco(testo, chiave, "[", "]", da);
  return accoda(testo, inizio, fine, JSON.stringify(valore));
};

/* ------------------------------------------------------------------ */
/* Utilità                                                              */
/* ------------------------------------------------------------------ */

const ordinaPeriodi = (a, b) => parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b);

const leggiJson = (piano, rel) => JSON.parse(piano.leggi(rel));

const periodoSuccessivo = (formato, ultimo) => {
  const anno = parseInt(ultimo, 10);
  return formato === "biennio" ? `${anno + 1}-${anno + 2}` : String(anno + 1);
};

const validaPeriodo = (formato, esistenti) => (v) => {
  if (formato === "anno") {
    if (!/^\d{4}$/.test(v)) return "Scrivi l'anno con 4 cifre, es. 2027.";
  } else {
    const m = v.match(/^(\d{4})-(\d{4})$/);
    if (!m) return "Scrivi il periodo come 2027-2028.";
    if (parseInt(m[2], 10) !== parseInt(m[1], 10) + 1) return "Il secondo anno deve seguire il primo (es. 2027-2028).";
  }
  if (esistenti.includes(v)) return `${v} esiste già.`;
  return null;
};

// Un colore è valido se è un nome CSS noto (gold, tomato...) o un esadecimale.
const validaColore = (v) => {
  if (!v) return "Il colore lo scegli tu: scrivi un nome CSS (es. gold) oppure un esadecimale (es. #ff0060).";
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return null;
  if (COLORI_CSS[v.toLowerCase()]) return null;
  return `"${v}" non è un colore valido: usa un nome CSS inglese (es. gold, tomato, teal) oppure un esadecimale (es. #ff0060).`;
};

// Chiede il colore SENZA suggerirne nessuno: lo scrivi tu nel terminale.
const chiediColore = async (domanda, usati = []) => {
  if (usati.length) console.log(grigio(`  Colori già usati: ${usati.join(", ")}`));
  for (;;) {
    let colore = await chiediValido(domanda, "", validaColore);
    if (COLORI_CSS[colore.toLowerCase()]) colore = colore.toLowerCase();
    const doppio = usati.some((u) => String(u).toLowerCase() === colore.toLowerCase());
    if (!doppio || (await chiediSiNo(`  ${colore} è già usato da un altro: lo vuoi usare lo stesso?`, false))) return colore;
  }
};

const coloreInRgb = (colore) => {
  let hex = colore.startsWith("#") ? colore : COLORI_CSS[colore.toLowerCase()];
  hex = hex.slice(1);
  if (hex.length <= 4) hex = [...hex].map((x) => x + x).join("");
  return [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16));
};

/* ------------------------------------------------------------------ */
/* Immagini: foto delle stagioni e icona (favicon) dell'anno            */
/* ------------------------------------------------------------------ */

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

const tabellaCrc = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let x = n;
    for (let k = 0; k < 8; k++) x = x & 1 ? 0xedb88320 ^ (x >>> 1) : x >>> 1;
    t[n] = x >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let x = 0xffffffff;
  for (const b of buf) x = tabellaCrc[(x ^ b) & 0xff] ^ (x >>> 8);
  return (x ^ 0xffffffff) >>> 0;
};
const pezzoPng = (tipo, dati) => {
  const corpo = Buffer.concat([Buffer.from(tipo, "ascii"), dati]);
  const lung = Buffer.alloc(4);
  lung.writeUInt32BE(dati.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo));
  return Buffer.concat([lung, corpo, crc]);
};

// Cifre 5x7 (un carattere = un pixel "grande").
const CIFRE = {
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  6: ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
};

// Icona quadrata 256x256 (PNG): l'anno su due righe ("20" / "27") sul colore dell'anno.
const creaIconaAnno = (anno, colore) => {
  const L = 256;
  const [r, g, b] = coloreInRgb(colore);
  const chiaro = 0.299 * r + 0.587 * g + 0.114 * b > 150;
  const testo = chiaro ? [20, 20, 20] : [255, 255, 255];
  const scala = 13;
  const larg = 5 * scala;
  const spazio = scala;
  const alt = 7 * scala;
  const righeTesto = [String(anno).slice(0, 2), String(anno).slice(2, 4)];
  const totaleAlt = alt * 2 + 2 * scala;
  const y0 = Math.round((L - totaleAlt) / 2);
  const pixel = Buffer.alloc(L * L * 4);
  const raggio = 52;
  const dentro = (x, y) => {
    const cx = Math.min(Math.max(x, raggio), L - 1 - raggio);
    const cy = Math.min(Math.max(y, raggio), L - 1 - raggio);
    return (x - cx) ** 2 + (y - cy) ** 2 <= raggio ** 2;
  };
  const acceso = (x, y) => {
    for (let riga = 0; riga < 2; riga++) {
      const ty = y0 + riga * (alt + 2 * scala);
      const tx = Math.round((L - (larg * 2 + spazio)) / 2);
      if (y < ty || y >= ty + alt) continue;
      for (let c = 0; c < 2; c++) {
        const cx0 = tx + c * (larg + spazio);
        if (x < cx0 || x >= cx0 + larg) continue;
        const cifra = CIFRE[righeTesto[riga][c]];
        if (cifra && cifra[Math.floor((y - ty) / scala)][Math.floor((x - cx0) / scala)] === "1") return true;
      }
    }
    return false;
  };
  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      // 3x3 campioni per i bordi arrotondati più morbidi
      let cop = 0;
      for (let sy = 0; sy < 3; sy++) for (let sx = 0; sx < 3; sx++) if (dentro(x + (sx + 0.5) / 3 - 0.5, y + (sy + 0.5) / 3 - 0.5)) cop++;
      const o = (y * L + x) * 4;
      const [pr, pg, pb] = acceso(x, y) ? testo : [r, g, b];
      pixel[o] = pr;
      pixel[o + 1] = pg;
      pixel[o + 2] = pb;
      pixel[o + 3] = Math.round((cop / 9) * 255);
    }
  }
  const righeRaw = Buffer.alloc(L * (L * 4 + 1));
  for (let y = 0; y < L; y++) pixel.copy(righeRaw, y * (L * 4 + 1) + 1, y * L * 4, (y + 1) * L * 4);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(L, 0);
  ihdr.writeUInt32BE(L, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pezzoPng("IHDR", ihdr),
    pezzoPng("IDAT", zlib.deflateSync(righeRaw)),
    pezzoPng("IEND", Buffer.alloc(0)),
  ]);
};

const normalizzaData = (v) => {
  const m = v.match(/^(\d{1,2})\s+([A-Za-zàèéìòù]+)$/);
  if (!m) return null;
  const giorno = parseInt(m[1], 10);
  const mese = MESI.find((x) => x.toLowerCase() === m[2].toLowerCase());
  if (!mese || giorno < 1 || giorno > 31) return null;
  return `${String(giorno).padStart(2, "0")} ${mese}`;
};

/* ------------------------------------------------------------------ */
/* Nuova STAGIONE                                                       */
/* ------------------------------------------------------------------ */

const raccogliStagione = async (piano, chiave, opzioni = {}) => {
  const s = STAGIONI[chiave];
  const fileGenerale = `json/${s.cartella}/generale.json`;
  const generale = leggiJson(piano, fileGenerale);
  const esistenti = Object.keys(generale.subPeriods).sort(ordinaPeriodi);
  const ultimo = esistenti[esistenti.length - 1];

  console.log(`\n${grassetto(s.etichetta)} ${grigio(`(ultimo periodo presente: ${ultimo})`)}`);

  const periodo =
    opzioni.periodo ||
    (await chiediValido(
      s.formato === "anno" ? "Anno della nuova stagione" : "Periodo della nuova stagione",
      periodoSuccessivo(s.formato, ultimo),
      validaPeriodo(s.formato, esistenti),
    ));
  if (opzioni.periodo) {
    const errore = validaPeriodo(s.formato, esistenti)(periodo);
    if (errore) throw new Error(`${s.testo}: ${errore}`);
  }

  if ((generale.colors || []).length !== esistenti.length) {
    console.log(
      giallo(
        `  ⚠ In ${fileGenerale} i colori (${(generale.colors || []).length}) non sono tanti quanti i periodi (${esistenti.length}): controlla l'ordine dopo la creazione.`,
      ),
    );
  }
  const colore = await chiediColore(
    `Colore di ${s.testo} ${periodo}: scrivilo tu (nome CSS, es. gold, oppure #esadecimale)`,
    generale.colors || [],
  );

  // Foto: indichi la cartella e le copio io come 1.jpg, 2.jpg... Se la salti, scegli quante
  // foto metterai tu (0 = sezione vuota).
  let fotoDaCopiare = [];
  let nFoto = 0;
  let cartellaFoto = await chiedi(
    "Cartella con le foto della stagione (.jpg) — trascinala qui, oppure invio per saltare",
    "",
  );
  while (cartellaFoto) {
    const dir = pulisciPercorso(cartellaFoto);
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const { foto, ignorati } = elencaFoto(dir);
      if (ignorati.length) {
        console.log(giallo(`  ⚠ Ignoro ${ignorati.length} file non .jpg: ${ignorati.slice(0, 5).join(", ")}${ignorati.length > 5 ? "…" : ""}`));
      }
      if (foto.length) {
        fotoDaCopiare = foto;
        nFoto = foto.length;
        console.log(verde(`  ✔ Trovate ${nFoto} foto: le copio come 1.jpg … ${nFoto}.jpg (nell'ordine dei nomi).`));
        break;
      }
      console.log(rosso("  ✖ In quella cartella non ci sono file .jpg."));
    } else {
      console.log(rosso("  ✖ Cartella non trovata."));
    }
    cartellaFoto = await chiedi("Prova con un'altra cartella (invio per saltare)", "");
  }
  if (!nFoto) {
    nFoto = parseInt(
      await chiediValido("Quante foto avrà la pagina? (0 = sezione vuota, le aggiungi tu)", "0", (v) =>
        /^\d{1,3}$/.test(v) ? null : "Scrivi un numero.",
      ),
      10,
    );
  }

  let giro = null;
  if (await chiediSiNo("Vuoi inserire subito il primo giro? (altrimenti metto un giro d'esempio da sostituire)", false)) {
    const data = await chiediValido(`Data (es. 05 ${s.meseIniziale})`, `01 ${s.meseIniziale}`, (v) =>
      normalizzaData(v) ? null : "Formato: giorno e mese in italiano, es. 05 Giugno.",
    );
    const luogo = await chiediValido("Luogo", "", (v) => (v ? null : "Il luogo è obbligatorio."));
    const link = await chiedi("Link Komoot (invio per saltare)", "https://www.komoot.com/it-it");
    const km = await chiediValido("Distanza in km", "0", (v) => (/^\d+$/.test(v) ? null : "Solo numeri interi."));
    giro = { date: normalizzaData(data), place: `<a href="${link}" target="_blank">${luogo}</a>`, distance: parseInt(km, 10) };
  }

  return { chiave, periodo, colore, nFoto, fotoDaCopiare, giro, ultimo };
};

const costruisciGalleria = (html, vecchio, s, periodo, nFoto) => {
  const gal = html.match(/(<div class="gallery">)([\s\S]*?)(<\/div>)/);
  if (!gal) throw new Error("Nel modello HTML non trovo <div class=\"gallery\">.");
  const rientroDiv = html.slice(html.lastIndexOf("\n", gal.index) + 1, gal.index);
  const rientroFigli = `${rientroDiv}  `;

  let nuovo;
  if (nFoto === 0) {
    nuovo = `\n${rientroFigli}<!-- Foto: aggiungi qui un blocco <a class="shot"> per ogni foto (vedi gli altri periodi).\n${rientroFigli}     Le immagini vanno in /img/${s.cartella}/${periodo}/1.jpg, 2.jpg, ... -->\n${rientroDiv}`;
  } else {
    const modello = gal[2].match(/<a\s+class="shot"[\s\S]*?<\/a>/);
    if (!modello) throw new Error("Nel modello HTML non trovo il blocco <a class=\"shot\">.");
    const blocco = modello[0].split(vecchio).join(periodo);
    const rientroBlocco = gal[2].match(/\n([ \t]*)<a\s+class="shot"/)[1];
    const copie = [];
    for (let i = 1; i <= nFoto; i++) {
      copie.push(
        `${rientroBlocco}${blocco.replace(/\/1\.jpg/g, `/${i}.jpg`).replace(/numero 1\b/g, `numero ${i}`)}`,
      );
    }
    nuovo = `\n${copie.join("\n")}\n${rientroDiv}`;
  }
  return html.slice(0, gal.index) + gal[1] + nuovo + gal[3] + html.slice(gal.index + gal[0].length);
};

// Il primo giro inserito insieme alla nuova stagione va contato anche nelle statistiche
// dell'anno (km del mese + 1 corsa), come per ogni altro giro.
const contaGiroInStatistiche = (piano, chiave, periodo, giro) => {
  const data = leggiDataSalvata(giro.date);
  const anno = annoDelGiroInPeriodo(chiave, periodo, data.mese);
  const file = `json/Statistiche/anni/${anno}.json`;
  if (!piano.esiste(file) || piano.creati.has(file)) {
    piano.avvisi.push(
      `Il giro del ${giro.date} (${giro.distance} km) NON è ancora nelle statistiche del ${anno}${piano.creati.has(file) ? " (anno appena creato: scrivi tu i km del mese)" : " (l'anno non esiste)"}. Dopo averlo creato usa "Aggiungere un MESE".`,
    );
    return;
  }
  const ris = aggiornaAnno(piano, anno, data.mese, giro.distance, { corse: 1 });
  controllaCoerenza(piano, anno, data.mese, ris.dopo);
  piano.note.push(
    `• ${file}: ${MESI[data.mese]} ${ris.creato ? `creato con ${ris.dopo}` : `${ris.prima} → ${ris.dopo}`} km, corse ${ris.corsePrima} → ${ris.corseDopo} (per il primo giro inserito)`,
  );
};

const applicaStagione = (piano, d) => {
  const s = STAGIONI[d.chiave];
  const modello = `${s.cartella}/${d.ultimo}.html`;
  const html = piano.leggi(modello);
  if (!html.includes(d.ultimo)) throw new Error(`Nel modello ${modello} non compare "${d.ultimo}".`);

  // 1. HTML: copia dell'ultimo periodo con il nuovo periodo, galleria svuotata
  let nuovoHtml = html.split(d.ultimo).join(d.periodo);
  nuovoHtml = costruisciGalleria(nuovoHtml, d.periodo, s, d.periodo, d.nFoto);
  // la galleria è già stata portata al nuovo periodo: il vecchio non deve restare da nessuna parte
  if (nuovoHtml.includes(d.ultimo)) throw new Error(`Nel nuovo HTML è rimasto "${d.ultimo}".`);
  piano.crea(`${s.cartella}/${d.periodo}.html`, nuovoHtml);

  // 2. JSON del periodo: un solo giro con le caratteristiche giuste
  if (!d.giro) piano.esempio = true;
  const giro = d.giro || {
    date: `01 ${s.meseIniziale}`,
    place: '<a href="https://www.komoot.com/it-it" target="_blank">Nome del luogo</a>',
    distance: 0,
  };
  piano.crea(`json/${s.cartella}/Periodi/${d.periodo}.json`, JSON.stringify([giro], null, 2) + "\n");

  // 3. generale.json: subPeriods + colors
  const fileGenerale = `json/${s.cartella}/generale.json`;
  let generale = piano.leggi(fileGenerale);
  generale = aggiungiAOggetto(generale, "subPeriods", d.periodo, `json/${s.cartella}/Periodi/${d.periodo}.json`);
  generale = aggiungiAArray(generale, "colors", d.colore);
  piano.modifica(fileGenerale, generale);

  // 4. stagioni.json: solo il blocco della stagione giusta
  let stagioni = piano.leggi(PERCORSO_STAGIONI_JSON);
  const punto = stagioni.search(new RegExp(`"name"\\s*:\\s*"${s.cartella}"`));
  if (punto === -1) throw new Error(`Stagione "${s.cartella}" non trovata in ${PERCORSO_STAGIONI_JSON}.`);
  stagioni = aggiungiAOggetto(stagioni, "subPeriods", d.periodo, `json/${s.cartella}/Periodi/${d.periodo}.json`, punto);
  piano.modifica(PERCORSO_STAGIONI_JSON, stagioni);

  // 4b. il primo giro inserito conta anche nelle statistiche dell'anno (dopo aver registrato il periodo)
  if (d.giro) contaGiroInStatistiche(piano, d.chiave, d.periodo, d.giro);

  // 5. foto: copiate come 1.jpg, 2.jpg... (così i blocchi della galleria puntano a file veri)
  if (d.fotoDaCopiare && d.fotoDaCopiare.length) {
    const img = cartellaImg();
    d.fotoDaCopiare.forEach((origine, i) => {
      piano.creaBinario(`${img}/${s.cartella}/${d.periodo}/${i + 1}.jpg`, fs.readFileSync(origine));
    });
  } else if (d.nFoto > 0) {
    piano.cartella(`${cartellaImg()}/${s.cartella}/${d.periodo}`);
    piano.promemoria.push(`Aggiungi le ${d.nFoto} foto in ${cartellaImg()}/${s.cartella}/${d.periodo}/ (1.jpg … ${d.nFoto}.jpg)`);
  } else {
    piano.promemoria.push(`Quando hai le foto: ${cartellaImg()}/${s.cartella}/${d.periodo}/1.jpg, 2.jpg… e un blocco <a class="shot"> per ognuna nella pagina ${s.cartella}/${d.periodo}.html`);
  }
};

/* ------------------------------------------------------------------ */
/* Nuovo ANNO (Statistiche)                                             */
/* ------------------------------------------------------------------ */

const raccogliAnno = async (piano, opzioni = {}) => {
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const esistenti = Object.keys(storico.anni).sort(ordinaPeriodi);
  const ultimo = esistenti[esistenti.length - 1];

  console.log(`\n${grassetto("Statistiche 📅")} ${grigio(`(ultimo anno presente: ${ultimo})`)}`);

  const anno =
    opzioni.anno ||
    (await chiediValido("Nuovo anno", String(parseInt(ultimo, 10) + 1), validaPeriodo("anno", esistenti)));
  if (opzioni.anno) {
    const errore = validaPeriodo("anno", esistenti)(anno);
    if (errore) throw new Error(`Statistiche: ${errore}`);
  }

  if ((storico.coloriAnni || []).length !== esistenti.length) {
    console.log(
      giallo(
        `  ⚠ In ${PERCORSO_STORICO_JSON} i colori (${(storico.coloriAnni || []).length}) non sono tanti quanti gli anni (${esistenti.length}): controlla l'ordine dopo la creazione.`,
      ),
    );
  }
  const colore = await chiediColore(
    `Colore dell'anno ${anno}: scrivilo tu (nome CSS, es. gold, oppure #esadecimale)`,
    storico.coloriAnni || [],
  );

  // Icona (favicon) dell'anno: la tua immagine .jpg, oppure la creo io con l'anno sul colore scelto.
  let icona = null;
  let percorsoIcona = await chiedi(
    `Immagine .jpg per l'icona del ${anno} — trascinala qui, oppure invio e la creo io con il colore dell'anno`,
    "",
  );
  while (percorsoIcona) {
    const file = pulisciPercorso(percorsoIcona);
    if (fs.existsSync(file) && fs.statSync(file).isFile() && /\.jpe?g$/i.test(file)) {
      icona = file;
      break;
    }
    console.log(rosso("  ✖ Serve un file .jpg esistente."));
    percorsoIcona = await chiedi("Prova con un altro file (invio = la creo io)", "");
  }

  let mese = "Gennaio";
  let km = 0;
  let corse = 0;
  let esempio = true;
  if (await chiediSiNo("Vuoi inserire subito il primo mese? (altrimenti metto Gennaio a 0 km da sostituire)", false)) {
    mese = await chiediValido("Mese (es. Gennaio)", "Gennaio", (v) =>
      MESI.some((m) => m.toLowerCase() === v.toLowerCase()) ? null : "Scrivi un mese in italiano.",
    );
    mese = MESI.find((m) => m.toLowerCase() === mese.toLowerCase());
    km = parseInt(await chiediValido("Km del mese", "0", (v) => (/^\d+$/.test(v) ? null : "Solo numeri interi.")), 10);
    corse = parseInt(
      await chiediValido("Numero di corse dell'anno finora", "0", (v) => (/^\d+$/.test(v) ? null : "Solo numeri interi.")),
      10,
    );
    esempio = false;
  }

  return { anno, colore, icona, mese, km, corse, esempio, ultimo };
};

const applicaAnno = (piano, d) => {
  // 1. HTML
  const modello = `Statistiche/Anni/${d.ultimo}.html`;
  const html = piano.leggi(modello);
  if (!html.includes(d.ultimo)) throw new Error(`Nel modello ${modello} non compare "${d.ultimo}".`);
  let nuovoHtml = html.split(d.ultimo).join(d.anno);
  if (nuovoHtml.includes(d.ultimo)) throw new Error(`Nel nuovo HTML è rimasto "${d.ultimo}".`);

  // Icona (favicon) dell'anno: il link nella pagina deve puntare a un file che esiste davvero.
  const img = cartellaImg();
  const linkIcona = new RegExp(`(<link\\s+rel="icon"\\s+href="/img/Statistiche/Anni/${d.anno})\\.[a-z]+(")`, "i");
  if (!linkIcona.test(nuovoHtml)) throw new Error(`Nel modello ${modello} non trovo il link dell'icona dell'anno.`);
  if (d.icona) {
    piano.creaBinario(`${img}/Statistiche/Anni/${d.anno}.jpg`, fs.readFileSync(d.icona));
    nuovoHtml = nuovoHtml.replace(linkIcona, "$1.jpg$2");
  } else {
    piano.creaBinario(`${img}/Statistiche/Anni/${d.anno}.png`, creaIconaAnno(d.anno, d.colore));
    nuovoHtml = nuovoHtml.replace(linkIcona, "$1.png$2");
    piano.promemoria.push(
      `Icona del ${d.anno} creata in ${img}/Statistiche/Anni/${d.anno}.png (l'anno scritto sul colore ${d.colore}). Se preferisci una tua foto: salvala come ${d.anno}.jpg nella stessa cartella e nella pagina Statistiche/Anni/${d.anno}.html cambia ".png" in ".jpg" nel link rel="icon".`,
    );
  }
  piano.crea(`Statistiche/Anni/${d.anno}.html`, nuovoHtml);
  if (d.esempio) piano.esempio = true;

  // 2. JSON dell'anno (la nota sui colori si copia dall'ultimo anno, così resta uguale)
  const modelloJson = leggiJson(piano, `json/Statistiche/anni/${d.ultimo}.json`);
  const nuovoJson = {
    year: d.anno,
    numberOfRaces: d.corse,
    data: { [d.mese]: d.km },
  };
  if (modelloJson._notaColori) nuovoJson._notaColori = modelloJson._notaColori;
  piano.crea(`json/Statistiche/anni/${d.anno}.json`, JSON.stringify(nuovoJson, null, 2) + "\n");

  // 3. Storico.json: anni + coloriAnni (coloriMesi non si tocca)
  let storico = piano.leggi(PERCORSO_STORICO_JSON);
  storico = aggiungiAOggetto(storico, "anni", d.anno, `json/Statistiche/anni/${d.anno}.json`);
  storico = aggiungiAArray(storico, "coloriAnni", d.colore);
  piano.modifica(PERCORSO_STORICO_JSON, storico);

};

/* ------------------------------------------------------------------ */
/* Nuovo GIRO: "il giorno X ho fatto un giro di N km"                    */
/* ------------------------------------------------------------------ */

const ALIAS_STAGIONI = {
  primavera: "Primavera",
  estate: "Estate",
  autunno: "Autunno_Inverno",
  inverno: "Autunno_Inverno",
  autunno_inverno: "Autunno_Inverno",
  "autunno-inverno": "Autunno_Inverno",
  "autunno - inverno": "Autunno_Inverno",
  "autunno inverno": "Autunno_Inverno",
};

// Mesi (0 = Gennaio) in cui di solito cadono i giri di ogni stagione: fuori da qui avviso.
const MESI_USUALI = {
  Primavera: [2, 3, 4, 5],
  Estate: [4, 5, 6, 7, 8, 9],
  Autunno_Inverno: [9, 10, 11, 0, 1, 2, 3],
};

const trovaStagione = (testo) => ALIAS_STAGIONI[String(testo || "").trim().toLowerCase().replace(/[_·]/g, "-")] || null;

// Accetta: "22 Novembre", "22 novembre 2026", "22/11", "22/11/2026", "2026-11-22".
// Ritorna { giorno, mese (0-11), anno } oppure un messaggio d'errore (stringa).
const leggiData = (testo, annoPredefinito) => {
  const t = String(testo || "").trim();
  let giorno, mese, anno;
  let m;
  if ((m = t.match(/^(\d{1,2})\s+([A-Za-zàèéìòù]+)(?:\s+(\d{4}))?$/))) {
    giorno = parseInt(m[1], 10);
    mese = MESI.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
    anno = m[3] ? parseInt(m[3], 10) : annoPredefinito;
    if (mese === -1) return `"${m[2]}" non è un mese italiano.`;
  } else if ((m = t.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{4}))?$/))) {
    giorno = parseInt(m[1], 10);
    mese = parseInt(m[2], 10) - 1;
    anno = m[3] ? parseInt(m[3], 10) : annoPredefinito;
  } else if ((m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) {
    anno = parseInt(m[1], 10);
    mese = parseInt(m[2], 10) - 1;
    giorno = parseInt(m[3], 10);
  } else {
    return "Scrivi la data come 22 Novembre, 22 Novembre 2026 oppure 22/11/2026.";
  }
  const d = new Date(anno, mese, giorno);
  if (d.getFullYear() !== anno || d.getMonth() !== mese || d.getDate() !== giorno) {
    return `Il ${giorno} ${MESI[mese] || "?"} ${anno} non esiste.`;
  }
  return { giorno, mese, anno };
};

// Periodo (nome del file) in cui cade un giro di una certa stagione.
// Primavera/Estate: l'anno. Autunno-Inverno: da Settembre in poi è il primo anno
// del biennio (2026-2027), fino ad Agosto è il secondo (Gennaio 2027 -> 2026-2027).
const periodoDelGiro = (chiave, { mese, anno }) => {
  if (STAGIONI[chiave].formato === "anno") return String(anno);
  return mese >= 8 ? `${anno}-${anno + 1}` : `${anno - 1}-${anno}`;
};

// Anno "vero" (di calendario) di un giro già salvato in un periodo.
const annoDelGiroInPeriodo = (chiave, periodo, mese) => {
  if (STAGIONI[chiave].formato === "anno") return parseInt(periodo, 10);
  const [a, b] = periodo.split("-").map((x) => parseInt(x, 10));
  return mese >= 8 ? a : b;
};

// Posizione cronologica dentro il periodo (per tenere i giri in ordine di data).
const ordineNelPeriodo = (chiave, giorno, mese) => {
  const m = STAGIONI[chiave].formato === "biennio" ? (mese >= 8 ? mese - 8 : mese + 4) : mese;
  return m * 100 + giorno;
};

const leggiDataSalvata = (testo) => {
  const m = String(testo).match(/^(\d{1,2})\s+(\S+)/);
  if (!m) return null;
  const mese = MESI.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  return mese === -1 ? null : { giorno: parseInt(m[1], 10), mese };
};

// Trova gli oggetti { ... } di primo livello dentro l'array JSON (sapendo saltare le stringhe).
const oggettiDellArray = (testo) => {
  const inizioArray = testo.indexOf("[");
  if (inizioArray === -1) throw new Error("Il file dei giri non è un elenco [ ... ].");
  const out = [];
  let profondita = 0;
  let inStringa = false;
  let inizio = -1;
  for (let i = inizioArray + 1; i < testo.length; i++) {
    const ch = testo[i];
    if (inStringa) {
      if (ch === "\\") i++;
      else if (ch === '"') inStringa = false;
      continue;
    }
    if (ch === '"') inStringa = true;
    else if (ch === "{") {
      if (profondita === 0) inizio = i;
      profondita++;
    } else if (ch === "}") {
      profondita--;
      if (profondita === 0) out.push({ inizio, fine: i });
    } else if (ch === "]" && profondita === 0) break;
  }
  return { inizioArray, oggetti: out };
};

// Inserisce il giro nel testo del JSON del periodo, al posto giusto per data,
// senza toccare il resto del file. Ritorna { testo, posizione }.
const inserisciGiro = (testo, chiave, giro, giorno, mese) => {
  const { inizioArray, oggetti } = oggettiDellArray(testo);
  const blocco = JSON.stringify(giro, null, 2);
  if (!oggetti.length) {
    const dentro = blocco.split("\n").map((r) => `  ${r}`).join("\n");
    return { testo: `${testo.slice(0, inizioArray)}[\n${dentro}\n]${testo.slice(testo.indexOf("]", inizioArray) + 1)}`, posizione: 0 };
  }
  const nuovo = ordineNelPeriodo(chiave, giorno, mese);
  let indice = oggetti.length; // di default in fondo
  for (let i = 0; i < oggetti.length; i++) {
    const salvato = JSON.parse(testo.slice(oggetti[i].inizio, oggetti[i].fine + 1));
    const d = leggiDataSalvata(salvato.date);
    if (d && ordineNelPeriodo(chiave, d.giorno, d.mese) > nuovo) {
      indice = i;
      break;
    }
  }
  const rientroDi = (pos) => testo.slice(testo.lastIndexOf("\n", pos - 1) + 1, pos).match(/^[ \t]*/)[0];
  // rientro "normale" del file = quello più frequente (così un giro scritto a mano storto non fa scuola)
  const conteggio = {};
  oggetti.forEach((o) => {
    const r = rientroDi(o.inizio);
    conteggio[r] = (conteggio[r] || 0) + 1;
  });
  const rientro = Object.keys(conteggio).sort((a, b) => conteggio[b] - conteggio[a])[0];
  const corpo = blocco.split("\n").join(`\n${rientro}`);
  if (indice < oggetti.length) {
    // inserisco una riga intera prima del giro successivo: il suo rientro non cambia
    const p = oggetti[indice].inizio;
    const inizioRiga = testo.lastIndexOf("\n", p - 1) + 1;
    return { testo: `${testo.slice(0, inizioRiga)}${rientro}${corpo},\n${testo.slice(inizioRiga)}`, posizione: indice };
  }
  const ultimo = oggetti[oggetti.length - 1];
  return { testo: `${testo.slice(0, ultimo.fine + 1)},\n${rientro}${corpo}${testo.slice(ultimo.fine + 1)}`, posizione: oggetti.length };
};

// Km di un mese di un anno secondo i giri salvati (somma di tutte le stagioni).
const kmDaiGiri = (piano, anno, mese) => {
  let totale = 0;
  let numero = 0;
  for (const chiave of Object.keys(STAGIONI)) {
    const generale = leggiJson(piano, `json/${STAGIONI[chiave].cartella}/generale.json`);
    for (const [periodo, file] of Object.entries(generale.subPeriods)) {
      for (const giro of leggiJson(piano, file)) {
        const d = leggiDataSalvata(giro.date);
        if (d && d.mese === mese && annoDelGiroInPeriodo(chiave, periodo, d.mese) === anno) {
          totale += Number(giro.distance) || 0;
          numero++;
        }
      }
    }
  }
  return { km: totale, giri: numero };
};

// Aggiorna il JSON dell'anno: somma (o imposta) i km del mese — creandolo se non c'è —
// e aggiunge `corse` alle corse dell'anno. Cambia solo le righe necessarie.
const aggiornaAnno = (piano, anno, mese, km, { corse = 0, sostituisci = false } = {}) => {
  const file = `json/Statistiche/anni/${anno}.json`;
  if (!piano.esiste(file)) {
    throw new Error(`Non esiste ancora l'anno ${anno} (${file}). Crealo prima con: node scripts/nuovo.js → "Un nuovo ANNO di Statistiche".`);
  }
  let testo = piano.leggi(file);
  const dati = JSON.parse(testo);
  const nome = MESI[mese];
  const prima = Object.prototype.hasOwnProperty.call(dati.data, nome) ? Number(dati.data[nome]) : null;
  const dopo = sostituisci || prima === null ? km : prima + km;

  if (prima !== null) {
    const { inizio, fine } = trovaBlocco(testo, "data", "{", "}");
    const corpo = testo.slice(inizio, fine).replace(new RegExp(`("${nome}"\\s*:\\s*)-?\\d+(\\.\\d+)?`), `$1${dopo}`);
    testo = testo.slice(0, inizio) + corpo + testo.slice(fine);
  } else {
    // Mese nuovo: lo metto al suo posto nell'ordine del calendario.
    const successivo = Object.keys(dati.data)
      .map((k) => ({ k, i: MESI.indexOf(k) }))
      .filter((x) => x.i > mese)
      .sort((a, b) => a.i - b.i)[0];
    if (successivo) {
      const re = new RegExp(`"${successivo.k}"\\s*:`);
      const m = re.exec(testo);
      const rientro = testo.slice(testo.lastIndexOf("\n", m.index - 1) + 1, m.index);
      const sep = /^[ \t]*$/.test(rientro) && testo.lastIndexOf("\n", m.index - 1) !== -1 ? `\n${rientro}` : " ";
      testo = `${testo.slice(0, m.index)}"${nome}": ${dopo},${sep}${testo.slice(m.index)}`;
    } else {
      const { inizio, fine } = trovaBlocco(testo, "data", "{", "}");
      testo = accoda(testo, inizio, fine, `"${nome}": ${dopo}`);
    }
  }

  const corseDopo = Number(dati.numberOfRaces) + corse;
  if (corse) testo = testo.replace(/("numberOfRaces"\s*:\s*)\d+/, `$1${corseDopo}`);
  piano.modifica(file, testo);
  return { file, prima, dopo, creato: prima === null, corsePrima: Number(dati.numberOfRaces), corseDopo };
};

const controllaCoerenza = (piano, anno, mese, kmMeseAnno) => {
  const { km, giri } = kmDaiGiri(piano, anno, mese);
  if (km !== kmMeseAnno) {
    piano.avvisi.push(
      `${MESI[mese]} ${anno}: nelle statistiche ci sono ${kmMeseAnno} km, ma i giri salvati (${giri}) ne sommano ${km}. Può essere una differenza che c'era già: controlla.`,
    );
  }
};

const raccogliGiro = async (piano) => {
  const oggi = new Date();
  const annoOggi = oggi.getFullYear();

  let chiave = opzione("stagione") !== undefined ? trovaStagione(opzione("stagione")) : null;
  if (opzione("stagione") !== undefined && !chiave) {
    throw new Error(`Stagione "${opzione("stagione")}" non riconosciuta (usa Primavera, Estate o Autunno_Inverno).`);
  }
  if (!chiave) {
    chiave = (
      await scegli(
        "In quale stagione è il giro?",
        Object.entries(STAGIONI).map(([k, v]) => ({ chiave: k, testo: v.etichetta })),
      )
    ).chiave;
  }
  const s = STAGIONI[chiave];

  const sceltaData = async () => {
    const dataOpt = opzione("data");
    if (dataOpt !== undefined) {
      const r = leggiData(dataOpt, annoOggi);
      if (typeof r === "string") throw new Error(r);
      return r;
    }
    const oggiTesto = `${oggi.getDate()} ${MESI[oggi.getMonth()]} ${annoOggi}`;
    const r = await chiediValido("Data del giro (es. 22 Novembre 2026)", oggiTesto, (v) => {
      const x = leggiData(v, annoOggi);
      return typeof x === "string" ? x : null;
    });
    return leggiData(r, annoOggi);
  };
  const data = await sceltaData();

  const luogo =
    opzione("luogo") ?? (await chiediValido("Luogo (come comparirà nella tabella)", "", (v) => (v ? null : "Il luogo è obbligatorio.")));
  if (!luogo.trim()) throw new Error("Il luogo è obbligatorio.");

  const validaLink = (v) => (!v ? null : /^https?:\/\/[^\s"<>]+$/i.test(v) ? null : "Il link deve iniziare con http:// o https:// e non avere spazi.");
  let link = opzione("link");
  if (link === undefined && SI) link = ""; // con --si non faccio domande
  if (link === undefined) link = await chiediValido("Link al percorso (Komoot, invio per non metterlo)", "", validaLink);
  const erroreLink = validaLink(link);
  if (erroreLink) throw new Error(erroreLink);

  const validaKm = (v) => (/^\d+$/.test(String(v)) && Number(v) > 0 ? null : "Scrivi i km come numero intero maggiore di 0 (es. 95).");
  let kmTesto = opzione("km");
  if (kmTesto === undefined) kmTesto = await chiediValido("Distanza in km", "", validaKm);
  const erroreKm = validaKm(kmTesto);
  if (erroreKm) throw new Error(erroreKm);

  return { chiave, s, data, luogo: luogo.trim(), link: link.trim(), km: parseInt(kmTesto, 10) };
};

const applicaGiro = async (piano, d) => {
  const { chiave, s, data, luogo, link, km } = d;
  const periodo = periodoDelGiro(chiave, data);
  const fileGiri = `json/${s.cartella}/Periodi/${periodo}.json`;
  if (!piano.esiste(fileGiri)) {
    throw new Error(
      `Non esiste ancora il periodo ${s.testo} ${periodo} (${fileGiri}). Crealo prima con: node scripts/nuovo.js → "Una nuova STAGIONE".`,
    );
  }
  const nomeData = `${String(data.giorno).padStart(2, "0")} ${MESI[data.mese]}`;

  // avvisi (non bloccanti, ma l'utente li vede prima di confermare)
  if (!MESI_USUALI[chiave].includes(data.mese)) {
    piano.avvisi.push(`${MESI[data.mese]} è insolito per ${s.testo}: controlla di aver scelto la stagione giusta.`);
  }
  if (new Date(data.anno, data.mese, data.giorno) > new Date()) {
    piano.avvisi.push(`La data ${nomeData} ${data.anno} è nel futuro.`);
  }
  const giriEsistenti = leggiJson(piano, fileGiri);
  const doppio = giriEsistenti.find((g) => g.date === nomeData && Number(g.distance) === km);
  if (doppio) {
    piano.avvisi.push(`Nel periodo c'è già un giro del ${nomeData} di ${km} km: se è lo stesso, non confermare.`);
  }

  // 1. il giro nel file del periodo, in ordine di data
  const place = link ? `<a href="${link}" target="_blank">${luogo}</a>` : luogo;
  const giro = { date: nomeData, place, distance: km };
  const { testo, posizione } = inserisciGiro(piano.leggi(fileGiri), chiave, giro, data.giorno, data.mese);
  piano.modifica(fileGiri, testo);

  // 2 + 3. km nel mese giusto dell'anno giusto e una corsa in più
  const ris = aggiornaAnno(piano, data.anno, data.mese, km, { corse: 1 });
  controllaCoerenza(piano, data.anno, data.mese, ris.dopo);

  piano.note.push(
    grassetto(`Il giorno ${nomeData} ${data.anno} (${s.testo} ${periodo}) hai fatto un giro di ${km} km${link ? " con il link al percorso" : ""}: ${luogo}`),
    `• ${fileGiri}: aggiunto in posizione ${posizione + 1} di ${giriEsistenti.length + 1} (in ordine di data)`,
    ris.creato
      ? `• ${ris.file}: ${MESI[data.mese]} non c'era, lo creo con ${km} km`
      : `• ${ris.file}: ${MESI[data.mese]} ${ris.prima} → ${ris.dopo} km (+${km})`,
    `• ${ris.file}: corse dell'anno ${ris.corsePrima} → ${ris.corseDopo} (+1)`,
  );
};

/* ------------------------------------------------------------------ */
/* MESE: aggiungere (o correggere) un mese in un anno già esistente      */
/* ------------------------------------------------------------------ */

const raccogliMese = async (piano) => {
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const anni = Object.keys(storico.anni).sort(ordinaPeriodi);
  const anno = await chiediValido("Anno", anni[anni.length - 1], (v) => (anni.includes(v) ? null : `Anni disponibili: ${anni.join(", ")}.`));
  const dati = leggiJson(piano, `json/Statistiche/anni/${anno}.json`).data;
  console.log(grigio(`  Mesi già presenti nel ${anno}: ${Object.keys(dati).join(", ") || "nessuno"}`));
  const nome = await chiediValido("Mese (es. Dicembre)", "", (v) => (MESI.some((m) => m.toLowerCase() === v.toLowerCase()) ? null : "Scrivi un mese in italiano."));
  const mese = MESI.findIndex((m) => m.toLowerCase() === nome.toLowerCase());

  let sostituisci = false;
  if (Object.prototype.hasOwnProperty.call(dati, MESI[mese])) {
    const modo = await scegli(`${MESI[mese]} ${anno} c'è già (${dati[MESI[mese]]} km). Cosa faccio?`, [
      { tasto: 1, testo: "Sommo i km a quelli che ci sono" },
      { tasto: 2, testo: "Sostituisco i km con il nuovo valore" },
    ]);
    sostituisci = modo.tasto === 2;
  } else {
    console.log(grigio(`  ${MESI[mese]} non c'è ancora: lo creo.`));
  }
  const km = parseInt(await chiediValido("Km", "", (v) => (/^\d+$/.test(v) ? null : "Solo numeri interi.")), 10);
  const corse = parseInt(
    await chiediValido("Corse da aggiungere al totale dell'anno (0 = non cambiare)", "0", (v) => (/^\d+$/.test(v) ? null : "Solo numeri interi.")),
    10,
  );
  return { anno: parseInt(anno, 10), mese, km, corse, sostituisci };
};

const applicaMese = (piano, d) => {
  const ris = aggiornaAnno(piano, d.anno, d.mese, d.km, { corse: d.corse, sostituisci: d.sostituisci });
  piano.note.push(
    grassetto(`${MESI[d.mese]} ${d.anno}`),
    ris.creato ? `• mese nuovo con ${ris.dopo} km` : `• ${ris.prima} → ${ris.dopo} km`,
    ...(d.corse ? [`• corse dell'anno ${ris.corsePrima} → ${ris.corseDopo}`] : []),
  );
  controllaCoerenza(piano, d.anno, d.mese, ris.dopo);
};

/* ------------------------------------------------------------------ */
/* FOTO: aggiungere immagini a un periodo di stagione già esistente      */
/* ------------------------------------------------------------------ */

const raccogliFoto = async (piano) => {
  const chiave = (
    await scegli(
      "A quale stagione vuoi aggiungere le foto?",
      Object.entries(STAGIONI).map(([k, v]) => ({ chiave: k, testo: v.etichetta })),
    )
  ).chiave;
  const s = STAGIONI[chiave];
  const periodi = Object.keys(leggiJson(piano, `json/${s.cartella}/generale.json`).subPeriods).sort(ordinaPeriodi);
  const periodo = await chiediValido(`Periodo (${periodi.join(", ")})`, periodi[periodi.length - 1], (v) =>
    periodi.includes(v) ? null : `Scegli tra: ${periodi.join(", ")}.`,
  );

  let foto = [];
  let percorso = await chiedi("Cartella con le foto (.jpg) — trascinala qui", "");
  for (;;) {
    if (!percorso) throw new Error("Nessuna cartella indicata.");
    const dir = pulisciPercorso(percorso);
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const r = elencaFoto(dir);
      if (r.ignorati.length) console.log(giallo(`  ⚠ Ignoro ${r.ignorati.length} file non .jpg: ${r.ignorati.slice(0, 5).join(", ")}`));
      if (r.foto.length) {
        foto = r.foto;
        break;
      }
      console.log(rosso("  ✖ In quella cartella non ci sono file .jpg."));
    } else {
      console.log(rosso("  ✖ Cartella non trovata."));
    }
    percorso = await chiedi("Prova con un'altra cartella", "");
  }
  return { chiave, s, periodo, foto };
};

const applicaFoto = (piano, d) => {
  const { s, periodo, foto } = d;
  const fileHtml = `${s.cartella}/${periodo}.html`;
  let html = piano.leggi(fileHtml);
  const gal = html.match(/(<div class="gallery">)([\s\S]*?)(\n[ \t]*<\/div>)/);
  if (!gal) throw new Error(`In ${fileHtml} non trovo <div class="gallery">.`);

  // le nuove foto continuano la numerazione: non sovrascrivo mai quelle che ci sono
  const img = cartellaImg();
  const cartellaFoto = `${img}/${s.cartella}/${periodo}`;
  const nelHtml = (gal[2].match(/class="shot"/g) || []).length;
  let nelleCartella = 0;
  if (fs.existsSync(piano.assoluto(cartellaFoto))) {
    for (const n of fs.readdirSync(piano.assoluto(cartellaFoto))) {
      const m = n.match(/^(\d+)\.jpe?g$/i);
      if (m) nelleCartella = Math.max(nelleCartella, parseInt(m[1], 10));
    }
  }
  const primo = Math.max(nelHtml, nelleCartella) + 1;

  const rientroDiv = html.slice(html.lastIndexOf("\n", gal.index) + 1, gal.index);
  const r1 = `${rientroDiv}  `;
  const r2 = `${r1}  `;
  const r3 = `${r2}  `;
  const blocchi = foto.map((origine, i) => {
    const n = primo + i;
    piano.creaBinario(`${cartellaFoto}/${n}.jpg`, fs.readFileSync(origine));
    const src = `/img/${s.cartella}/${periodo}/${n}.jpg`;
    return [
      `${r1}<a`,
      `${r2}class="shot"`,
      `${r2}href="${src}"`,
      `${r2}download`,
      `${r2}target="_blank"`,
      `${r2}rel="noopener"`,
      `${r1}>`,
      `${r2}<img`,
      `${r3}class="immagine"`,
      `${r3}src="${src}"`,
      `${r3}alt="Foto ${s.testo} ${periodo} numero ${n}"`,
      `${r3}loading="lazy"`,
      `${r2}/>`,
      `${r1}</a>`,
    ].join("\n");
  });

  // tolgo il commento segnaposto della galleria vuota, se c'è
  const dentro = gal[2].replace(/\n[ \t]*<!-- Foto:[\s\S]*?-->/, "");
  html = html.slice(0, gal.index) + gal[1] + dentro + "\n" + blocchi.join("\n") + gal[3] + html.slice(gal.index + gal[0].length);
  piano.modifica(fileHtml, html);

  piano.note.push(
    grassetto(`${foto.length} foto in ${s.testo} ${periodo}`),
    `• copiate in ${cartellaFoto}/ come ${primo}.jpg … ${primo + foto.length - 1}.jpg (nell'ordine dei nomi)`,
    `• ${fileHtml}: aggiunti ${foto.length} blocchi alla galleria`,
  );
};

/* ------------------------------------------------------------------ */
/* Riepilogo e scrittura                                                */
/* ------------------------------------------------------------------ */

const mostraRiepilogo = (piano) => {
  console.log(`\n${grassetto("Riepilogo")}`);
  piano.note.forEach((n) => console.log(`  ${n}`));
  piano.avvisi.forEach((n) => console.log(`  ${giallo(`⚠ ${n}`)}`));
  if (piano.note.length || piano.avvisi.length) console.log("");
  [...piano.creati].forEach((f) => console.log(`  ${verde("+ crea     ")} ${f}`));
  [...piano.cartelle].forEach((f) => console.log(`  ${verde("+ cartella ")} ${f}/`));
  [...piano.modificati].forEach((f) => console.log(`  ${giallo("~ aggiorna ")} ${f}`));
};

const conferma = async (piano) => {
  piano.valida();
  mostraRiepilogo(piano);
  if (PROVA) {
    console.log(`\n${giallo("Modalità --prova: non è stato scritto nessun file.")}`);
    return false;
  }
  console.log("");
  if (!SI && !(await chiediSiNo("Confermi? Scrivo i file", true))) {
    console.log(giallo("Annullato: non è stato scritto nessun file."));
    return false;
  }
  piano.scrivi();
  console.log(`\n${verde("✔ Fatto.")}`);
  if (piano.promemoria.length) {
    console.log(`\n${grassetto("Da fare a mano:")}`);
    piano.promemoria.forEach((p) => console.log(`  • ${p}`));
  }
  if (piano.esempio) console.log(`\n${grigio("Sostituisci il giro/mese d'esempio con i dati veri quando li hai.")}`);
  return true;
};

/* ------------------------------------------------------------------ */
/* Programma                                                            */
/* ------------------------------------------------------------------ */

const principale = async () => {
  if (!fs.existsSync(path.join(RADICE, "json/Statistiche/History/Storico.json"))) {
    console.error(rosso(`Non sembra la cartella di Giri in Bici: ${RADICE}`));
    process.exit(1);
  }

  console.log(grassetto("\n🚴 Giri in Bici — aggiornamento guidato"));
  console.log(grigio(`Cartella: ${RADICE}${PROVA ? "  (modalità --prova)" : ""}`));

  const azione = MODO_GIRO
    ? { tasto: 4 }
    : await scegli("Cosa vuoi fare?", [
        { tasto: 4, testo: "Aggiungere un GIRO (data, stagione, luogo, link, km → aggiorna giri, km del mese e corse)" },
        { tasto: 5, testo: "Aggiungere o correggere un MESE di un anno (lo crea se non c'è)" },
        { tasto: 6, testo: "Aggiungere FOTO a una stagione già esistente (indichi la cartella)" },
        { tasto: 1, testo: "Creare una nuova STAGIONE (Primavera, Estate o Autunno-Inverno)" },
        { tasto: 2, testo: "Creare un nuovo ANNO di Statistiche" },
        { tasto: 3, testo: "Creare un nuovo anno COMPLETO (Statistiche + Primavera + Estate + Autunno-Inverno)" },
        { tasto: 0, testo: "Esci" },
      ]);
  if (azione.tasto === 0) return;

  const piano = new Piano();

  if (azione.tasto === 4) {
    await applicaGiro(piano, await raccogliGiro(piano));
  } else if (azione.tasto === 6) {
    applicaFoto(piano, await raccogliFoto(piano));
  } else if (azione.tasto === 5) {
    applicaMese(piano, await raccogliMese(piano));
  } else if (azione.tasto === 1) {
    const s = await scegli(
      "Quale stagione?",
      Object.entries(STAGIONI).map(([chiave, v]) => ({ chiave, testo: v.etichetta })),
    );
    applicaStagione(piano, await raccogliStagione(piano, s.chiave));
  } else if (azione.tasto === 2) {
    applicaAnno(piano, await raccogliAnno(piano));
  } else {
    const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
    const ultimo = Object.keys(storico.anni).sort(ordinaPeriodi).pop();
    const anno = await chiediValido("Anno da creare", String(parseInt(ultimo, 10) + 1), validaPeriodo("anno", Object.keys(storico.anni)));
    const n = parseInt(anno, 10);
    applicaAnno(piano, await raccogliAnno(piano, { anno }));
    applicaStagione(piano, await raccogliStagione(piano, "Primavera", { periodo: String(n) }));
    applicaStagione(piano, await raccogliStagione(piano, "Estate", { periodo: String(n) }));
    applicaStagione(piano, await raccogliStagione(piano, "Autunno_Inverno", { periodo: `${n}-${n + 1}` }));
  }

  await conferma(piano);
};

principale()
  .catch((e) => {
    if (e instanceof Uscita) {
      console.log(giallo("\nInterrotto: non è stato scritto nessun file."));
    } else {
      console.error(rosso(`\n✖ ${e.message}`));
      console.error(grigio("Non è stato scritto nessun file."));
      process.exitCode = 1;
    }
  })
  .finally(() => rl.close());
