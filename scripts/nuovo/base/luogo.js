"use strict";

const fs = require("fs");
const path = require("path");
const { RADICE } = require("./impostazioni");

// Luogo di un giro: nome + eventuali bandiere + uno o più link (ciascuno con il suo titolo).
//
// Come nei giri già presenti nei JSON, la bandiera sta nel testo, subito dopo il posto a cui si riferisce:
//   "Da Tarvisio a Bled {SI} e Lubiana {SI}"   →   <img src="/img/Icons/Slovenia.png" alt="Slovenia"> al posto di {SI}
// {XX} è il codice del paese (SI, AT, HR…). L'immagine sta in Img/Icons/<Paese>.png|svg: se non c'è
// (Slovenia.png e Austria.png ci sono già) il programma la CREA copiandola da scripts/nuovo/base/bandiere/.
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

// I testi si scrivono come stanno (apostrofi e & compresi), come nei giri già presenti: < e > sono vietati a monte.
const esc = (s) => String(s);
const unesc = (s) =>
  String(s)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const validaLink = (url) => /^https?:\/\/[^\s"<>]+$/i.test(url);

const NOME_PAESE = Object.fromEntries(PAESI.map((p) => [p.codice, p.nome]));
const CODICE_DA_FILE = Object.fromEntries(
  PAESI.map((p) => [nomeFile(p.nome), p.codice]),
);
function nomeFile(nome) {
  return nome.replace(/\s+/g, "_");
}
const RE_TOKEN = /\{([A-Z]{2})\}/g;
const codiciNelLuogo = (luogo) => [
  ...new Set([...String(luogo).matchAll(RE_TOKEN)].map((m) => m[1])),
];

// Dove sta (o starà) l'immagine della bandiera: Img/Icons/<Paese>.png se esiste già, altrimenti .svg
const immagineBandiera = (codice) => {
  const base = nomeFile(NOME_PAESE[codice]);
  const png = `Img/Icons/${base}.png`;
  const rel = fs.existsSync(path.join(RADICE, png))
    ? png
    : `Img/Icons/${base}.svg`;
  return { rel, url: "/" + rel.replace(/^Img\//, "img/") };
};
const imgTag = (codice) =>
  `<img src="${immagineBandiera(codice).url}" alt="${esc(NOME_PAESE[codice])}">`;

// I file bandiera che mancano nella cartella del sito: [{ rel, testo }], da creare insieme al giro.
const bandiereMancanti = (luogo) =>
  codiciNelLuogo(luogo)
    .map((c) => ({ c, rel: immagineBandiera(c).rel }))
    .filter(({ rel }) => !fs.existsSync(path.join(RADICE, rel)))
    .map(({ c, rel }) => {
      const origine = path.join(
        __dirname,
        "bandiere",
        `${c.toLowerCase()}.svg`,
      );
      if (!fs.existsSync(origine))
        throw new Error(
          `Manca l'immagine della bandiera ${c} in scripts/nuovo/base/bandiere.`,
        );
      return { rel, testo: fs.readFileSync(origine, "utf8") };
    });

// Controlla e pulisce i dati arrivati dal browser.
const normalizzaLuogo = ({ luogo, link, links }, prefisso = "") => {
  const nome = String(luogo || "").trim();
  if (!nome) throw new Error(`${prefisso}Il luogo è obbligatorio.`);
  if (/[<>]/.test(nome))
    throw new Error(`${prefisso}Il luogo non può contenere i simboli < e >.`);
  const ignoto = codiciNelLuogo(nome).find((c) => !CODICI.has(c));
  if (ignoto)
    throw new Error(
      `${prefisso}Paese sconosciuto per la bandiera {${ignoto}}.`,
    );
  if (/\{|\}/.test(nome.replace(RE_TOKEN, "")))
    throw new Error(
      `${prefisso}Le graffe servono solo per le bandiere, come {SI}.`,
    );
  const grezzi = Array.isArray(links)
    ? links
    : link
      ? [{ title: "", url: link }]
      : [];
  const lista = grezzi
    .map((l) => ({
      title: String(l.title || "").trim(),
      url: String(l.url || "").trim(),
    }))
    .filter((l) => l.url || l.title);
  for (const l of lista) {
    if (!validaLink(l.url))
      throw new Error(
        `${prefisso}Il link "${l.title || l.url}" deve iniziare con http:// o https:// e non avere spazi.`,
      );
    if (/[<>]/.test(l.title))
      throw new Error(
        `${prefisso}Il titolo di un link non può contenere < o >.`,
      );
  }
  if (lista.length > 1 && lista.some((l) => !l.title))
    throw new Error(
      `${prefisso}Con più link ogni link deve avere il suo titolo (es. Andata, Ritorno).`,
    );
  return { luogo: nome, links: lista, flags: codiciNelLuogo(nome) };
};

const costruisciPlace = ({ luogo, links = [] }) => {
  const nome = esc(luogo).replace(RE_TOKEN, (_, c) => imgTag(c));
  const a = (l, testo) => `<a href="${l.url}" target="_blank">${testo}</a>`; // come nei giri già presenti (l'url è già controllato: niente virgolette né < >)
  if (!links.length) return nome;
  if (links.length === 1 && !links[0].title) return a(links[0], nome);
  return `${nome} <br>${links.map((l) => a(l, esc(l.title))).join("<br>")}`;
};

// Operazione inversa: legge il `place` già nel JSON (anche quelli vecchi) e restituisce i campi.
// Le immagini di bandiera tornano {XX}; ogni altra immagine o tag sparisce dal nome.
const leggiPlace = (place) => {
  const testo = String(place || "").replace(
    /<img\b[^>]*src=["']\/?img\/Icons\/([^"']+?)\.(?:png|svg)["'][^>]*>/gi,
    (m, nome) => {
      const c = CODICE_DA_FILE[nomeFile(decodeURIComponent(nome))];
      return c ? `{${c}}` : "";
    },
  );
  const links = [];
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(testo)))
    links.push({ title: unesc(m[2]), url: unesc(m[1]) });
  const primoTag = testo.search(/<a\b|<br/i);
  let luogo;
  if (links.length === 1 && /^\s*<a\b/i.test(testo)) {
    luogo = links[0].title;
    links[0].title = "";
  } else luogo = unesc(primoTag === -1 ? testo : testo.slice(0, primoTag));
  return { luogo, links, flags: codiciNelLuogo(luogo) };
};

module.exports = {
  PAESI,
  bandiera,
  immagineBandiera,
  bandiereMancanti,
  codiciNelLuogo,
  normalizzaLuogo,
  costruisciPlace,
  leggiPlace,
};
