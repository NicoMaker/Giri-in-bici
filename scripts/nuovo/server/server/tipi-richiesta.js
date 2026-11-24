        ok: false,
        errore: "Modalità --prova attiva: disattivala per salvare modifiche.",
      });
    if (req.method === "GET" && url.pathname === "/api/stato")
      return inviaJson(res, 200, { ok: true, ...api.stato() });
    if (req.method === "GET" && url.pathname === "/api/elenco")
      return inviaJson(res, 200, { ok: true, ...api.elenco() });
    if (req.method === "GET" && url.pathname === "/api/gestione/giri")
      return inviaJson(res, 200, { ok: true, giri: gestione.elencoGiri() });
    if (req.method === "GET" && url.pathname === "/api/gestione/paesi")
      return inviaJson(res, 200, { ok: true, paesi: gestione.elencoPaesi() });
    if (req.method === "POST" && url.pathname === "/api/gestione/bandiere") {
      const immagine = await leggiCorpo(req, MAX_BANDIERA);
      return inviaJson(
        res,
        201,
        gestione.salvaBandieraPersonalizzata(
          url.searchParams.get("nome"),
          immagine,
        ),
      );
    }
    if (req.method === "GET" && url.pathname === "/api/gestione/utenti")
      return inviaJson(res, 200, { ok: true, utenti: gestione.elencoUtenti() });
    if (req.method === "POST" && url.pathname === "/api/gestione/utenti/salva")
      return inviaJson(
        res,
        200,
        gestione.salvaUtente(await leggiJsonRichiesta(req, 64 * 1024)),
      );
    if (
      req.method === "POST" &&
      url.pathname === "/api/gestione/utenti/elimina"
    )
      return inviaJson(
        res,
        200,
        gestione.eliminaUtente(await leggiJsonRichiesta(req, 64 * 1024)),
      );
    if (req.method === "GET" && url.pathname === "/api/gestione/stagioni")
      return inviaJson(res, 200, {
        ok: true,
        stagioni: gestione.listaStagioni(),
      });
    if (
      req.method === "GET" &&
      url.pathname === "/api/gestione/statistiche-colori"
    )
      return inviaJson(res, 200, statistiche.leggiColoriStatistiche());
    if (
      req.method === "POST" &&
      url.pathname === "/api/gestione/statistiche/colore-anno"
    )
      return inviaJson(
        res,
        200,
        statistiche.salvaColoreAnno(await leggiJsonRichiesta(req, 64 * 1024)),
      );
    if (
      req.method === "POST" &&
      url.pathname === "/api/gestione/statistiche/colore-mese"
    )
      return inviaJson(
        res,
        200,
        statistiche.salvaColoreMese(await leggiJsonRichiesta(req, 64 * 1024)),
      );
    if (req.method === "POST" && url.pathname === "/api/gestione/giri/salva")
      return inviaJson(
        res,
        200,
        gestione.salvaGiro(await leggiJsonRichiesta(req)),
      );
    if (req.method === "POST" && url.pathname === "/api/gestione/giri/elimina")
      return inviaJson(
        res,
        200,
        gestione.eliminaGiro(await leggiJsonRichiesta(req, 64 * 1024)),
      );
    if (
      req.method === "POST" &&
      url.pathname === "/api/gestione/stagioni/colore"
    )
      return inviaJson(
        res,
        200,
        gestione.salvaColore(await leggiJsonRichiesta(req, 64 * 1024)),
      );
    if (
      req.method === "POST" &&
      url.pathname === "/api/gestione/stagioni/elimina-periodo"
    )
      return inviaJson(
        res,
        200,
        gestione.eliminaPeriodo(await leggiJsonRichiesta(req, 64 * 1024)),
      );
    if (req.method === "POST" && url.pathname === "/api/upload") {
      const corpo = await leggiCorpo(req, api.MAX_FOTO);
      api.salvaCaricamento(
        url.searchParams.get("sid"),
        url.searchParams.get("cartella"),
        url.searchParams.get("nome"),
        corpo,
      );
      return inviaJson(res, 200, { ok: true });
    }
    if (
      req.method === "POST" &&
      ["/api/anteprima", "/api/conferma"].includes(url.pathname)
    ) {
      const richiesta = await leggiJsonRichiesta(req, 1024 * 1024);
      const risposta =
        url.pathname === "/api/anteprima"
          ? await api.anteprima(richiesta.azione, richiesta.dati)
          : await api.conferma(richiesta.azione, richiesta.dati);
      return inviaJson(res, 200, risposta);
    }
    return inviaJson(res, 404, { ok: false, errore: "Percorso non trovato." });
  } catch (e) {
    const previsto =
      e instanceof api.ErroreDati ||
      /non esiste|non valido|username|esiste già|sconosciut|titolo|link|avatar|bandiera|immagine|nome file|non trov|obbligatorio|inserisci|deve|km negativi|non può|non puoi|mese non/i.test(
        e.message,
      );
    return inviaJson(res, previsto ? 400 : 500, {
      ok: false,
      errore: e.message,
    });
  }
};
const ipv4Locali = () =>
  Object.values(os.networkInterfaces())
    .flat()
    .filter((x) => x && x.family === "IPv4" && !x.internal)
    .map((x) => x.address);
const avvia = () => {
  if (
    !fs.existsSync(path.join(RADICE, "json/Statistiche/History/Storico.json"))
  ) {
