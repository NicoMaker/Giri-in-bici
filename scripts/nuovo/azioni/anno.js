const raccogliAnno = async (piano, opzioni = {}) => {
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const esistenti = Object.keys(storico.anni).sort(ordinaPeriodi);
  const ultimo = esistenti[esistenti.length - 1];

  console.log(
    `\n${grassetto("Statistiche 📅")} ${grigio(`(ultimo anno presente: ${ultimo})`)}`,
  );

  // ---- CLI: anno da --anno ----
  const anno = opzioni.anno || opzione("anno") || (await chiediValido(
    "Nuovo anno", String(parseInt(ultimo, 10) + 1),
    validaPeriodo("anno", esistenti),
  ));
  if (opzioni.anno || opzione("anno")) {
    const errore = validaPeriodo("anno", esistenti)(anno);
    if (errore) throw new Error(`Statistiche: ${errore}`);
  }

  if ((storico.coloriAnni || []).length !== esistenti.length) {
    console.log(giallo(
      `  ⚠ In ${PERCORSO_STORICO_JSON} i colori (${(storico.coloriAnni || []).length}) non sono tanti quanti gli anni (${esistenti.length}): controlla l'ordine dopo la creazione.`,
    ));
  }

  // ---- CLI: colore da --colore ----
  let colore = opzione("colore");
  if (colore !== undefined) {
    const err = validaColore(colore);
    if (err) throw new Error(err);
    if (COLORI_CSS[colore.toLowerCase()]) colore = colore.toLowerCase();
  } else {
    colore = await chiediColore(
      `Colore dell'anno ${anno}: scrivilo tu (nome CSS, es. gold, oppure #esadecimale)`,
      storico.coloriAnni || [],
    );
  }

  // ---- CLI: icona da --icona ----
  let icona = null;
  let percorsoIcona = opzione("icona");
  if (percorsoIcona !== undefined) {
    const file = pulisciPercorso(percorsoIcona);
    if (!fs.existsSync(file) || !/\.jpe?g$/i.test(file)) {
      throw new Error(`Icona: serve un file .jpg esistente (${file}).`);
    }
    icona = file;
  } else if (!flag("si")) {
    percorsoIcona = await chiedi(
      `Immagine .jpg per l'icona del ${anno} — trascinala qui, oppure invio e la creo io con il colore dell'anno`, "",
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
  }

  // ---- CLI: mese/ km / corse da opzioni ----
  let mese = opzione("mese-iniziale") || "Gennaio";
  let km = opzione("km") !== undefined ? parseInt(opzione("km"), 10) : 0;
  let corse = opzione("corse") !== undefined ? parseInt(opzione("corse"), 10) : 0;
  let esempio = opzione("km") === undefined;
  if (opzione("km") === undefined && !flag("si") && await chiediSiNo(
    "Vuoi inserire subito il primo mese? (altrimenti metto Gennaio a 0 km da sostituire)", false,
  )) {
    // ... lascia il blocco interattivo originale qui ...
    mese = await chiediValido("Mese (es. Gennaio)", "Gennaio", (v) =>
      MESI.some((m) => m.toLowerCase() === v.toLowerCase()) ? null : "Scrivi un mese in italiano.");
    mese = MESI.find((m) => m.toLowerCase() === mese.toLowerCase());
    km = parseInt(await chiediValido("Km del mese", "0", (v) =>
      /^\d+$/.test(v) ? null : "Solo numeri interi."), 10);
    corse = parseInt(await chiediValido("Numero di corse dell'anno finora", "0", (v) =>
      /^\d+$/.test(v) ? null : "Solo numeri interi."), 10);
    esempio = false;
  }

  return { anno, colore, icona, mese, km, corse, esempio, ultimo };
};