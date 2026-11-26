const potenziaSelect = (radice = document) =>
  radice.querySelectorAll("select").forEach(rendiRicercabile);
potenziaSelect();
new MutationObserver((muts) => {
  for (const m of muts)
    for (const n of m.addedNodes)
      if (n.nodeType === 1) {
        if (n.tagName === "SELECT") rendiRicercabile(n);
        else potenziaSelect(n);
      }
}).observe(document.body, { childList: true, subtree: true });

// ---------- componenti condivisi con gestione.js: bandiere e link con titolo ----------
let paesi = [];
const luogoNodi = (testo) =>
  String(testo)
    .split(/(\{[A-Z][A-Z0-9_]{1,63}\})/)
    .filter(Boolean)
    .map((p) => {
      const m = p.match(/^\{([A-Z][A-Z0-9_]{1,63})\}$/);
      if (!m) return document.createTextNode(p);
      const paese = paesi.find((x) => x.codice === m[1]);
      if (!paese) return document.createTextNode(p);
      return el("img", {
        class: "bandiera-img",
        src: paese.src,
        alt: paese.nome,
        title: paese.nome,
      });
    });
const senzaBandiere = (t) =>
  String(t)
    .replace(/\s*\{[A-Z][A-Z0-9_]{1,63}\}/g, "")
    .trim();
const bandierePicker = (input) => {
  const sel = el("select", { "aria-label": "Inserisci una bandiera" });
  const anteprima = el("div", { class: "anteprima-luogo", hidden: true });
  const gestisci = el("button", {
    class: "btn-link",
    type: "button",
    text: "＋ Crea o modifica le bandiere",
    onclick: () => {
      document.querySelectorAll("dialog[open]").forEach((d) => d.close());
      mostraSezione("bandiere");
    },
  });
  const ricarica = () =>
    sel.replaceChildren(
      el("option", {
        value: "",
        text: paesi.length
          ? "Scegli una bandiera…"
          : "Nessuna bandiera: creala nella sezione Bandiere",
      }),
      ...paesi.map((p) => el("option", { value: p.codice, text: p.nome })),
    );
  const aggiorna = () => {
    anteprima.replaceChildren(...luogoNodi(input.value));
    anteprima.hidden = !/\{[A-Z][A-Z0-9_]{1,63}\}/.test(input.value);
  };
  const inserisci = (codice) => {
    const token = `{${codice}}`;
    const a = input.selectionStart ?? input.value.length;
    const b = input.selectionEnd ?? a;
    input.value = input.value.slice(0, a) + token + input.value.slice(b);
    input.focus();
    input.setSelectionRange(a + token.length, a + token.length);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    aggiorna();
  };
  window.addEventListener("bandiere:aggiornate", () => {
    ricarica();
    aggiorna();
  });
  sel.addEventListener("change", () => {
    if (!sel.value) return;
    inserisci(sel.value);
    sel.value = "";
  });
  input.addEventListener("input", aggiorna);
  ricarica();
  return {
    nodo: el(
      "div",
      { class: "bandiere" },
      sel,
      el("small", {
        class: "aiuto",
        text: "La bandiera viene inserita nel punto in cui si trova il cursore.",
      }),
      anteprima,
      gestisci,
    ),
    ricarica,
    aggiorna,
  };
};
