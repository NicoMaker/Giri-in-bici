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
const COLORI_STAGIONE_PREDEFINITI = {
  Primavera: "#0ca678",
  Estate: "#f76707",
  Autunno_Inverno: "#1971c2",
};
const aHex = (c) => {
  // il selettore colore accetta solo #rrggbb: converto #abc e i nomi CSS (gold, teal…)
  const v = String(c || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(v))
    return `#${[...v.slice(1)].map((x) => x + x).join("")}`.toLowerCase();
  const prova = document.createElement("canvas").getContext?.("2d");
  if (prova) {
    prova.fillStyle = "#000";
    prova.fillStyle = v;
    if (/^#[0-9a-f]{6}$/i.test(prova.fillStyle)) return prova.fillStyle;
  }
  return "#2dd4bf";
};
const disegnaStagioni = () => {
  const box = $("#stagioni-box");
  if (box.contains(document.activeElement)) return; // non cancello quello che stai scrivendo
  const chiavi = [...new Set(stagioni.map((s) => s.chiave))];
  box.replaceChildren(
    ...chiavi.map((k) => {
      const s = stagioni.find((x) => x.chiave === k);
      const nome = el("input", {
        type: "text",
        value: s.etichetta,
        maxlength: "40",
        "aria-label": `Nome della stagione ${s.nomeOriginale}`,
      });
      const colore = el("input", {
        type: "color",
        value: aHex(
          s.coloreStagione || COLORI_STAGIONE_PREDEFINITI[k] || "#2dd4bf",
        ),
        "aria-label": `Colore della stagione ${s.etichetta}`,
      });
      return el(
        "div",
        { class: "stagione-card", style: `--stagione-colore:${colore.value}` },
        el(
          "div",
          { class: "stagione-card__testa" },
          ico("leaf"),
          el("strong", { text: s.nomeOriginale }),
          el("span", {
            class: "ride-tag",
            text: `${stagioni.filter((x) => x.chiave === k).length} periodi`,
          }),
        ),
        el(
          "label",
          { class: "campo" },
          el("span", { class: "etichetta", text: "Nome mostrato" }),
          nome,
        ),
        el(
          "label",
          { class: "campo" },
          el("span", { class: "etichetta", text: "Colore della stagione" }),
          el(
            "span",
            { class: "riga-colore" },
            colore,
            el("code", { text: colore.value }),
          ),
        ),
        el(
          "button",
          {
            class: "btn primario",
            type: "button",
            onclick: () =>
              chiama(
                "/api/gestione/stagioni/salva",
                { stagione: k, nome: nome.value, colore: colore.value },
                dopoModifica,
              ),
          },
          ...conIcona("save", "Salva stagione"),
        ),
      );
    }),
  );
  box.querySelectorAll('input[type="color"]').forEach((c) =>
    c.addEventListener("input", () => {
      c.closest(".stagione-card").style.setProperty(
        "--stagione-colore",
        c.value,
      );
      c.nextElementSibling.textContent = c.value;
    }),
  );
};
const selezionePeriodi = creaSelezione({
  contenitore: $("#p-barra-box"),
  singolare: "periodo",
  plurale: "periodi",
  endpoint: "/api/gestione/stagioni/elimina-periodi",
  campo: "periodi",
  descrivi: (chiavi) =>
    `${chiavi.map((c) => c.replace("|", " ")).join(", ")}: verranno rimossi pagina, JSON, foto e giri. Le statistiche si aggiornano. L'ultimo periodo di una stagione è protetto.`,
  ridisegna: () => disegnaPeriodi(),
});
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
                    class: `periodo-card${selezionePeriodi.ha(`${s.chiave}|${s.periodo}`) ? " selezionata" : ""}`,
                    style: `--periodo-colore:${s.colore}`,
                  },
                  el(
                    "label",
                    { class: "spunta" },
                    selezionePeriodi.casella(
                      `${s.chiave}|${s.periodo}`,
                      `${s.etichetta} ${s.periodo}`,
                    ),
                  ),
                  el("span", {
                    class: "periodo-chip",
                    text: s.periodo,
                  }),
                  el(
                    "button",
                    {
                      class: "btn danger",
                      type: "button",
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
                    },
                    ...conIcona("trash", "Elimina"),
                  ),
                ),
              ),
            ),
          )
        : null;
    }),
  );
  const chiaviTutte = stagioni.map((s) => `${s.chiave}|${s.periodo}`);
  selezionePeriodi.aggiorna(
    stagioni
      .filter((s) => !q || norm(`${s.etichetta} ${s.periodo}`).includes(q))
      .map((s) => `${s.chiave}|${s.periodo}`),
    chiaviTutte,
  );
};

let datiCaricati = false; // le liste sono già state lette almeno una volta
let ultimaModificaLocale = 0; // quando ho salvato io: serve a non mostrare l'avviso "aggiornato in automatico"
const caricaTutto = async () => {
  mostraScheletri();
  const [g, s, c, u, pa] = await Promise.all([
    api("/api/gestione/giri"),
    api("/api/gestione/stagioni"),
    api("/api/gestione/statistiche-colori"),
    api("/api/gestione/utenti"),
    api("/api/gestione/paesi"),
  ]);
  if (!g.ok) return avvisa(g.errore, true);
  if (pa.ok) paesi = pa.paesi;
  giri = g.giri;
  stagioni = s.stagioni || [];
  colori = c.ok ? c : colori;
  utenti = u.utenti || [];
  const chiavi = [...new Map(stagioni.map((x) => [x.chiave, x.etichetta]))];
  // un aggiornamento automatico non deve cambiare le scelte di una finestra già aperta
  const scelte = {
    giro: $("#f-stagione").value,
    colore: $("#col-stagione").value,
    periodo: $("#col-periodo").value,
    tinta: $("#colore").value,
  };
  opzioni($("#f-stagione"), chiavi);
  opzioni($("#col-stagione"), chiavi);
  if (chiavi.some(([k]) => k === scelte.giro))
    $("#f-stagione").value = scelte.giro;
  if (chiavi.some(([k]) => k === scelte.colore))
    $("#col-stagione").value = scelte.colore;
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
  if (
    scelte.periodo &&
    [...$("#col-periodo").options].some((o) => o.value === scelte.periodo)
  ) {
    $("#col-periodo").value = scelte.periodo;
    $("#colore").value = scelte.tinta;
  }
  disegnaGiri();
  disegnaUtenti();
  disegnaBandiere();
  disegnaRiepilogo();
  disegnaStagioni();
  disegnaPeriodi();
  datiCaricati = true;
};
// dopo un salvataggio o un'eliminazione: ricarica i dati, svuota i moduli e chiude le finestre
const dopoModifica = async () => {
  ultimaModificaLocale = Date.now();
  await caricaTutto();
  azzeraGiro();
  azzeraUtente();
  azzeraBandiera();
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
};
