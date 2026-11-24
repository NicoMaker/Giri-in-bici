function nomeFile(nome) {
  return nome.replace(/\s+/g, "_");
}
const RE_TOKEN = /\{([A-Z][A-Z0-9_]{1,63})\}/g;
const codiciNelLuogo = (luogo) => [
  ...new Set([...String(luogo).matchAll(RE_TOKEN)].map((m) => m[1])),
];
const codiceDaFile = (base) =>
  PAESI.find((p) => nomeFile(p.nome).toLowerCase() === base.toLowerCase())
    ?.codice ||
  leggiBandierePersonalizzate().find(
    (p) => path.parse(p.file).name.toLowerCase() === base.toLowerCase(),
  )?.codice;

// Dove sta l'immagine: le bandiere create dall'app riusano il file caricato in Img/Icons.
const immagineBandiera = (codice) => {
  const personalizzata = paesePersonalizzato(codice);
  if (personalizzata) {
    const rel = `Img/Icons/${personalizzata.file}`;
    return { rel, url: "/" + rel };
  }
  const paese = PAESI.find((p) => p.codice === codice);
  if (!paese) throw new Error(`Bandiera non riconosciuta: ${codice}.`);
  const base = nomeFile(paese.nome);
  const png = `Img/Icons/${base}.png`;
  const rel = fs.existsSync(path.join(RADICE, png))
    ? png
    : `Img/Icons/${base}.svg`;
  return { rel, url: "/" + rel };
};
const imgTag = (codice) =>
  `<img src="${immagineBandiera(codice).url}" alt="${esc(nomePaese(codice))}">`;

// I file bandiera che mancano nella cartella del sito: [{ rel, testo }], da creare insieme al giro.
const bandiereMancanti = (luogo) =>
  codiciNelLuogo(luogo)
    .map((c) => ({ c, rel: immagineBandiera(c).rel }))
    .filter(({ rel }) => !fs.existsSync(path.join(RADICE, rel)))
    .map(({ c, rel }) => {
      if (paesePersonalizzato(c))
        throw new Error(`Manca il file della bandiera personalizzata ${c}.`);
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
  const codiciValidi = new Set([
    ...CODICI,
    ...leggiBandierePersonalizzate().map((b) => b.codice),
  ]);
  const ignoto = codiciNelLuogo(nome).find((c) => !codiciValidi.has(c));
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
    /<img\b[^>]*src=["']\/?img\/Icons\/([^"']+?)\.(?:png|jpe?g|webp|svg)["'][^>]*>/gi,
    (m, nome) => {
      const c = codiceDaFile(nomeFile(decodeURIComponent(nome)));
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
