function nomeFile(nome) {
  return nome.replace(/\s+/g, "_");
}
const RE_TOKEN = /\{([A-Z][A-Z0-9_]{1,63})\}/g;
const codiciNelLuogo = (luogo) => [
  ...new Set([...String(luogo).matchAll(RE_TOKEN)].map((m) => m[1])),
];
// Da <img src="/img/Icons/..."> al codice: accetta il percorso nuovo (Bandiere/Austria/Austria)
// e quello vecchio (Austria), così i giri già salvati continuano a funzionare.
const codiceDaFile = (percorso) => {
  const p = String(percorso)
    .replace(/^Bandiere\//i, "")
    .toLowerCase();
  return leggiBandierePersonalizzate().find((b) => {
    const senzaEstensione = b.file.replace(/\.[^.]+$/, "").toLowerCase();
    return (
      senzaEstensione === p ||
      path.parse(b.file).name.toLowerCase() === nomeFile(p) ||
      nomeFile(b.nome).toLowerCase() === nomeFile(p)
    );
  })?.codice;
};
const imgTag = (codice) =>
  `<img src="${immagineBandiera(codice).url}" alt="${esc(nomePaese(codice))}">`;

// Ogni bandiera usata nel luogo deve avere la sua immagine nella cartella del sito.
const verificaBandiere = (luogo) => {
  for (const c of codiciNelLuogo(luogo)) {
    const { rel } = immagineBandiera(c);
    if (!fs.existsSync(path.join(RADICE, rel)))
      throw new Error(
        `Manca il file della bandiera ${nomePaese(c)} (${rel}). Ricaricalo dalla sezione Bandiere.`,
      );
  }
};

// Controlla e pulisce i dati arrivati dal browser.
const normalizzaLuogo = ({ luogo, link, links }, prefisso = "") => {
  const nome = String(luogo || "").trim();
  if (!nome) throw new Error(`${prefisso}Il luogo è obbligatorio.`);
  if (/[<>]/.test(nome))
    throw new Error(`${prefisso}Il luogo non può contenere i simboli < e >.`);
  const codiciValidi = new Set(
    leggiBandierePersonalizzate().map((b) => b.codice),
  );
  const ignoto = codiciNelLuogo(nome).find((c) => !codiciValidi.has(c));
  if (ignoto)
    throw new Error(
      `${prefisso}Bandiera sconosciuta {${ignoto}}: creala nella sezione Bandiere.`,
    );
  if (/\{|\}/.test(nome.replace(RE_TOKEN, "")))
    throw new Error(
      `${prefisso}Le graffe servono solo per le bandiere, come {CUSTOM_SLOVENIA}.`,
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
    /<img\b[^>]*src=["']\/?img\/Icons\/([^"']+?)\.(?:png|jpe?g|webp|svg)["'][^>]*>/gi,
    (m, nome) => {
      const c = codiceDaFile(decodeURIComponent(nome));
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
