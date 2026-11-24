"use strict";

// Strumenti CRUD locali: le statistiche vengono aggiornate insieme ai JSON dei giri.
const fs = require("fs");
const path = require("path");
const {
  RADICE,
  STAGIONI,
  MESI,
  PERCORSO_STORICO_JSON,
  PERCORSO_STAGIONI_JSON,
} = require("../base/impostazioni");
const { validaColore } = require("../base/utilita");
const {
  PAESI,
  bandiereMancanti,
  normalizzaLuogo,
  costruisciPlace,
  leggiPlace,
} = require("../base/luogo");

const assoluto = (rel) => path.join(RADICE, rel);
const leggi = (rel) => JSON.parse(fs.readFileSync(assoluto(rel), "utf8"));
const formattaJson = (x) => `${JSON.stringify(x, null, 2)}\n`;
const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const dataSalvata = (g) => {
  const m = String(g.date || "").match(/^(\d{1,2})\s+([A-Za-zàèéìòù]+)$/i);
  const mese =
    m && MESI.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  return m && mese >= 0 ? { giorno: Number(m[1]), mese } : null;
};
const annoPeriodo = (chiave, periodo, mese) => {
  if (STAGIONI[chiave].formato === "anno") return Number(periodo);
  const [inizio, fine] = periodo.split("-").map(Number);
  return mese >= 8 ? inizio : fine;
};
const estraiLuogoLink = (place) => {
  let luogo = String(place || "");
  let link = "";
  const a = luogo.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
  if (a) {
    link = a[1];
    luogo = a[2];
  }
  luogo = luogo
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return { luogo, link };
};
const elencoGiri = () => {
  const out = [];
  for (const [chiave, s] of Object.entries(STAGIONI)) {
    const generale = leggi(`json/${s.cartella}/generale.json`);
    for (const [periodo, file] of Object.entries(generale.subPeriods)) {
      leggi(file).forEach((g, index) => {
        const d = dataSalvata(g);
        if (!d) return;
        const { luogo, links, flags } = leggiPlace(g.place);
        const anno = annoPeriodo(chiave, periodo, d.mese);
        out.push({
          id: `${encodeURIComponent(chiave)}|${encodeURIComponent(periodo)}|${index}`,
          stagione: chiave,
          etichetta: s.testo,
          periodo,
          data: `${anno}-${String(d.mese + 1).padStart(2, "0")}-${String(d.giorno).padStart(2, "0")}`,
          luogo,
          links,
          flags,
          link: (links[0] || {}).url || "",
          km: Number(g.distance) || 0,
        });
      });
    }
  }
  return out.sort((a, b) => b.data.localeCompare(a.data));
};
const stagioneDaId = (id) => {
  const [k, p, i] = String(id || "")
    .split("|")
    .map(decodeURIComponent);
  if (
    !STAGIONI[k] ||
    !/^\d{4}(?:-\d{4})?$/.test(p || "") ||
    !/^\d+$/.test(i || "")
  )
    throw new Error("Identificativo giro non valido.");
  return { chiave: k, periodo: p, index: Number(i), s: STAGIONI[k] };
};
const parseData = (iso) => {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new Error("Inserisci una data valida.");
  const [anno, mese, giorno] = m.slice(1).map(Number);
  const d = new Date(Date.UTC(anno, mese - 1, giorno));
  if (
    d.getUTCFullYear() !== anno ||
    d.getUTCMonth() !== mese - 1 ||
    d.getUTCDate() !== giorno
  )
    throw new Error("La data inserita non esiste.");
  return { anno, mese: mese - 1, giorno };
};
const periodoGiro = (chiave, d) =>
  STAGIONI[chiave].formato === "anno"
    ? String(d.anno)
    : d.mese >= 8
      ? `${d.anno}-${d.anno + 1}`
      : `${d.anno - 1}-${d.anno}`;
const nomeFileGiri = (chiave, periodo) =>
  `json/${STAGIONI[chiave].cartella}/Periodi/${periodo}.json`;
const scriviTransazione = (modifiche) => {
  const prima = new Map();
  try {
    for (const [rel, contenuto] of modifiche) {
      const file = assoluto(rel);
      prima.set(rel, fs.existsSync(file) ? fs.readFileSync(file) : null);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const temp = `${file}.tmp-${process.pid}`;
      fs.writeFileSync(temp, contenuto);
      fs.renameSync(temp, file);
    }
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

  const pagina = `${s.cartella}/${periodo}.html`;
  const cartellaImmagini = path.join(
    path.basename(
      fs.existsSync(assoluto("img")) ? assoluto("img") : assoluto("Img"),
    ),
    s.cartella,
    periodo,
  );
  const immaginiAssoluto = assoluto(cartellaImmagini);
  const backup = new Map();
  const raccogliBackup = (p) => {
    if (!fs.existsSync(p)) return;
    const stat = fs.lstatSync(p);
    if (stat.isSymbolicLink())
      throw new Error(
        "Eliminazione bloccata: la destinazione contiene un collegamento simbolico.",
      );
    if (stat.isDirectory()) {
      for (const nome of fs.readdirSync(p)) raccogliBackup(path.join(p, nome));
      backup.set(p, null);
    } else backup.set(p, fs.readFileSync(p));
  };
  const destinazioni = [assoluto(giroFile), assoluto(pagina), immaginiAssoluto];
  destinazioni.forEach(raccogliBackup);
  const fileOriginali = new Map(
    [...changes.keys()].map((rel) => [
      rel,
      fs.existsSync(assoluto(rel)) ? fs.readFileSync(assoluto(rel)) : null,
    ]),
  );
  try {
    scriviTransazione(changes);
    for (const destinazione of destinazioni)
      fs.rmSync(destinazione, { recursive: true, force: true });
  } catch (e) {
    for (const [rel, bytes] of fileOriginali) {
      const file = assoluto(rel);
      if (bytes === null) fs.rmSync(file, { force: true });
      else {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, bytes);
      }
    }
    for (const [destinazione, bytes] of backup) {
      if (bytes === null) fs.mkdirSync(destinazione, { recursive: true });
      else {
        fs.mkdirSync(path.dirname(destinazione), { recursive: true });
        fs.writeFileSync(destinazione, bytes);
      }
    }
    throw e;
  }
  return {
    ok: true,
    messaggio: `${s.testo} ${periodo} eliminato: rimossi pagina, JSON, foto e statistiche aggiornate (${giri.length} giri).`,
  };
};

// ---------- utenti (json/About_US/Users.json) ----------
const FILE_UTENTI = "json/About_US/Users.json";
const leggiUtenti = () => leggi(FILE_UTENTI).users || [];
const elencoUtenti = () => leggiUtenti();
const pulisciUtente = (u) => {
  const t = (k) => String(u[k] ?? "").trim();
  const username = t("username");
  if (!/^[\w.\-]{2,40}$/.test(username))
    throw new Error(
      "Username non valido: 2-40 caratteri tra lettere, numeri, punto, trattino e underscore.",
    );
  if (/[<>]/.test(t("name") + t("description")))
    throw new Error("Nome e descrizione non possono contenere < o >.");
  const avatar = t("avatar");
  if (avatar && !/^[\w.\- ]+\.(jpe?g|png|webp|gif|svg)$/i.test(avatar))
    throw new Error("Avatar: scrivi solo il nome del file (es. AvatarNM.jpg).");
  const komoot = t("komootUrl");
  if (komoot && !/^https?:\/\/[^\s"<>]+$/i.test(komoot))
    throw new Error("Il link Komoot deve iniziare con http:// o https://.");
  const out = {
    name: t("name"),
    username,
    description: t("description"),
    avatar,
    komootUrl: komoot,
    visibleInTeam: !!u.visibleInTeam,
  };
  for (const k of ["name", "description", "avatar", "komootUrl"])
    if (!out[k]) delete out[k];
  return out;
};
const salvaUtente = (body) => {
  const dati = leggi(FILE_UTENTI);
  const lista = dati.users || [];
  const nuovo = pulisciUtente(body);
  const prima = body.originale
    ? lista.findIndex((x) => x.username === body.originale)
    : -1;
  if (body.originale && prima < 0)
    throw new Error("L'utente da modificare non esiste più.");
  if (
    lista.some(
      (x, i) =>
        i !== prima &&
        x.username.toLowerCase() === nuovo.username.toLowerCase(),
    )
  )
    throw new Error("Esiste già un utente con questo username.");
  if (prima >= 0) lista[prima] = nuovo;
  else lista.push(nuovo);
  dati.users = lista;
  scriviTransazione(new Map([[FILE_UTENTI, formattaJson(dati)]]));
  return {
    ok: true,
    messaggio: prima >= 0 ? "Utente modificato." : "Utente aggiunto.",
  };
};
const eliminaUtente = ({ username }) => {
  const dati = leggi(FILE_UTENTI);
  const lista = dati.users || [];
  const i = lista.findIndex((x) => x.username === username);
  if (i < 0) throw new Error("L'utente da eliminare non esiste più.");
  if (lista.length <= 1) throw new Error("Non puoi eliminare l'ultimo utente.");
  lista.splice(i, 1);
  dati.users = lista;
  scriviTransazione(new Map([[FILE_UTENTI, formattaJson(dati)]]));
  return { ok: true, messaggio: "Utente eliminato." };
};
const elencoPaesi = () => PAESI;
module.exports = {
  elencoUtenti,
  salvaUtente,
  eliminaUtente,
  elencoPaesi,
  elencoGiri,
  listaStagioni,
  listaPeriodiGestibili,
  salvaGiro,
  eliminaGiro,
  salvaColore,
  eliminaPeriodo,
};
