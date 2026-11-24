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
const normalizza = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const filtraMenu = (testo) => {
  const parole = normalizza(testo).split(/\s+/).filter(Boolean);
  let visibili = 0;
  let gruppo = null;
  const gruppi = new Map();
  document.querySelectorAll("#menu > *").forEach((n) => {
    if (n.classList.contains("gruppo-menu")) {
      gruppo = n;
      gruppi.set(n, 0);
      return;
    }
    const ok = parole.every((p) => normalizza(n.textContent).includes(p));
    n.hidden = !ok;
    if (ok) {
      visibili++;
      if (gruppo) gruppi.set(gruppo, gruppi.get(gruppo) + 1);
    }
  });
  gruppi.forEach((n, g) => {
    g.hidden = n === 0;
  });
  $("#menu-vuoto").hidden = visibili > 0;
};
const avviaRicercaMenu = () => {
  const campo = $("#cerca-menu");
  campo.addEventListener("input", () => filtraMenu(campo.value));
  campo.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      campo.value = "";
      filtraMenu("");
    }
    if (e.key === "Enter") {
      const prima = document.querySelector("#menu .voce:not([hidden])");
      if (prima) prima.click();
    }
  });
  document.addEventListener("keydown", (e) => {
    const scrive = /^(input|textarea|select)$/i.test(e.target.tagName);
    if (e.key === "/" && !scrive && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      mostraSezione("inserimento");
      campo.focus();
    }
  });
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
    ["archivio", "utenti", "colori"].includes(nome)
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
  avviaRicercaMenu();
  document
    .querySelectorAll("[data-vai]")
    .forEach((b) =>
      b.addEventListener("click", () => mostraSezione(b.dataset.vai)),
    );
  const h = location.hash.slice(1);
  if (["archivio", "utenti", "colori"].includes(h)) {
    apriCaso("giro");
    mostraSezione(h);
  } else {
    mostraSezione("inserimento");
    apriCaso(h || "giro");
  }
})();
