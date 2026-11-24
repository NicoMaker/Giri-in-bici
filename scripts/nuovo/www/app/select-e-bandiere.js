    attributes: true,
  });
  select.addEventListener("change", aggiorna);
  aggiorna();
};
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
      return el("img", {
        class: "bandiera-img",
        src: paese?.src || `/img/Bandiere/${m[1].toLowerCase()}.svg`,
        alt: paese?.nome || m[1],
        title: paese?.nome || m[1],
      });
    });
const senzaBandiere = (t) =>
  String(t)
    .replace(/\s*\{[A-Z][A-Z0-9_]{1,63}\}/g, "")
    .trim();
const bandierePicker = (input) => {
  const sel = el("select", { "aria-label": "Inserisci una bandiera" });
  const anteprima = el("div", { class: "anteprima-luogo", hidden: true });
  const nomeInput = el("input", {
    type: "text",
    maxlength: "60",
    placeholder: "Es. Bandiera del gruppo",
    autocomplete: "off",
  });
  const fileInput = el("input", {
    type: "file",
    accept: "image/png,image/jpeg,image/webp",
    "aria-label": "Immagine della bandiera (PNG, JPG o WebP)",
  });
  const drop = el(
    "label",
    { class: "bandiera-drop" },
    el("span", { text: "Trascina qui un'immagine oppure scegli un file" }),
    fileInput,
  );
  const immagineLocale = el("img", {
    class: "bandiera-upload-preview",
    alt: "Anteprima della bandiera scelta",
    hidden: true,
  });
  const statoUpload = el("p", {
    class: "bandiera-upload-stato",
    role: "status",
    "aria-live": "polite",
  });
  const carica = el("button", {
    class: "btn primario",
    type: "button",
    text: "Carica e usa bandiera",
  });
  const dettagli = el(
    "details",
    { class: "bandiera-custom" },
    el("summary", { text: "Crea una bandiera personalizzata" }),
    el(
      "div",
      { class: "bandiera-custom__contenuto" },
      el(
        "label",
        { class: "bandiera-custom__nome" },
        el("span", { text: "Nome visibile" }),
        nomeInput,
      ),
      drop,
      immagineLocale,
      el("small", {
        class: "aiuto",
        text: "Sono supportati PNG, JPG e WebP fino a 5 MB. Il nome scelto viene usato nel catalogo.",
      }),
      statoUpload,
      carica,
    ),
  );
  let fileSelezionato = null;
  let urlLocale = null;
  const ricarica = () => {
    const standard = paesi.filter(
      (p) => !p.personalizzata && p.disponibile,
    );
    const personalizzate = paesi.filter((p) => p.personalizzata);
    sel.replaceChildren(
      el("option", { value: "", text: "Scegli una bandiera già disponibile…" }),
      ...standard.map((p) =>
        el("option", {
          value: p.codice,
          text: `${p.bandiera} ${p.nome}`,
        }),
      ),
      ...(personalizzate.length
        ? [
            el(
              "optgroup",
              { label: "Bandiere personalizzate" },
              ...personalizzate.map((p) =>
                el("option", { value: p.codice, text: p.nome }),
              ),
            ),
          ]
        : []),
    );
  };
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
  const scegliFile = (file) => {
    fileSelezionato = file || null;
    if (urlLocale) URL.revokeObjectURL(urlLocale);
    urlLocale = null;
