      old.date.anno,
      old.date.mese,
      -Number(old.ride.distance || 0),
      0,
    );
    aggiornaStatistica(changes, n.d.anno, n.d.mese, n.km, 0);
  } else aggiornaStatistica(changes, n.d.anno, n.d.mese, n.km, 1);
  scriviTransazione(changes);
  return {
    ok: true,
    messaggio: old
      ? "Giro modificato e statistiche aggiornate."
      : "Giro aggiunto e statistiche aggiornate.",
  };
};
const eliminaGiro = ({ id }) => {
  const ref = stagioneDaId(id);
  const file = nomeFileGiri(ref.chiave, ref.periodo);
  const list = leggi(file);
  const ride = list[ref.index];
  if (!ride) throw new Error("Il giro da eliminare non esiste più.");
  const d = dataSalvata(ride);
  if (!d) throw new Error("La data del giro non è leggibile.");
  list.splice(ref.index, 1);
  const changes = new Map([[file, formattaJson(list)]]);
  aggiornaStatistica(
    changes,
    annoPeriodo(ref.chiave, ref.periodo, d.mese),
    d.mese,
    -Number(ride.distance || 0),
    -1,
  );
  scriviTransazione(changes);
  return { ok: true, messaggio: "Giro eliminato e statistiche aggiornate." };
};
const listaStagioni = () =>
  Object.entries(STAGIONI).flatMap(([chiave, s]) => {
    const generale = leggi(`json/${s.cartella}/generale.json`);
    const periodi = Object.keys(generale.subPeriods);
    return periodi.map((periodo, i) => ({
      chiave,
      etichetta: s.testo,
      periodo,
      colore: (generale.colors || [])[i] || "#2dd4bf",
    }));
  });
const salvaColore = ({ stagione, periodo, colore }) => {
  const s = STAGIONI[stagione];
  if (!s) throw new Error("Stagione non valida.");
  const errore = validaColore(colore);
  if (errore) throw new Error(errore);
  const changes = new Map();
  const { file, generale, statistiche, voce } = stagioneConfig(
    changes,
    stagione,
  );
  if (!generale.subPeriods[periodo]) throw new Error("Periodo non trovato.");
  const index = Object.keys(generale.subPeriods).indexOf(periodo);
  generale.colors = generale.colors || [];
  generale.colors[index] = String(colore).trim();
  voce.subPeriods = generale.subPeriods;
  changes.set(file, formattaJson(generale));
  changes.set(PERCORSO_STAGIONI_JSON, formattaJson(statistiche));
  scriviTransazione(changes);
  return {
    ok: true,
    messaggio: `Colore aggiornato per ${s.testo} ${periodo}.`,
  };
};
const listaPeriodiGestibili = () => listaStagioni();
const eliminaPeriodo = ({ stagione, periodo }) => {
  const s = STAGIONI[String(stagione || "")];
  if (!s || !/^\d{4}(?:-\d{4})?$/.test(String(periodo || "")))
    throw new Error("Stagione o periodo non valido.");
  const changes = new Map();
  const config = stagioneConfig(changes, stagione);
  const { generale, statistiche, voce } = config;
  const giroFile = generale.subPeriods[periodo];
  if (!giroFile || !fs.existsSync(assoluto(giroFile)))
    throw new Error("Periodo non trovato.");
  const periodi = Object.keys(generale.subPeriods);
  if (periodi.length <= 1)
    throw new Error(
      "Non puoi eliminare l'ultimo periodo: crea prima un altro periodo per mantenere la stagione utilizzabile.",
    );
  const giri = leggi(giroFile);
  for (const giro of giri) {
    const d = dataSalvata(giro);
    if (!d)
      throw new Error(
        `Non posso aggiornare le statistiche: data non valida nel file ${giroFile}.`,
      );
    aggiornaStatistica(
      changes,
      annoPeriodo(stagione, periodo, d.mese),
      d.mese,
      -Number(giro.distance || 0),
      -1,
    );
  }
  const indiceColore = periodi.indexOf(periodo);
  delete generale.subPeriods[periodo];
  generale.colors = generale.colors || [];
  generale.colors.splice(indiceColore, 1);
  delete voce.subPeriods[periodo];
  changes.set(config.file, formattaJson(generale));
  changes.set(PERCORSO_STAGIONI_JSON, formattaJson(statistiche));
