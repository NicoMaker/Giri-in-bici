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
const estensioneImmagineBandiera = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12)
    throw new Error("Il file della bandiera non è valido.");
  if (buffer.length > 5 * 1024 * 1024)
    throw new Error("L'immagine è troppo grande: il limite è 5 MB.");
  if (
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  )
    return "png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return "jpg";
  if (
