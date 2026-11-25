// ---------- colori e periodi ----------
let colori = { anni: [], mesi: [] };
const aggiornaPeriodoColore = () => {
  const s = stagioni.filter((x) => x.chiave === $("#col-stagione").value);
  opzioni(
    $("#col-periodo"),
    s.map((x) => [x.periodo, x.periodo]),
  );
  if (s[0]) $("#colore").value = s[0].colore;
};
const cartaColore = (titolo, valore, url, campo) =>
  el(
    "label",
    { class: "colore-stat-card" },
    el("span", { text: titolo }),
    el("input", {
      type: "color",
      value: valore,
      onchange: (e) =>
        chiama(url, { [campo]: titolo, colore: e.target.value }, dopoModifica),
    }),
  );
const disegnaPeriodi = () => {
  const q = norm($("#p-filtro").value.trim());
  const gruppi = [...new Set(stagioni.map((s) => s.chiave))];
  $("#lista-periodi").replaceChildren(
    ...gruppi.map((k) => {
      const lista = stagioni.filter(
        (s) =>
          s.chiave === k &&
          (!q || norm(`${s.etichetta} ${s.periodo}`).includes(q)),
      );
      return lista.length
        ? el(
            "div",
            { class: "periodo-gruppo" },
            el("h3", { text: lista[0].etichetta }),
            el(
              "div",
              { class: "periodi-grid" },
              lista.map((s) =>
                el(
                  "div",
                  {
                    class: "periodo-card",
                    style: `--periodo-colore:${s.colore}`,
                  },
                  el("span", {
                    class: "periodo-chip",
                    text: s.periodo,
                  }),
                  el("button", {
                    class: "btn danger",
                    type: "button",
                    text: "Elimina",
                    onclick: async () => {
                      if (
                        await conferma(
                          "Eliminare il periodo?",
                          `${s.etichetta} ${s.periodo}: verranno rimossi pagina, JSON, foto e giri. Le statistiche si aggiornano.`,
                        )
                      )
                        await chiama(
                          "/api/gestione/stagioni/elimina-periodo",
                          { stagione: s.chiave, periodo: s.periodo },
                          dopoModifica,
                        );
                    },
                  }),
                ),
              ),
            ),
          )
        : null;
    }),
  );
};

const caricaTutto = async () => {
  mostraScheletri();
  const [g, s, c, u] = await Promise.all([
    api("/api/gestione/giri"),
    api("/api/gestione/stagioni"),
    api("/api/gestione/statistiche-colori"),
    api("/api/gestione/utenti"),
  ]);
  if (!g.ok) return avvisa(g.errore, true);
  giri = g.giri;
  stagioni = s.stagioni || [];
  colori = c.ok ? c : colori;
  utenti = u.utenti || [];
  const chiavi = [...new Map(stagioni.map((x) => [x.chiave, x.etichetta]))];
  opzioni($("#f-stagione"), chiavi);
  opzioni($("#col-stagione"), chiavi);
  costruisciFiltri();
  selBandiere.ricarica();
  $("#colori-anni").replaceChildren(
    ...colori.anni.map((a) =>
      cartaColore(
        a.anno,
        a.colore,
        "/api/gestione/statistiche/colore-anno",
        "anno",
      ),
    ),
  );
  $("#colori-mesi").replaceChildren(
    ...colori.mesi.map((m) =>
      cartaColore(
        m.nome,
        m.colore,
        "/api/gestione/statistiche/colore-mese",
        "mese",
      ),
    ),
  );
  aggiornaPeriodoColore();
  disegnaGiri();
  disegnaUtenti();
  disegnaBandiere();
  disegnaRiepilogo();
  disegnaPeriodi();
};
// dopo un salvataggio o un'eliminazione: ricarica i dati, svuota i moduli e chiude le finestre
const dopoModifica = async () => {
  await caricaTutto();
  azzeraGiro();
  azzeraUtente();
  azzeraBandiera();
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
};
