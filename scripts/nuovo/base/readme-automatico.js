"use strict";

// README automatico: la sezione "Aggiornare i Dati JSON" del readme.md si riscrive da sola.
// Anno, stagione, periodo, mese, percorsi e numeri (km del mese, corse dell'anno) arrivano
// dalla data di oggi e dai JSON del sito: nel readme.md non si tocca più niente a mano.
//
// Si attiva da sola (1) all'avvio del gestionale e (2) dopo ogni salvataggio.
// A mano:  node scripts/aggiorna-readme.js            riscrive il readme se serve
//          node scripts/aggiorna-readme.js --controlla  esce con errore se è da aggiornare
//          node scripts/aggiorna-readme.js --stampa     mostra la sezione senza scrivere

const fs = require("fs");
const path = require("path");
const { RADICE, MESI, STAGIONI } = require("./impostazioni");

const INIZIO = "<!-- AUTO:DATI-JSON:INIZIO -->";
const FINE = "<!-- AUTO:DATI-JSON:FINE -->";
// Primo titolo che segue la sezione: serve solo la prima volta, per mettere i segnaposto.
const TITOLO_SUCCESSIVO = "## 🗓 Inizio di una Nuova Stagione";

const leggi = (rel) => JSON.parse(fs.readFileSync(path.join(RADICE, rel), "utf8"));
const leggiOppure = (rel, predefinito) => {
  try {
    return leggi(rel);
  } catch {
    return predefinito;
  }
};

// "22 Novembre" -> { giorno: 22, mese: 10 } (oppure null)
const leggiDataSalvata = (testo) => {
  const m = String(testo).match(/^(\d{1,2})\s+(\S+)/);
  if (!m) return null;
  const mese = MESI.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  return mese === -1 ? null : { giorno: parseInt(m[1], 10), mese };
};

// Anno di calendario in cui parte un periodo ("2026" o "2026-2027" -> 2026).
const annoInizio = (periodo) => parseInt(periodo, 10);

// Anno "vero" di un giro: nei bienni da Settembre in poi è il primo anno, prima è il secondo.
const annoDelGiro = (chiave, periodo, mese) => {
  if (STAGIONI[chiave].formato === "anno") return parseInt(periodo, 10);
  const [a, b] = periodo.split("-").map((x) => parseInt(x, 10));
  return mese >= 8 ? a : b;
};

// Tutti i periodi di tutte le stagioni, letti dai generale.json.
const elencaPeriodi = () => {
  const out = [];
  for (const [chiave, s] of Object.entries(STAGIONI)) {
    const generale = leggiOppure(`json/${s.cartella}/generale.json`, null);
    if (!generale || !generale.subPeriods) continue;
    for (const [periodo, file] of Object.entries(generale.subPeriods)) {
      out.push({ chiave, periodo, file });
    }
  }
  return out;
};

// Il periodo "in corso" a una certa data: quello che è iniziato più di recente
// (mese iniziale della stagione, da impostazioni) e il cui file esiste davvero.
const periodoInCorso = (periodi, oggi) => {
  const adesso = oggi.getFullYear() * 12 + oggi.getMonth();
  let migliore = null;
  for (const p of periodi) {
    if (!fs.existsSync(path.join(RADICE, p.file))) continue;
    const mesePartenza = MESI.indexOf(STAGIONI[p.chiave].meseIniziale);
    const inizio = annoInizio(p.periodo) * 12 + (mesePartenza < 0 ? 0 : mesePartenza);
    if (inizio > adesso) continue; // non è ancora iniziato
    if (!migliore || inizio > migliore.inizio) migliore = { ...p, inizio };
  }
  if (migliore) return migliore;
  // Nessun periodo già iniziato (sito vuoto o data strana): prendi l'ultimo che c'è.
  const esistenti = periodi.filter((p) => fs.existsSync(path.join(RADICE, p.file)));
  esistenti.sort((a, b) => annoInizio(a.periodo) - annoInizio(b.periodo));
  return esistenti[esistenti.length - 1] || null;
};

// Km e numero di giri di un mese di un anno, sommando i giri salvati di tutte le stagioni.
const sommaDaiGiri = (periodi, anno, mese) => {
  let km = 0;
  let giri = 0;
  for (const p of periodi) {
    const lista = leggiOppure(p.file, []);
    if (!Array.isArray(lista)) continue;
    for (const g of lista) {
      const d = leggiDataSalvata(g.date);
      if (d && d.mese === mese && annoDelGiro(p.chiave, p.periodo, d.mese) === anno) {
        km += Number(g.distance) || 0;
        giri++;
      }
    }
  }
  return { km, giri };
};

// I numeri del momento, pronti da scrivere nel readme. `oggi` si può passare per le prove.
const raccogliDati = (oggi = new Date()) => {
  const periodi = elencaPeriodi();
  const corrente = periodoInCorso(periodi, oggi);
  const anno = oggi.getFullYear();
  const mese = oggi.getMonth();
  const fileAnno = `json/Statistiche/anni/${anno}.json`;
  const statistiche = leggiOppure(fileAnno, null);
  const dai = sommaDaiGiri(periodi, anno, mese);
  const kmStat =
    statistiche && statistiche.data && Object.hasOwn(statistiche.data, MESI[mese])
      ? Number(statistiche.data[MESI[mese]])
      : null;
  return {
    anno,
    nomeMese: MESI[mese],
    corrente,
    nomeStagione: corrente ? STAGIONI[corrente.chiave].testo : null,
    giriMese: dai.giri,
    kmMese: dai.km,
    fileAnno,
    esisteAnno: Boolean(statistiche),
    kmMeseStatistiche: kmStat,
    corseAnno: statistiche ? Number(statistiche.numberOfRaces) : null,
  };
};

const sezione = (d) => {
  const righe = [];
  righe.push("### Stagione", "");
  if (d.corrente) {
    righe.push(
      `1. **Aggiorna il file JSON per la stagione ${d.nomeStagione} ${d.corrente.periodo}**`,
      `   - **Percorso:** [\`${d.corrente.file}\`](${d.corrente.file})`,
      "   - Aggiungi i dettagli delle corse seguendo lo stesso schema delle altre corse.",
    );
  } else {
    righe.push(
      "1. **Nessuna stagione trovata**",
      "   - Crea la prima stagione dal gestionale (`node scripts/server.js`).",
    );
  }
  righe.push("", "### Statistiche", "");
  righe.push(
    `1. **Aggiorna il file JSON per le statistiche per il ${d.anno}**`,
    `   - **Percorso:** [\`${d.fileAnno}\`](${d.fileAnno})`,
  );
  if (d.esisteAnno) {
    righe.push(
      `   - Modifica i chilometri (km) di ${d.nomeMese} e aggiorna il numero totale di corse dell'anno.`,
    );
  } else {
    righe.push(
      `   - Il file del ${d.anno} non esiste ancora: crealo dal gestionale ("Un nuovo ANNO di Statistiche").`,
    );
  }
  return righe.join("\n");
};

const blocco = (d) =>
  `${INIZIO}\n<!-- Sezione generata da scripts/aggiorna-readme.js: non modificarla a mano. -->\n\n${sezione(d)}\n\n${FINE}`;

// Il readme aggiornato (stringa). Se i segnaposto non ci sono ancora, li crea al posto
// della vecchia sezione scritta a mano (da "### Stagione" al titolo successivo).
const costruisciReadme = (testo, d) => {
  const nuovo = blocco(d);
  const i = testo.indexOf(INIZIO);
  const f = testo.indexOf(FINE);
  if (i !== -1 && f > i) return testo.slice(0, i) + nuovo + testo.slice(f + FINE.length);
  const da = testo.indexOf("### Stagione");
  const a = testo.indexOf(TITOLO_SUCCESSIVO);
  if (da === -1 || a === -1 || a < da) {
    throw new Error(
      `Nel readme non trovo la sezione da rendere automatica: servono i segnaposto ${INIZIO} ... ${FINE}.`,
    );
  }
  return `${testo.slice(0, da)}${nuovo}\n\n${testo.slice(a)}`;
};

// Riscrive il readme solo se cambia qualcosa. Ritorna { cambiato, file }.
const aggiornaReadme = ({ oggi = new Date(), soloControllo = false } = {}) => {
  const file = path.join(RADICE, "readme.md");
  const prima = fs.readFileSync(file, "utf8");
  const dopo = costruisciReadme(prima, raccogliDati(oggi));
  if (dopo === prima) return { cambiato: false, file };
  if (!soloControllo) fs.writeFileSync(file, dopo, "utf8");
  return { cambiato: true, file };
};

module.exports = { aggiornaReadme, costruisciReadme, raccogliDati, sezione, blocco };
