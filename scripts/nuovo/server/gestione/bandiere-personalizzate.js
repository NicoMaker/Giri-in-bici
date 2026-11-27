// Bandiere personalizzate: ogni immagine sta direttamente in Img/Icons/Bandiere/<Nome>.<ext>
// ed è registrata in json/Bandiere-personalizzate.json. Creare, rinominare, sostituire ed eliminare
// passano da qui; le immagini messe a mano nella cartella le registra sincronizzaBandiere().
const estensioneImmagineBandiera = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12)
    throw new Error("Il file della bandiera non è valido.");
  if (buffer.length > 5 * 1024 * 1024)
    throw new Error("L'immagine è troppo grande: il limite è 5 MB.");
  if (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return "jpg";
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  )
    return "webp";
  throw new Error("Usa un'immagine PNG, JPG o WebP valida.");
};
const percorsoBandiera = (file) => assoluto(`${CARTELLA_BANDIERE}/${file}`);
const urlBandiera = (file) => `/img/Icons/Bandiere/${file}`;
const baseFile = (file) => path.parse(String(file)).name;
const escRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const validaNomeBandiera = (nome) => {
  const etichetta = String(nome || "").trim();
  if (
    !etichetta ||
    etichetta.length > 60 ||
    /[\\/<>\u0000-\u001f]/.test(etichetta)
  )
    throw new Error(
      "Inserisci un nome per la bandiera (massimo 60 caratteri).",
    );
  const base = nomeCartella(etichetta);
  if (!base)
    throw new Error("Il nome scelto non può diventare un nome file valido.");
  return { etichetta, base };
};
const nomeGiaUsato = (archivio, base, codice) =>
  archivio.some(
    (b) =>
      b.codice !== codice &&
      baseFile(b.file).toLowerCase() === base.toLowerCase(),
  );
// Tra le bandiere già in cartella cerca un file con lo stesso nome base (qualunque estensione).
const fileConStessoNome = (base, tranne) => {
  const cartella = assoluto(CARTELLA_BANDIERE);
  if (!fs.existsSync(cartella)) return null;
  return (
    fs
      .readdirSync(cartella)
      .find(
        (n) => n !== tranne && baseFile(n).toLowerCase() === base.toLowerCase(),
      ) || null
  );
};
const bandieraDaCodice = (codice) =>
  leggiElencoPaesi().find((p) => p.codice === codice);

// Crea la bandiera: Img/Icons/Bandiere/<Nome>.<ext> + voce nel catalogo.
const salvaBandieraPersonalizzata = (nome, buffer) => {
  const { etichetta, base } = validaNomeBandiera(nome);
  const estensione = estensioneImmagineBandiera(buffer);
  const codice = `CUSTOM_${base.toUpperCase()}`;
  const file = `${base}.${estensione}`;
  sincronizzaBandiere(); // così vedo anche le immagini messe a mano
  const archivio = leggiBandierePersonalizzate();
  if (
    archivio.some((b) => b.codice === codice) ||
    nomeGiaUsato(archivio, base) ||
    fileConStessoNome(base)
  )
    throw new Error(
      "Esiste già una bandiera con questo nome. Scegline un altro.",
    );
  fs.mkdirSync(assoluto(CARTELLA_BANDIERE), { recursive: true });
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
    fs.rmSync(percorsoBandiera(file), { force: true });
    throw errore;
  }
  return {
    ok: true,
    bandiera: bandieraDaCodice(codice),
    messaggio: `Bandiera "${etichetta}" salvata in ${CARTELLA_BANDIERE}/${file}.`,
  };
};

// Tutti i file di testo del sito (json e html) dove può comparire l'immagine di una bandiera.
const fileConRiferimenti = (cartella = RADICE, trovati = []) => {
  for (const voce of fs.readdirSync(cartella, { withFileTypes: true })) {
    if ([".git", "node_modules", "scripts", "Img", "img"].includes(voce.name))
      continue;
    const completo = path.join(cartella, voce.name);
    if (voce.isDirectory()) fileConRiferimenti(completo, trovati);
    else if (/\.(?:json|html)$/i.test(voce.name))
      trovati.push(path.relative(RADICE, completo).split(path.sep).join("/"));
  }
  return trovati;
};

// Modifica una bandiera: nuovo nome (rinomina il file e aggiorna tutti i riferimenti) e/o nuova immagine.
const modificaBandieraPersonalizzata = (codice, nuovoNome, buffer) => {
  sincronizzaBandiere();
  const archivio = leggiBandierePersonalizzate();
  const vecchia = archivio.find((b) => b.codice === codice);
  if (!vecchia) throw new Error("Bandiera non trovata nel catalogo.");
  const { etichetta, base } = validaNomeBandiera(nuovoNome || vecchia.nome);
  const nuovaImmagine = Buffer.isBuffer(buffer) && buffer.length > 0;
  if (etichetta === vecchia.nome && !nuovaImmagine)
    throw new Error(
      "Nessuna modifica: cambia il nome o scegli una nuova immagine.",
    );
  if (nomeGiaUsato(archivio, base, codice))
    throw new Error(
      "Esiste già una bandiera con questo nome. Scegline un altro.",
    );
  const estensione = nuovaImmagine
    ? estensioneImmagineBandiera(buffer)
    : path.extname(vecchia.file).slice(1);
  const nuovoFile = `${base}.${estensione}`;
  if (nuovoFile !== vecchia.file && fileConStessoNome(base, vecchia.file))
    throw new Error(
      `Esiste già un'immagine chiamata ${base} in ${CARTELLA_BANDIERE}.`,
    );
  if (!fs.existsSync(percorsoBandiera(vecchia.file)) && !nuovaImmagine)
    throw new Error(
      `Manca il file ${CARTELLA_BANDIERE}/${vecchia.file}: scegli una nuova immagine.`,
    );
  const byteVecchi = fs.existsSync(percorsoBandiera(vecchia.file))
    ? fs.readFileSync(percorsoBandiera(vecchia.file))
    : null;
  const rinomina = nuovoFile !== vecchia.file;

  const ripristina = () => {
    if (rinomina) fs.rmSync(percorsoBandiera(nuovoFile), { force: true });
    if (byteVecchi)
      fs.writeFileSync(percorsoBandiera(vecchia.file), byteVecchi);
  };
  try {
    fs.writeFileSync(
      percorsoBandiera(nuovoFile),
      nuovaImmagine ? buffer : byteVecchi,
    );

    // catalogo + tutti i riferimenti nei json/html del sito (anche quelli col vecchio percorso a cartella)
    const modifiche = new Map([
      [
        FILE_BANDIERE_PERSONALIZZATE,
        formattaJson(
          archivio.map((b) =>
            b.codice === codice
              ? { ...b, nome: etichetta, file: nuovoFile }
              : b,
          ),
        ),
      ],
    ]);
    const vecchioBase = escRegExp(baseFile(vecchia.file));
    const reUrl = new RegExp(
      `(/(?:img|Img)/Icons/Bandiere/)(?:${vecchioBase}/)?${vecchioBase}\\.(?:png|jpe?g|webp)(?![\\w.])`,
      "gi",
    );
    const nuovoUrl = urlBandiera(nuovoFile);
    const reAlt = new RegExp(
      `(${escRegExp(nuovoUrl)}\\\\?["']\\s+alt=\\\\?["'])${escRegExp(escapeHtml(vecchia.nome))}(?=\\\\?["'])`,
      "g",
    );
    let riferimenti = 0;
    for (const rel of fileConRiferimenti()) {
      if (rel === FILE_BANDIERE_PERSONALIZZATE) continue;
      const testo = fs.readFileSync(assoluto(rel), "utf8");
      reUrl.lastIndex = 0;
      if (!reUrl.test(testo)) continue;
      reUrl.lastIndex = 0;
      const nuovo = testo
        .replace(reUrl, () => {
          riferimenti += 1;
          return nuovoUrl;
        })
        .replace(reAlt, `$1${escapeHtml(etichetta)}`);
      if (nuovo !== testo) modifiche.set(rel, nuovo);
    }
    scriviTransazione(modifiche);
    if (rinomina) fs.rmSync(percorsoBandiera(vecchia.file), { force: true });
    return {
      ok: true,
      bandiera: bandieraDaCodice(codice),
      messaggio: `Bandiera "${etichetta}" aggiornata${riferimenti ? ` (${riferimenti} riferimenti sistemati nei giri e nelle pagine)` : ""}.`,
    };
  } catch (errore) {
    ripristina();
    throw errore;
  }
};

// Elimina una bandiera: toglie la voce dal catalogo e cancella l'immagine.
// Se è ancora usata in qualche giro si ferma, così nessun giro resta con un'immagine rotta.
const eliminaBandieraPersonalizzata = (codice) => {
  sincronizzaBandiere();
  const archivio = leggiBandierePersonalizzate();
  const bandiera = archivio.find((b) => b.codice === codice);
  if (!bandiera) throw new Error("Bandiera non trovata nel catalogo.");
  const usi = elencoGiri().filter((g) =>
    String(g.luogo || "").includes(`{${codice}}`),
  ).length;
  if (usi)
    throw new Error(
      `La bandiera ${bandiera.nome} è usata in ${usi} ${usi === 1 ? "giro" : "giri"}: toglila prima dai giri (bandiera nel luogo), poi eliminala.`,
    );
  const file = percorsoBandiera(bandiera.file);
  const byte = fs.existsSync(file) ? fs.readFileSync(file) : null;
  scriviTransazione(
    new Map([
      [
        FILE_BANDIERE_PERSONALIZZATE,
        formattaJson(archivio.filter((b) => b.codice !== codice)),
      ],
    ]),
  );
  try {
    fs.rmSync(file, { force: true });
  } catch (errore) {
    if (byte) fs.writeFileSync(file, byte);
    throw errore;
  }
  return { ok: true, messaggio: `Bandiera "${bandiera.nome}" eliminata.` };
};
// Elimina più bandiere insieme. Quelle ancora usate nei giri restano al loro posto e vengono elencate.
const eliminaBandiere = ({ codici }) => {
  const richieste = [
    ...new Set((Array.isArray(codici) ? codici : []).map(String)),
  ];
  if (!richieste.length)
    throw new Error("Seleziona almeno una bandiera da eliminare.");
  sincronizzaBandiere();
  const archivio = leggiBandierePersonalizzate();
  const giri = elencoGiri();
  const trovate = archivio.filter((b) => richieste.includes(b.codice));
  if (!trovate.length)
    throw new Error("Le bandiere selezionate non esistono più.");
  const usata = (b) =>
    giri.some((g) => String(g.luogo || "").includes(`{${b.codice}}`));
  const bloccate = trovate.filter(usata);
  const daEliminare = trovate.filter((b) => !usata(b));
  if (!daEliminare.length)
    throw new Error(
      `Non elimino nulla: ${bloccate.map((b) => b.nome).join(", ")} ${bloccate.length === 1 ? "è usata" : "sono usate"} nei giri. ${bloccate.length === 1 ? "Toglila" : "Toglile"} prima dai giri.`,
    );
  const codiciVia = new Set(daEliminare.map((b) => b.codice));
  const copie = daEliminare.map((b) => ({
    file: percorsoBandiera(b.file),
    byte: fs.existsSync(percorsoBandiera(b.file))
      ? fs.readFileSync(percorsoBandiera(b.file))
      : null,
  }));
  scriviTransazione(
    new Map([
      [
        FILE_BANDIERE_PERSONALIZZATE,
        formattaJson(archivio.filter((b) => !codiciVia.has(b.codice))),
      ],
    ]),
  );
  try {
    copie.forEach((c) => fs.rmSync(c.file, { force: true }));
  } catch (errore) {
    copie.forEach((c) => c.byte && fs.writeFileSync(c.file, c.byte));
    throw errore;
  }
  const base =
    daEliminare.length === 1
      ? "Bandiera eliminata"
      : `${daEliminare.length} bandiere eliminate`;
  return {
    ok: true,
    eliminati: daEliminare.length,
    bloccate: bloccate.map((b) => b.nome),
    messaggio: bloccate.length
      ? `${base}. Non eliminate perché usate nei giri: ${bloccate.map((b) => b.nome).join(", ")}.`
      : `${base}.`,
  };
};
const elencoPaesi = () => {
  sincronizzaBandiere();
  return leggiElencoPaesi();
};
module.exports = {
  elencoUtenti,
  salvaUtente,
  eliminaUtente,
  eliminaUtenti,
  elencoPaesi,
  sincronizzaBandiere,
  salvaBandieraPersonalizzata,
  modificaBandieraPersonalizzata,
  eliminaBandieraPersonalizzata,
  eliminaBandiere,
  elencoGiri,
  listaStagioni,
  listaPeriodiGestibili,
  salvaGiro,
  eliminaGiro,
  eliminaGiri,
  salvaColore,
  eliminaPeriodo,
  eliminaPeriodi,
  salvaStagione,
};
