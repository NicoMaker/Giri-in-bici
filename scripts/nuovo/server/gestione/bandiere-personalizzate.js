    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  )
    return "webp";
  throw new Error("Usa un'immagine PNG, JPG o WebP valida.");
};
const salvaBandieraPersonalizzata = (nome, buffer) => {
  const etichetta = String(nome || "").trim();
  if (!etichetta || etichetta.length > 60 || /[\\/<>\u0000-\u001f]/.test(etichetta))
    throw new Error("Inserisci un nome per la bandiera (massimo 60 caratteri).");
  const slug = etichetta
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  if (!slug) throw new Error("Il nome scelto non può diventare un nome file valido.");
  const estensione = estensioneImmagineBandiera(buffer);
  const codice = `CUSTOM_${slug.replace(/-/g, "_").toUpperCase()}`;
  const file = `custom-${slug}.${estensione}`;
  const archivio = leggiBandierePersonalizzate();
  if (archivio.some((b) => b.codice === codice || b.file === file))
    throw new Error("Esiste già una bandiera con questo nome. Scegline un altro.");
  const percorso = assoluto(`Img/Icons/${file}`);
  fs.mkdirSync(path.dirname(percorso), { recursive: true });
  try {
    fs.writeFileSync(percorso, buffer, { flag: "wx" });
  } catch (errore) {
    if (errore.code === "EEXIST")
      throw new Error("Esiste già un'immagine con questo nome. Scegline un altro.");
    fs.rmSync(percorso, { force: true });
    throw errore;
  }
  try {
    scriviTransazione(
      new Map([
        [
          FILE_BANDIERE_PERSONALIZZATE,
          formattaJson([...archivio, { codice, nome: etichetta, file }]),
        ],
      ]),
    );
  } catch (errore) {
    fs.rmSync(percorso, { force: true });
    throw errore;
  }
  const bandiera = leggiElencoPaesi().find((p) => p.codice === codice);
  return {
    ok: true,
    bandiera,
    messaggio: `Bandiera salvata in Img/Icons/${file}.`,
  };
};
const elencoPaesi = () => leggiElencoPaesi();
module.exports = {
  elencoUtenti,
  salvaUtente,
  eliminaUtente,
  elencoPaesi,
  salvaBandieraPersonalizzata,
  elencoGiri,
  listaStagioni,
  listaPeriodiGestibili,
  salvaGiro,
  eliminaGiro,
  salvaColore,
  eliminaPeriodo,
};
