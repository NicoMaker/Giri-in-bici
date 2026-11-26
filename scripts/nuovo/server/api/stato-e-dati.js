// ---------- stato (sola lettura) ----------
const stato = () => {
  const piano = nuovoPiano();
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const anni = Object.keys(storico.anni).sort(ordinaPeriodi);
  const stagioni = {};
  for (const [chiave, s] of Object.entries(STAGIONI)) {
    const g = leggiJson(piano, `json/${s.cartella}/generale.json`);
    const periodi = Object.keys(g.subPeriods).sort(ordinaPeriodi);
    const ultimo = periodi[periodi.length - 1];
    stagioni[chiave] = {
      etichetta: s.etichetta,
      testo: s.testo,
      formato: s.formato,
      meseIniziale: s.meseIniziale,
      periodi,
      colori: g.colors || [],
      ultimo,
      prossimo: periodoSuccessivo(s.formato, ultimo),
    };
  }
  const ultimoAnno = anni[anni.length - 1];
  return {
    radice: RADICE,
    prova: PROVA,
    oggi: oggiIso(),
    mesi: MESI,
    casi,
    anni,
    ultimoAnno,
    prossimoAnno: String(parseInt(ultimoAnno, 10) + 1),
    coloriAnni: storico.coloriAnni || [],
    stagioni,
  };
};

const elenco = () => leggiElenco(nuovoPiano());

// ---------- dati di ogni caso ----------

const controllaColore = (piano, colore, usati, nome) => {
  const errore = validaColore(colore);
  if (errore) throw new ErroreDati(errore);
  const c = normalizzaColore(colore);
  if (usati.some((u) => String(u).toLowerCase() === c.toLowerCase()))
    piano.avvisi.push(
      `${nome}: il colore ${c} è già usato da un altro periodo.`,
    );
  return c;
};

const datiGiro = (d) => {
  const chiave = d.stagione;
  if (!STAGIONI[chiave]) throw new ErroreDati("Scegli una stagione.");
  const data = leggiData(d.data, new Date().getFullYear());
  if (typeof data === "string") throw new ErroreDati(data);
  const lg = normalizzaLuogo(d);
  const km = String(d.km ?? "").trim();
  if (!/^\d+$/.test(km) || Number(km) <= 0)
    throw new ErroreDati(
      "Scrivi i km come numero intero maggiore di 0 (es. 95).",
    );
  return {
    chiave,
    s: STAGIONI[chiave],
    data,
    ...lg,
    km: parseInt(km, 10),
  };
};

const datiMese = (piano, d) => {
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const anno = String(d.anno || "");
  if (!storico.anni[anno])
    throw new ErroreDati(`L'anno ${anno || "?"} non esiste.`);
  const mese = MESI.findIndex(
    (m) => m.toLowerCase() === String(d.mese || "").toLowerCase(),
  );
  if (mese === -1) throw new ErroreDati("Scegli un mese.");
  return {
    anno: parseInt(anno, 10),
    mese,
    km: interoNonNegativo(d.km, "Km"),
    corse: interoNonNegativo(d.corse ?? 0, "Corse"),
    sostituisci: !!d.sostituisci,
  };
};

const datiFoto = (piano, d) => {
  const s = STAGIONI[d.stagione];
  if (!s) throw new ErroreDati("Scegli una stagione.");
  const periodi = Object.keys(
    leggiJson(piano, `json/${s.cartella}/generale.json`).subPeriods,
  );
  if (!periodi.includes(d.periodo))
    throw new ErroreDati(
      `Periodo non valido: scegli tra ${periodi.join(", ")}.`,
    );
  const foto = fotoCaricate(d.sid, "foto");
  if (!foto.length) throw new ErroreDati("Carica almeno una foto .jpg.");
  return { chiave: d.stagione, s, periodo: d.periodo, foto };
};

const datiPrimoGiro = (s, g) => {
  if (!g) return null;
  const data = leggiData(String(g.data || ""), new Date().getFullYear());
  if (typeof data === "string") throw new ErroreDati(`Primo giro: ${data}`);
  const lg = normalizzaLuogo(g, "Primo giro: ");
  const km = interoNonNegativo(g.km, "Primo giro, km");
  return {
    date: normalizzaData(`${data.giorno} ${MESI[data.mese]}`),
    place: costruisciPlace(lg),
    distance: km,
  };
};
