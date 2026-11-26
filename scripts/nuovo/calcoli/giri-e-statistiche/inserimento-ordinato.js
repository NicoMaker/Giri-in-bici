// Inserisce il giro nel testo del JSON del periodo, al posto giusto per data,
// senza toccare il resto del file. Ritorna { testo, posizione }.
const inserisciGiro = (testo, chiave, giro, giorno, mese) => {
  const { inizioArray, oggetti } = oggettiDellArray(testo);
  const blocco = JSON.stringify(giro, null, 2);
  if (!oggetti.length) {
    const dentro = blocco
      .split("\n")
      .map((r) => `  ${r}`)
      .join("\n");
    return {
      testo: `${testo.slice(0, inizioArray)}[\n${dentro}\n]${testo.slice(testo.indexOf("]", inizioArray) + 1)}`,
      posizione: 0,
    };
  }
  const nuovo = ordineNelPeriodo(chiave, giorno, mese);
  let indice = oggetti.length; // di default in fondo
  for (let i = 0; i < oggetti.length; i++) {
    const salvato = JSON.parse(
      testo.slice(oggetti[i].inizio, oggetti[i].fine + 1),
    );
    const d = leggiDataSalvata(salvato.date);
    if (d && ordineNelPeriodo(chiave, d.giorno, d.mese) > nuovo) {
      indice = i;
      break;
    }
  }
  const rientroDi = (pos) =>
    testo.slice(testo.lastIndexOf("\n", pos - 1) + 1, pos).match(/^[ \t]*/)[0];
  // rientro "normale" del file = quello più frequente (così un giro scritto a mano storto non fa scuola)
  const conteggio = {};
  oggetti.forEach((o) => {
    const r = rientroDi(o.inizio);
    conteggio[r] = (conteggio[r] || 0) + 1;
  });
  const rientro = Object.keys(conteggio).sort(
    (a, b) => conteggio[b] - conteggio[a],
  )[0];
  const corpo = blocco.split("\n").join(`\n${rientro}`);
  if (indice < oggetti.length) {
    // inserisco una riga intera prima del giro successivo: il suo rientro non cambia
    const p = oggetti[indice].inizio;
    const inizioRiga = testo.lastIndexOf("\n", p - 1) + 1;
    return {
      testo: `${testo.slice(0, inizioRiga)}${rientro}${corpo},\n${testo.slice(inizioRiga)}`,
      posizione: indice,
    };
  }
  const ultimo = oggetti[oggetti.length - 1];
  return {
    testo: `${testo.slice(0, ultimo.fine + 1)},\n${rientro}${corpo}${testo.slice(ultimo.fine + 1)}`,
    posizione: oggetti.length,
  };
};

// Km di un mese di un anno secondo i giri salvati (somma di tutte le stagioni).
const kmDaiGiri = (piano, anno, mese) => {
  let totale = 0;
  let numero = 0;
  for (const chiave of Object.keys(STAGIONI)) {
    const generale = leggiJson(
      piano,
      `json/${STAGIONI[chiave].cartella}/generale.json`,
    );
    for (const [periodo, file] of Object.entries(generale.subPeriods)) {
      for (const giro of leggiJson(piano, file)) {
        const d = leggiDataSalvata(giro.date);
        if (
          d &&
          d.mese === mese &&
          annoDelGiroInPeriodo(chiave, periodo, d.mese) === anno
        ) {
          totale += Number(giro.distance) || 0;
          numero++;
        }
      }
    }
  }
  return { km: totale, giri: numero };
};

// Aggiorna il JSON dell'anno: somma (o imposta) i km del mese — creandolo se non c'è —
// e aggiunge `corse` alle corse dell'anno. Cambia solo le righe necessarie.
const aggiornaAnno = (
  piano,
  anno,
  mese,
  km,
  { corse = 0, sostituisci = false } = {},
) => {
  const file = `json/Statistiche/anni/${anno}.json`;
  if (!piano.esiste(file)) {
    throw new Error(
      `Non esiste ancora l'anno ${anno} (${file}). Crealo prima con: node scripts/nuovo.js → "Un nuovo ANNO di Statistiche".`,
    );
  }
  let testo = piano.leggi(file);
  const dati = JSON.parse(testo);
  const nome = MESI[mese];
  const prima = Object.prototype.hasOwnProperty.call(dati.data, nome)
    ? Number(dati.data[nome])
    : null;
  const dopo = sostituisci || prima === null ? km : prima + km;

  if (prima !== null) {
    const { inizio, fine } = trovaBlocco(testo, "data", "{", "}");
    const corpo = testo
      .slice(inizio, fine)
      .replace(new RegExp(`("${nome}"\\s*:\\s*)-?\\d+(\\.\\d+)?`), `$1${dopo}`);
    testo = testo.slice(0, inizio) + corpo + testo.slice(fine);
  } else {
    // Mese nuovo: lo metto al suo posto nell'ordine del calendario.
    const successivo = Object.keys(dati.data)
      .map((k) => ({ k, i: MESI.indexOf(k) }))
      .filter((x) => x.i > mese)
      .sort((a, b) => a.i - b.i)[0];
    if (successivo) {
      const re = new RegExp(`"${successivo.k}"\\s*:`);
      const m = re.exec(testo);
      const rientro = testo.slice(
        testo.lastIndexOf("\n", m.index - 1) + 1,
        m.index,
      );
      const sep =
        /^[ \t]*$/.test(rientro) && testo.lastIndexOf("\n", m.index - 1) !== -1
          ? `\n${rientro}`
          : " ";
      testo = `${testo.slice(0, m.index)}"${nome}": ${dopo},${sep}${testo.slice(m.index)}`;
    } else {
      const { inizio, fine } = trovaBlocco(testo, "data", "{", "}");
      testo = accoda(testo, inizio, fine, `"${nome}": ${dopo}`);
    }
  }
  const corseDopo = Number(dati.numberOfRaces) + corse;
  if (corse)
    testo = testo.replace(/("numberOfRaces"\s*:\s*)\d+/, `$1${corseDopo}`);
  piano.modifica(file, testo);
  return {
    file,
    prima,
    dopo,
    creato: prima === null,
    corsePrima: Number(dati.numberOfRaces),
    corseDopo,
  };
};
