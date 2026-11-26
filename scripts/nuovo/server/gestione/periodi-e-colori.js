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
// Elimina più giri in una sola scrittura: statistiche e file si aggiornano insieme, oppure niente.
const eliminaGiri = ({ ids }) => {
  const lista = [...new Set((Array.isArray(ids) ? ids : []).map(String))];
  if (!lista.length) throw new Error("Seleziona almeno un giro da eliminare.");
  if (lista.length > 500)
    throw new Error("Puoi eliminare al massimo 500 giri alla volta.");
  // indici dal più alto al più basso: togliendo un giro non si spostano quelli ancora da togliere
  const riferimenti = lista
    .map((id) => stagioneDaId(id))
    .sort((a, b) => b.index - a.index);
  const changes = new Map();
  for (const ref of riferimenti) {
    const file = nomeFileGiri(ref.chiave, ref.periodo);
    const list = changes.has(file)
      ? JSON.parse(changes.get(file))
      : leggi(file);
    const ride = list[ref.index];
    if (!ride) throw new Error("Uno dei giri selezionati non esiste più.");
    const d = dataSalvata(ride);
    if (!d) throw new Error("La data di uno dei giri non è leggibile.");
    list.splice(ref.index, 1);
    changes.set(file, formattaJson(list));
    aggiornaStatistica(
      changes,
      annoPeriodo(ref.chiave, ref.periodo, d.mese),
      d.mese,
      -Number(ride.distance || 0),
      -1,
    );
  }
  scriviTransazione(changes);
  return {
    ok: true,
    eliminati: riferimenti.length,
    messaggio:
      riferimenti.length === 1
        ? "Giro eliminato e statistiche aggiornate."
        : `${riferimenti.length} giri eliminati e statistiche aggiornate.`,
  };
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
