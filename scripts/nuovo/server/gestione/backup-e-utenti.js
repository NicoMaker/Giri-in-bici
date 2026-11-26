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
// Per ogni utente indico se il file dell'avatar esiste davvero e da dove si vede (/img/About_US/...).
const CARTELLA_AVATAR = "Img/About_US";
const avatarUtente = (u) => {
  const file = String(u.avatar || "");
  if (!file || /[\\/]/.test(file))
    return { avatarSrc: "", avatarMancante: !!file };
  const completo = assoluto(`${CARTELLA_AVATAR}/${file}`);
  if (!fs.existsSync(completo)) return { avatarSrc: "", avatarMancante: true };
  const v = Math.round(fs.statSync(completo).mtimeMs);
  return {
    avatarSrc: `/img/About_US/${encodeURIComponent(file)}?v=${v}`,
    avatarMancante: false,
  };
};
const elencoUtenti = () =>
  leggiUtenti().map((u) => ({ ...u, ...avatarUtente(u) }));
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
// Elimina più utenti in una sola scrittura. Deve restarne almeno uno.
const eliminaUtenti = ({ usernames }) => {
  const richiesti = [
    ...new Set((Array.isArray(usernames) ? usernames : []).map(String)),
  ];
  if (!richiesti.length)
    throw new Error("Seleziona almeno un utente da eliminare.");
  const dati = leggi(FILE_UTENTI);
  const lista = dati.users || [];
  const trovati = richiesti.filter((nome) =>
    lista.some((x) => x.username === nome),
  );
  if (!trovati.length)
    throw new Error("Gli utenti selezionati non esistono più.");
  if (trovati.length >= lista.length)
    throw new Error(
      "Non puoi eliminare tutti gli utenti: ne deve restare almeno uno.",
    );
  dati.users = lista.filter((x) => !trovati.includes(x.username));
  scriviTransazione(new Map([[FILE_UTENTI, formattaJson(dati)]]));
  return {
    ok: true,
    eliminati: trovati.length,
    messaggio:
      trovati.length === 1
        ? "Utente eliminato."
        : `${trovati.length} utenti eliminati.`,
  };
};
