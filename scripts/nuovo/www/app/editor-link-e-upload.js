const editorLink = (iniziali = []) => {
  const righe = el("div", { class: "link-righe" });
  const riga = (l = {}) => {
    const r = el(
      "div",
      { class: "link-riga" },
      el("input", {
        type: "text",
        placeholder: "Titolo (es. Andata)",
        value: l.title || "",
        "aria-label": "Titolo del link",
        maxlength: "80",
      }),
      el("input", {
        type: "url",
        placeholder: "https://www.komoot.com/…",
        value: l.url || "",
        "aria-label": "Indirizzo del link",
      }),
      el(
        "button",
        {
          class: "btn",
          type: "button",
          title: "Togli link",
          "aria-label": "Togli link",
          onclick: () => r.remove(),
        },
        ico("close"),
      ),
    );
    return r;
  };
  const set = (v) => righe.replaceChildren(...(v || []).map(riga));
  set(iniziali);
  const nodo = el(
    "div",
    { class: "link-editor" },
    righe,
    el(
      "button",
      { class: "btn", type: "button", onclick: () => righe.append(riga()) },
      ...conIcona("plus", "Aggiungi link"),
    ),
    el("small", {
      class: "aiuto",
      text: "Un giro registrato male in più tour? Aggiungi un link per ciascuno, ognuno col suo titolo. Con un solo link il titolo è facoltativo.",
    }),
  );
  const get = () =>
    [...righe.children]
      .map((r) => {
        const [t, u] = r.querySelectorAll("input");
        return { title: t.value.trim(), url: u.value.trim() };
      })
      .filter((l) => l.title || l.url);
  return { nodo, get, set };
};
