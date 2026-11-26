// ---------- aggiornamenti in tempo reale (senza ricaricare la pagina) ----------
// Il server controlla le cartelle Img e json e manda un avviso (SSE) quando qualcosa cambia:
// un'immagine creata dal gestionale, da codice o a mano, un JSON modificato, un utente nuovo...
// Qui ricarico i dati e ridisegno le liste; moduli e finestre aperti non vengono toccati.
const NOMI_AREE = {
  bandiere: "bandiere",
  giri: "giri",
  utenti: "utenti",
  statistiche: "statistiche",
  immagini: "immagini",
};
const live = {
  fonte: null,
  timer: null,
  inCorso: false,
  ripeti: false,
  eraCaduta: false,
  aree: new Set(),
};
const segnaLive = (connesso) => {
  const pillola = $("#stato-server");
  if (!pillola || pillola.dataset.stato === "off") return;
  pillola.dataset.live = connesso ? "on" : "off";
  pillola.title = connesso
    ? "Server connesso · i dati si aggiornano da soli"
    : "Server connesso · aggiornamento automatico in riconnessione";
};
const aggiornaDatiLive = async () => {
  if (live.inCorso) {
    live.ripeti = true;
    return;
  }
  live.inCorso = true;
  const aree = [...live.aree];
  live.aree.clear();
  try {
    do {
      live.ripeti = false;
      await ricarica(); // stato e bandiere della parte "Inserimento"
      if (datiCaricati) await caricaTutto();
      window.dispatchEvent(new Event("bandiere:aggiornate"));
    } while (live.ripeti);
    // Avviso solo per modifiche arrivate da fuori (cartelle toccate a mano o da codice).
    if (Date.now() - ultimaModificaLocale > 3000 && aree.length)
      avvisa(
        `Aggiornato in automatico: ${aree.map((a) => NOMI_AREE[a] || a).join(", ")}.`,
      );
  } catch {
    /* il prossimo avviso riprova */
  } finally {
    live.inCorso = false;
  }
};
const programmaAggiornamento = (aree = []) => {
  aree.forEach((a) => live.aree.add(a));
  clearTimeout(live.timer);
  live.timer = setTimeout(aggiornaDatiLive, 150);
};
const collegaAggiornamentiLive = () => {
  if (!("EventSource" in window)) return;
  const fonte = new EventSource("/api/eventi");
  live.fonte = fonte;
  fonte.addEventListener("pronto", () => {
    segnaLive(true);
    // dopo una caduta della connessione recupero quello che può essere cambiato nel frattempo
    if (live.eraCaduta) {
      live.eraCaduta = false;
      programmaAggiornamento();
    }
  });
  fonte.addEventListener("cambiato", (e) => {
    let aree = [];
    try {
      aree = JSON.parse(e.data).aree || [];
    } catch {
      /* avviso senza dettagli: ricarico lo stesso */
    }
    programmaAggiornamento(aree);
  });
  fonte.addEventListener("error", () => {
    live.eraCaduta = true;
    segnaLive(false);
  });
};
collegaAggiornamentiLive();
