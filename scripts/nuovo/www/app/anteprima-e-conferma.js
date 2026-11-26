const mostraErrore = (testo) => {
  $("#risultato").replaceChildren(
    el(
      "div",
      { class: "esito errore", role: "alert" },
      el("h3", { text: "Non posso procedere" }),
      el("p", { text: testo }),
    ),
  );
  $("#risultato").scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
};
const corpoRiepilogo = (r) => [
  r.note.map((n, i) => (i === 0 ? el("p", { class: "frase", text: n }) : null)),
  r.note.length > 1
    ? el(
        "ul",
        { class: "elenco-note" },
        r.note.slice(1).map((n) => el("li", { text: n })),
      )
    : null,
];
const mostraAnteprima = (r, onConferma, onAnnulla) => {
  const conferma = el("button", {
    class: "btn primario",
    type: "button",
    text: "✔ Conferma e scrivi i file",
    onclick: onConferma,
  });
  if (r.prova) conferma.disabled = true;
  $("#risultato").replaceChildren(
    el(
      "div",
      { class: "esito" },
      el("h3", { text: "Riepilogo: controlla prima di scrivere" }),
      corpoRiepilogo(r),
      r.prova
        ? el("div", {
            class: "avviso",
            text: "Modalità prova attiva: la conferma non scrive i file.",
          })
        : null,
      el(
        "div",
        { class: "azioni" },
        conferma,
        el("button", {
          class: "btn",
          type: "button",
          text: "Annulla",
          onclick: onAnnulla,
        }),
      ),
    ),
  );
  $("#risultato").scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
};

const apriCaso = (id) => {
  const caso = stato.casi.find((c) => c.id === id) || stato.casi[0];
  history.replaceState(null, "", `#${caso.id}`);
  document
    .querySelectorAll(".voce")
    .forEach((v) => v.classList.toggle("attiva", v.dataset.id === caso.id));
  $("#risultato").replaceChildren();
  const vista = $("#vista");
  vista.replaceChildren(
    el("h2", { text: `${caso.icona} ${caso.titolo}` }),
    el("p", { class: "sotto", text: caso.descrizione }),
  );
  const modulo = moduli[caso.id]();
  const bottone = el("button", {
    class: "btn primario",
    type: "button",
    text: "Anteprima",
  });
  vista.append(modulo.nodo, el("div", { class: "azioni" }, bottone));
  bottone.addEventListener("click", async () => {
    $("#risultato").replaceChildren();
    bottone.disabled = true;
    try {
      const dati = await modulo.raccogli();
      occupato("Preparo l'anteprima…");
      const r = await api("/api/anteprima", { azione: caso.id, dati });
      occupato("");
      if (!r.ok) return mostraErrore(r.errore);
      mostraAnteprima(
        r,
        async () => {
          occupato("Scrivo i file…");
          const c = await api("/api/conferma", { azione: caso.id, dati });
          if (!c.ok) {
            occupato("");
            return mostraErrore(c.errore);
          }
          await ricarica();
          occupato("");
          apriCaso(caso.id);
          mostraFatto(c);
        },
        () => $("#risultato").replaceChildren(),
      );
    } catch (e) {
      occupato("");
      mostraErrore(e.message);
    } finally {
      occupato("");
      bottone.disabled = false;
    }
  });
};
