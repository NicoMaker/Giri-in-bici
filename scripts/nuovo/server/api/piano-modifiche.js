const datiStagione = (piano, chiave, d, periodoForzato) => {
  const s = STAGIONI[chiave];
  if (!s) throw new ErroreDati("Scegli una stagione.");
  const generale = leggiJson(piano, `json/${s.cartella}/generale.json`);
  const esistenti = Object.keys(generale.subPeriods).sort(ordinaPeriodi);
  const ultimo = esistenti[esistenti.length - 1];
  const periodo = String(periodoForzato || d.periodo || "").trim();
  const errore = validaPeriodo(s.formato, esistenti)(periodo);
  if (errore) throw new ErroreDati(`${s.testo}: ${errore}`);
  const colore = controllaColore(
    piano,
    d.colore,
    generale.colors || [],
    `${s.testo} ${periodo}`,
  );
  const fotoDaCopiare = fotoCaricate(d.sid, "foto");
  const nFoto =
    fotoDaCopiare.length || interoNonNegativo(d.nFoto ?? 0, "Numero di foto");
  if (nFoto > 300) throw new ErroreDati("Troppe foto (massimo 300).");
  return {
    chiave,
    periodo,
    colore,
    nFoto,
    fotoDaCopiare,
    giro: datiPrimoGiro(s, d.primoGiro),
    ultimo,
  };
};

const datiAnno = (piano, d) => {
  const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
  const esistenti = Object.keys(storico.anni).sort(ordinaPeriodi);
  const ultimo = esistenti[esistenti.length - 1];
  const anno = String(d.anno || "").trim();
  const errore = validaPeriodo("anno", esistenti)(anno);
  if (errore) throw new ErroreDati(`Statistiche: ${errore}`);
  const colore = controllaColore(
    piano,
    d.colore,
    storico.coloriAnni || [],
    `Anno ${anno}`,
  );
  const icona = fotoCaricate(d.iconaSid, "icona")[0] || null;

  let mese = "Gennaio";
  let km = 0;
  let corse = 0;
  let esempio = true;
  if (d.primoMese) {
    const trovato = MESI.find(
      (m) => m.toLowerCase() === String(d.primoMese.mese || "").toLowerCase(),
    );
    if (!trovato) throw new ErroreDati("Primo mese: scegli un mese.");
    mese = trovato;
    km = interoNonNegativo(d.primoMese.km, "Km del mese");
    corse = interoNonNegativo(d.primoMese.corse, "Corse dell'anno");
    esempio = false;
  }
  return { anno, colore, icona, mese, km, corse, esempio, ultimo };
};

// ---------- costruzione del piano ----------

const costruisciPiano = async (azione, d) => {
  const piano = nuovoPiano();
  d = d || {};
  switch (azione) {
    case "giro":
      await applicaGiro(piano, datiGiro(d));
      break;
    case "mese":
      applicaMese(piano, datiMese(piano, d));
      break;
    case "foto":
      applicaFoto(piano, datiFoto(piano, d));
      break;
    case "stagione":
      applicaStagione(piano, datiStagione(piano, d.stagione, d));
      break;
    case "anno":
      applicaAnno(piano, datiAnno(piano, d));
      break;
    case "anno-completo": {
      const dati = datiAnno(piano, d);
      const n = parseInt(dati.anno, 10);
      const periodi = {
        Primavera: String(n),
        Estate: String(n),
        Autunno_Inverno: `${n}-${n + 1}`,
      };
      const stagioni = Object.keys(periodi).map((chiave) =>
        datiStagione(
          piano,
          chiave,
          (d.stagioni || {})[chiave] || {},
          periodi[chiave],
        ),
      );
      applicaAnno(piano, dati);
      stagioni.forEach((x) => applicaStagione(piano, x));
      break;
    }
    default:
      throw new ErroreDati("Azione sconosciuta.");
  }
  piano.valida();
  return piano;
};

const riepilogo = (piano) => ({
  note: piano.note.map(pulisci),
  avvisi: piano.avvisi.map(pulisci),
  creati: [...piano.creati],
  modificati: [...piano.modificati],
  cartelle: [...piano.cartelle],
  promemoria: piano.promemoria.map(pulisci),
  esempio: piano.esempio,
});

const anteprima = async (azione, dati) => ({
  ok: true,
  prova: PROVA,
  ...riepilogo(await costruisciPiano(azione, dati)),
});

// Le scritture una alla volta, per non far litigare due conferme ravvicinate.
let coda = Promise.resolve();
