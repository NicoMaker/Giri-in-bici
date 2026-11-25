    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  )
    return "webp";
  throw new Error("Usa un'immagine PNG, JPG o WebP valida.");
};
const cartellaDi = (file) => file.split("/")[0];
const percorsoBandiera = (file) => assoluto(`${CARTELLA_BANDIERE}/${file}`);
const urlBandiera = (file) => `/img/Icons/Bandiere/${file}`;
const escRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const validaNomeBandiera = (nome) => {
  const etichetta = String(nome || "").trim();
  if (!etichetta || etichetta.length > 60 || /[\\/<>\u0000-\u001f]/.test(etichetta))
    throw new Error("Inserisci un nome per la bandiera (massimo 60 caratteri).");
  const cartella = nomeCartella(etichetta);
  if (!cartella)
    throw new Error("Il nome scelto non può diventare un nome file valido.");
  return { etichetta, cartella };
};
const nomeGiaUsato = (archivio, cartella, codice) =>
  archivio.some(
    (b) =>
      b.codice !== codice &&
      cartellaDi(b.file).toLowerCase() === cartella.toLowerCase(),
  );

// Crea la bandiera: Img/Icons/Bandiere/<Nome>/<Nome>.<ext> + voce nel catalogo.
const salvaBandieraPersonalizzata = (nome, buffer) => {
  const { etichetta, cartella } = validaNomeBandiera(nome);
  const estensione = estensioneImmagineBandiera(buffer);
  const codice = `CUSTOM_${cartella.toUpperCase()}`;
  const file = `${cartella}/${cartella}.${estensione}`;
  const archivio = leggiBandierePersonalizzate();
  if (archivio.some((b) => b.codice === codice) || nomeGiaUsato(archivio, cartella))
    throw new Error("Esiste già una bandiera con questo nome. Scegline un altro.");
  const dir = path.dirname(percorsoBandiera(file));
  if (fs.existsSync(dir))
    throw new Error(
      `Esiste già la cartella Img/Icons/Bandiere/${cartella}. Scegli un altro nome.`,
    );
  fs.mkdirSync(dir, { recursive: true });
  try {
    fs.writeFileSync(percorsoBandiera(file), buffer, { flag: "wx" });
    scriviTransazione(
      new Map([
        [
          FILE_BANDIERE_PERSONALIZZATE,
          formattaJson([...archivio, { codice, nome: etichetta, file }]),
        ],
      ]),
    );
  } catch (errore) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw errore;
  }
  return {
    ok: true,
    bandiera: leggiElencoPaesi().find((p) => p.codice === codice),
    messaggio: `Bandiera "${etichetta}" salvata in Img/Icons/Bandiere/${cartella}/.`,
  };
};

// Tutti i file di testo del sito (json e html) dove può comparire l'immagine di una bandiera.
const fileConRiferimenti = (cartella = RADICE, trovati = []) => {
  for (const voce of fs.readdirSync(cartella, { withFileTypes: true })) {
    if ([".git", "node_modules", "scripts", "Img"].includes(voce.name)) continue;
    const completo = path.join(cartella, voce.name);
    if (voce.isDirectory()) fileConRiferimenti(completo, trovati);
    else if (/\.(?:json|html)$/i.test(voce.name))
      trovati.push(path.relative(RADICE, completo).split(path.sep).join("/"));
  }
  return trovati;
};

// Modifica una bandiera: nuovo nome (rinomina cartella e file, aggiorna tutti i riferimenti) e/o nuova immagine.
const modificaBandieraPersonalizzata = (codice, nuovoNome, buffer) => {
  const archivio = leggiBandierePersonalizzate();
  const vecchia = archivio.find((b) => b.codice === codice);
  if (!vecchia) throw new Error("Bandiera non trovata nel catalogo.");
  const { etichetta, cartella } = validaNomeBandiera(nuovoNome || vecchia.nome);
  const nuovaImmagine = Buffer.isBuffer(buffer) && buffer.length > 0;
  if (etichetta === vecchia.nome && !nuovaImmagine)
    throw new Error("Nessuna modifica: cambia il nome o scegli una nuova immagine.");
  if (nomeGiaUsato(archivio, cartella, codice))
    throw new Error("Esiste già una bandiera con questo nome. Scegline un altro.");
  const estensione = nuovaImmagine
    ? estensioneImmagineBandiera(buffer)
    : path.extname(vecchia.file).slice(1);
  const nuovoFile = `${cartella}/${cartella}.${estensione}`;
  const dirVecchia = path.dirname(percorsoBandiera(vecchia.file));
  const dirNuova = path.dirname(percorsoBandiera(nuovoFile));
  const byteVecchi = fs.readFileSync(percorsoBandiera(vecchia.file));
  const rinominaCartella = cartellaDi(vecchia.file) !== cartella;
  if (
    rinominaCartella &&
    cartellaDi(vecchia.file).toLowerCase() !== cartella.toLowerCase() &&
    fs.existsSync(dirNuova)
  )
    throw new Error(`Esiste già la cartella Img/Icons/Bandiere/${cartella}.`);

  // 1. file e cartelle (con ripristino se qualcosa va storto)
  const ripristina = () => {
    fs.rmSync(percorsoBandiera(nuovoFile), { force: true });
    if (rinominaCartella && fs.existsSync(dirNuova)) fs.renameSync(dirNuova, dirVecchia);
    fs.mkdirSync(dirVecchia, { recursive: true });
    fs.writeFileSync(percorsoBandiera(vecchia.file), byteVecchi);
  };
  try {
    if (rinominaCartella) {
      const temp = `${dirVecchia}.tmp-${process.pid}`;
      fs.renameSync(dirVecchia, temp);
      fs.renameSync(temp, dirNuova);
    }
    fs.rmSync(path.join(dirNuova, path.basename(vecchia.file)), { force: true });
    fs.writeFileSync(percorsoBandiera(nuovoFile), nuovaImmagine ? buffer : byteVecchi);

    // 2. catalogo + tutti i riferimenti nei json/html del sito
    const modifiche = new Map([
      [
        FILE_BANDIERE_PERSONALIZZATE,
        formattaJson(
          archivio.map((b) =>
            b.codice === codice ? { ...b, nome: etichetta, file: nuovoFile } : b,
          ),
        ),
      ],
    ]);
    const vecchioUrl = urlBandiera(vecchia.file);
    const nuovoUrl = urlBandiera(nuovoFile);
    const reAlt = new RegExp(
      `(${escRegExp(nuovoUrl)}\\\\?["']\\s+alt=\\\\?["'])${escRegExp(escapeHtml(vecchia.nome))}(?=\\\\?["'])`,
      "g",
    );
    let riferimenti = 0;
    for (const rel of fileConRiferimenti()) {
      if (rel === FILE_BANDIERE_PERSONALIZZATE) continue;
      const testo = fs.readFileSync(assoluto(rel), "utf8");
      if (!testo.includes(vecchioUrl)) continue;
      riferimenti += testo.split(vecchioUrl).length - 1;
      modifiche.set(
        rel,
        testo
          .split(vecchioUrl)
          .join(nuovoUrl)
          .replace(reAlt, `$1${escapeHtml(etichetta)}`),
      );
    }
    scriviTransazione(modifiche);
    return {
      ok: true,
      bandiera: leggiElencoPaesi().find((p) => p.codice === codice),
      messaggio: `Bandiera "${etichetta}" aggiornata${riferimenti ? ` (${riferimenti} riferimenti sistemati nei giri e nelle pagine)` : ""}.`,
    };
  } catch (errore) {
    ripristina();
    throw errore;
  }
};
const elencoPaesi = () => leggiElencoPaesi();
module.exports = {
  elencoUtenti,
  salvaUtente,
  eliminaUtente,
  elencoPaesi,
  salvaBandieraPersonalizzata,
  modificaBandieraPersonalizzata,
  elencoGiri,
  listaStagioni,
  listaPeriodiGestibili,
  salvaGiro,
  eliminaGiro,
  salvaColore,
  eliminaPeriodo,
};
