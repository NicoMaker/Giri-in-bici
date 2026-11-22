const raccogliStagione = async (piano, chiave, opzioni = {}) => {
  const s = STAGIONI[chiave];
  const fileGenerale = `json/${s.cartella}/generale.json`;
  const generale = leggiJson(piano, fileGenerale);
  const esistenti = Object.keys(generale.subPeriods).sort(ordinaPeriodi);
  const ultimo = esistenti[esistenti.length - 1];

  console.log(
    `\n${grassetto(s.etichetta)} ${grigio(`(ultimo periodo presente: ${ultimo})`)}`,
  );

  // ---- CLI: periodo da --periodo ----
  let periodo = opzioni.periodo || opzione("periodo");
  if (periodo === undefined) {
    periodo = await chiediValido(
      s.formato === "anno" ? "Anno della nuova stagione" : "Periodo della nuova stagione",
      periodoSuccessivo(s.formato, ultimo),
      validaPeriodo(s.formato, esistenti),
    );
  } else {
    const errore = validaPeriodo(s.formato, esistenti)(periodo);
    if (errore) throw new Error(`${s.testo}: ${errore}`);
  }

  if ((generale.colors || []).length !== esistenti.length) {
    console.log(giallo(
      `  ⚠ In ${fileGenerale} i colori (${(generale.colors || []).length}) non sono tanti quanti i periodi (${esistenti.length}): controlla l'ordine dopo la creazione.`,
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
      `Colore di ${s.testo} ${periodo}: scrivilo tu (nome CSS, es. gold, oppure #esadecimale)`,
      generale.colors || [],
    );
  }

  // ---- CLI: foto da --foto-cartella / --nfoto ----
  let fotoDaCopiare = [];
  let nFoto = 0;
  let cartellaFoto = opzione("foto-cartella");
  if (cartellaFoto !== undefined) {
    const dir = pulisciPercorso(cartellaFoto);
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const r = elencaFoto(dir);
      fotoDaCopiare = r.foto;
      nFoto = r.foto.length;
    } else {
      throw new Error(`Cartella foto non trovata: ${dir}`);
    }
  } else if (opzione("nfoto") !== undefined) {
    nFoto = parseInt(opzione("nfoto"), 10);
  } else {
    cartellaFoto = await chiedi(
      "Cartella con le foto della stagione (.jpg) — trascinala qui, oppure invio per saltare", "",
    );
    while (cartellaFoto) {
      const dir = pulisciPercorso(cartellaFoto);
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        const { foto, ignorati } = elencaFoto(dir);
        if (ignorati.length) console.log(giallo(`  ⚠ Ignoro ${ignorati.length} file non .jpg`));
        if (foto.length) { fotoDaCopiare = foto; nFoto = foto.length; break; }
        console.log(rosso("  ✖ In quella cartella non ci sono file .jpg."));
      } else {
        console.log(rosso("  ✖ Cartella non trovata."));
      }
      cartellaFoto = await chiedi("Prova con un'altra cartella (invio per saltare)", "");
    }
    if (!nFoto) {
      nFoto = parseInt(await chiediValido(
        "Quante foto avrà la pagina? (0 = sezione vuota, le aggiungi tu)", "0",
        (v) => (/^\d{1,3}$/.test(v) ? null : "Scrivi un numero."),
      ), 10);
    }
  }

  // ---- CLI: giro iniziale da --data / --luogo / --km / --link ----
  let giro = null;
  if (opzione("data") && opzione("luogo") && opzione("km")) {
    giro = {
      date: normalizzaData(opzione("data")),
      place: opzione("link")
        ? `<a href="${opzione("link")}" target="_blank">${opzione("luogo")}</a>`
        : opzione("luogo"),
      distance: parseInt(opzione("km"), 10),
    };
  } else if (!flag("si") && await chiediSiNo(
    "Vuoi inserire subito il primo giro? (altrimenti metto un giro d'esempio da sostituire)", false,
  )) {
    // ... lascia il blocco interattivo originale qui ...
    const data = await chiediValido(
      `Data (es. 05 ${s.meseIniziale})`, `01 ${s.meseIniziale}`,
      (v) => (normalizzaData(v) ? null : "Formato: giorno e mese in italiano, es. 05 Giugno."),
    );
    const luogo = await chiediValido("Luogo", "", (v) => (v ? null : "Il luogo è obbligatorio."));
    const link = await chiedi("Link Komoot (invio per saltare)", "https://www.komoot.com/it-it");
    const km = await chiediValido("Distanza in km", "0", (v) => (/^\d+$/.test(v) ? null : "Solo numeri interi."));
    giro = {
      date: normalizzaData(data),
      place: `<a href="${link}" target="_blank">${luogo}</a>`,
      distance: parseInt(km, 10),
    };
  }

  return { chiave, periodo, colore, nFoto, fotoDaCopiare, giro, ultimo };
};