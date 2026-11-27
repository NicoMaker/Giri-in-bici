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
    const nome = String(generale.displayName || s.testo);
    return periodi.map((periodo, i) => ({
      chiave,
      etichetta: nome,
      nomeOriginale: s.testo,
      coloreStagione: generale.seasonColor || "",
      periodo,
      colore: (generale.colors || [])[i] || "#2dd4bf",
    }));
  });
// Nome mostrato e colore generale di una stagione (es. "Estate"). Si salvano in generale.json
// e in stagioni.json: le pagine del sito leggono da lì, quindi tutto si adegua senza toccare l'HTML.
const salvaStagione = ({ stagione, nome, colore }) => {
  const s = STAGIONI[stagione];
  if (!s) throw new Error("Stagione non valida.");
  const changes = new Map();
  const { file, generale, statistiche, voce } = stagioneConfig(
    changes,
    stagione,
  );
  let cambiato = false;
  if (nome !== undefined && nome !== null) {
    const n = String(nome).trim();
    if (!n || n.length > 40 || /[<>"\u0000-\u001f]/.test(n))
      throw new Error(
        "Il nome della stagione deve avere da 1 a 40 caratteri, senza < > o virgolette.",
      );
    if (n !== (generale.displayName || s.testo)) cambiato = true;
    generale.displayName = n;
    voce.displayName = n;
  }
  if (colore) {
    const errore = validaColore(colore);
    if (errore) throw new Error(errore);
    if (String(colore).trim() !== generale.seasonColor) cambiato = true;
    generale.seasonColor = String(colore).trim();
    voce.color = String(colore).trim();
  }
  if (!cambiato)
    throw new Error("Nessuna modifica: cambia il nome o il colore.");
  voce.subPeriods = generale.subPeriods;
  changes.set(file, formattaJson(generale));
  changes.set(PERCORSO_STAGIONI_JSON, formattaJson(statistiche));
  scriviTransazione(changes);
  return {
    ok: true,
    messaggio: `Stagione "${generale.displayName || s.testo}" aggiornata.`,
  };
};
// Elimina più periodi: uno alla volta (ognuno riscrive pagine, JSON e foto), riportando quali non si possono togliere.
const eliminaPeriodi = ({ periodi }) => {
  const lista = [
    ...new Set((Array.isArray(periodi) ? periodi : []).map(String)),
  ];
  if (!lista.length)
    throw new Error("Seleziona almeno un periodo da eliminare.");
  const eliminati = [];
  const bloccati = [];
  for (const voce of lista) {
    const [stagione, ...resto] = voce.split("|");
    const periodo = resto.join("|");
    try {
      eliminaPeriodo({ stagione, periodo });
      eliminati.push(`${stagione} ${periodo}`);
    } catch (e) {
      bloccati.push(`${stagione} ${periodo} (${e.message})`);
    }
  }
  if (!eliminati.length)
    throw new Error(`Non elimino nulla: ${bloccati.join("; ")}`);
  return {
    ok: true,
    eliminati: eliminati.length,
    bloccati,
    messaggio: `${eliminati.length === 1 ? "Periodo eliminato" : `${eliminati.length} periodi eliminati`}${bloccati.length ? `. Non eliminati: ${bloccati.join("; ")}` : ""}.`,
  };
};
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
