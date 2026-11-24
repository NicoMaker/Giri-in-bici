  } catch (e) {
    for (const [rel, bytes] of [...prima].reverse()) {
      const file = assoluto(rel);
      if (bytes === null) fs.rmSync(file, { force: true });
      else fs.writeFileSync(file, bytes);
    }
    throw e;
  }
};
const jsonInModifiche = (map, rel) =>
  map.has(rel) ? JSON.parse(map.get(rel)) : leggi(rel);
const stagioneConfig = (map, chiave) => {
  const s = STAGIONI[chiave];
  const file = `json/${s.cartella}/generale.json`;
  const generale = jsonInModifiche(map, file);
  const statistiche = jsonInModifiche(map, PERCORSO_STAGIONI_JSON);
  const voce = statistiche.seasons.find(
    (x) => x.name === chiave || x.name === s.testo,
  );
  if (!voce)
    throw new Error(`Configurazione statistiche non trovata per ${s.testo}.`);
  return { s, file, generale, statistiche, voce };
};
const garantisciPeriodo = (map, chiave, periodo) => {
  const { s, file, generale, statistiche, voce } = stagioneConfig(map, chiave);
  const periodFile = nomeFileGiri(chiave, periodo);
  if (!generale.subPeriods[periodo]) {
    generale.subPeriods[periodo] = periodFile;
    voce.subPeriods[periodo] = periodFile;
    map.set(file, formattaJson(generale));
    map.set(PERCORSO_STAGIONI_JSON, formattaJson(statistiche));
    map.set(periodFile, "[]\n");
    const pagina = `${s.cartella}/${periodo}.html`;
    if (!fs.existsSync(assoluto(pagina)))
      map.set(
        pagina,
        `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=../${s.cartella}.html">\n`,
      );
  }
};
const aggiornaStatistica = (map, anno, mese, deltaKm, deltaGiri) => {
  const storico = jsonInModifiche(map, PERCORSO_STORICO_JSON);
  const file =
    storico.anni[String(anno)] || `json/Statistiche/anni/${anno}.json`;
  let dati;
  if (map.has(file)) dati = JSON.parse(map.get(file));
  else if (fs.existsSync(assoluto(file))) dati = leggi(file);
  else {
    dati = { year: String(anno), numberOfRaces: 0, data: {} };
    storico.anni[String(anno)] = file;
    const colori = ["#2dd4bf", "#60a5fa", "#f59e0b", "#a78bfa"];
    storico.coloriAnni = storico.coloriAnni || [];
    storico.coloriAnni.push(colori[(anno - 1) % colori.length]);
    map.set(PERCORSO_STORICO_JSON, formattaJson(storico));
  }
  const meseNome = MESI[mese];
  const nuovoKm = (Number(dati.data[meseNome]) || 0) + deltaKm;
  if (!Number.isFinite(nuovoKm) || nuovoKm < 0)
    throw new Error(
      `La modifica produrrebbe km negativi in ${meseNome} ${anno}.`,
    );
  dati.data[meseNome] = nuovoKm;
  dati.numberOfRaces = (Number(dati.numberOfRaces) || 0) + deltaGiri;
  if (dati.numberOfRaces < 0)
    throw new Error(
      `Il totale delle corse di ${anno} non può diventare negativo.`,
    );
  map.set(file, formattaJson(dati));
};
const normalize = (data) => {
  const d = parseData(data.data);
  const stagione = String(data.stagione || "");
  if (!STAGIONI[stagione]) throw new Error("Scegli una stagione valida.");
  const lg = normalizzaLuogo(data);
  const km = Number(data.km);
  if (!Number.isInteger(km) || km <= 0)
    throw new Error("I km devono essere un numero intero maggiore di zero.");
  return { d, stagione, periodo: periodoGiro(stagione, d), ...lg, km };
};
const salvaGiro = (body) => {
  const changes = new Map();
  let old = null;
  if (body.id) {
    const ref = stagioneDaId(body.id);
    const oldFile = nomeFileGiri(ref.chiave, ref.periodo);
    const list = leggi(oldFile);
    if (!list[ref.index])
      throw new Error("Il giro da modificare non esiste più.");
    const oldDate = dataSalvata(list[ref.index]);
    if (!oldDate)
      throw new Error("La data del giro esistente non è leggibile.");
    old = {
      ref,
      oldFile,
      list,
      ride: list[ref.index],
      date: {
        ...oldDate,
        anno: annoPeriodo(ref.chiave, ref.periodo, oldDate.mese),
      },
    };
  }
  const n = normalize(body);
  const targetFile = nomeFileGiri(n.stagione, n.periodo);
  garantisciPeriodo(changes, n.stagione, n.periodo);
  if (old) {
    if (old.oldFile === targetFile) {
      const list = changes.has(targetFile)
        ? JSON.parse(changes.get(targetFile))
        : old.list;
      list.splice(old.ref.index, 1);
      changes.set(targetFile, formattaJson(list));
    } else {
      old.list.splice(old.ref.index, 1);
      changes.set(old.oldFile, formattaJson(old.list));
    }
  }
  const list = changes.has(targetFile)
    ? JSON.parse(changes.get(targetFile))
    : leggi(targetFile);
  const nomeData = `${String(n.d.giorno).padStart(2, "0")} ${MESI[n.d.mese]}`;
  const place = costruisciPlace(n);
  for (const f of bandiereMancanti(n.luogo)) changes.set(f.rel, f.testo); // crea l'immagine mancante in Img/Icons
  list.push({ date: nomeData, place, distance: n.km });
  list.sort((a, b) => {
    const da = dataSalvata(a),
      db = dataSalvata(b);
    if (!da || !db) return 0;
    const ordine = (x) =>
      STAGIONI[n.stagione].formato === "biennio"
        ? x.mese >= 8
          ? x.mese - 8
          : x.mese + 4
        : x.mese;
    return ordine(da) - ordine(db) || da.giorno - db.giorno;
  });
  changes.set(targetFile, formattaJson(list));
  if (old) {
    aggiornaStatistica(
      changes,
