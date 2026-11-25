const mostraFatto = (r) => {
  $("#risultato").replaceChildren(
    el(
      "div",
      { class: "esito ok" },
      el("h3", { text: "✔ Fatto: file scritti" }),
      corpoRiepilogo({ ...r, avvisi: [] }),
    ),
  );
  $("#risultato").scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
};
const disegnaMenu = () => {
  const gruppi = [...new Set(stato.casi.map((c) => c.gruppo || "Altro"))];
  $("#menu").replaceChildren(
    ...gruppi.flatMap((g) => [
      el("h3", { class: "gruppo-menu", text: g }),
      ...stato.casi
        .filter((c) => (c.gruppo || "Altro") === g)
        .map((c) =>
          el(
            "button",
            {
              class: "voce",
              type: "button",
              "data-id": c.id,
              onclick: () => {
                mostraSezione("inserimento");
                apriCaso(c.id);
              },
            },
            el("span", { class: "ico", text: c.icona }),
            el(
              "span",
              {},
              el("strong", { text: c.titolo }),
              el("small", { text: c.descrizione }),
            ),
          ),
        ),
    ]),
  );
};
const mostraSezione = (nome) => {
  document.querySelectorAll("[data-sezione]").forEach((s) => {
    s.hidden = s.dataset.sezione !== nome;
  });
  document
    .querySelectorAll("[data-vai]")
    .forEach((b) =>
      b.setAttribute("aria-current", String(b.dataset.vai === nome)),
    );
  if (
    location.hash.slice(1) !== nome &&
    ["archivio", "utenti", "bandiere", "colori"].includes(nome)
  )
    history.replaceState(null, "", `#${nome}`);
  document.dispatchEvent(new CustomEvent("sezione", { detail: nome }));
};
(async () => {
  try {
    await ricarica();
  } catch (e) {
    $("#vista").replaceChildren(
      el("h2", { text: "Non riesco a leggere i dati" }),
      el("p", { text: e.message }),
    );
    return;
  }
  $("#radice").textContent = stato.radice;
  $("#badge-prova").hidden = !stato.prova;
  disegnaMenu();
  document
    .querySelectorAll("[data-vai]")
    .forEach((b) =>
      b.addEventListener("click", () => mostraSezione(b.dataset.vai)),
    );
  const h = location.hash.slice(1);
  if (["archivio", "utenti", "bandiere", "colori"].includes(h)) {
    apriCaso("giro");
    mostraSezione(h);
  } else {
    mostraSezione("inserimento");
    apriCaso(h || "giro");
  }
})();
