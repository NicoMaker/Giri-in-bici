const stagioneDaMese = (iso) => {
  const m = parseInt(iso.slice(5, 7), 10);
  return m >= 3 && m <= 5
    ? "Primavera"
    : m >= 6 && m <= 8
      ? "Estate"
      : "Autunno_Inverno";
};

// ---------- select ricercabili: ogni <select> della pagina ha la ricerca interna ----------
const normRic = (t) =>
  String(t ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
const chiudiPannelli = () =>
  document.querySelectorAll(".rs-panel,.ms-panel").forEach((p) => {
    p.hidden = true;
  });
document.addEventListener("click", chiudiPannelli);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") chiudiPannelli();
});
const rendiRicercabile = (select) => {
  if (select.dataset.rs || select.hasAttribute("data-nativo")) return;
  select.dataset.rs = "1";
  select.classList.add("rs-nativo");
  select.tabIndex = -1;
  const btn = el("button", {
    class: "rs-btn",
    type: "button",
    "aria-haspopup": "listbox",
  });
  const cerca = el("input", {
    type: "search",
    class: "rs-cerca",
    placeholder: "Cerca…",
    autocomplete: "off",
    "aria-label": "Cerca nelle opzioni",
  });
  const lista = el("div", { class: "rs-lista", role: "listbox" });
  const pannello = el("div", { class: "rs-panel", hidden: true }, cerca, lista);
  const wrap = el("div", { class: "rs" }, btn, pannello);
  select.before(wrap);
  const aggiorna = () => {
    const o = select.options[select.selectedIndex];
    btn.replaceChildren(
      el("span", { class: "rs-testo", text: o ? o.textContent : "—" }),
      el("small", { text: "▾" }),
    );
    btn.disabled = select.disabled;
  };
  const disegna = () => {
    const q = normRic(cerca.value.trim());
    const trovate = [...select.options].filter(
      (o) => !q || normRic(o.textContent).includes(q),
    );
    lista.replaceChildren(
      ...(trovate.length
        ? trovate.map((o) =>
            el("button", {
              type: "button",
              role: "option",
              class: "rs-op",
              "aria-selected": String(o.value === select.value),
              text: o.textContent,
              onclick: () => {
                select.value = o.value;
                select.dispatchEvent(new Event("change", { bubbles: true }));
                chiudiPannelli();
                const f = document.activeElement;
                if (!f || f === document.body || pannello.contains(f))
                  btn.focus();
              },
            }),
          )
        : [el("p", { class: "rs-vuoto", text: "Nessun risultato." })]),
    );
  };
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const apri = pannello.hidden;
    chiudiPannelli();
    pannello.hidden = !apri;
    if (apri) {
      cerca.hidden = select.options.length < 6;
      cerca.value = "";
      disegna();
      (cerca.hidden
        ? lista.querySelector("[aria-selected=true]") || lista.firstChild
        : cerca
      )?.focus();
      lista
        .querySelector("[aria-selected=true]")
        ?.scrollIntoView({ block: "nearest" });
    }
  });
  pannello.addEventListener("click", (e) => e.stopPropagation());
  cerca.addEventListener("input", disegna);
  cerca.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      lista.querySelector(".rs-op")?.click();
    }
  });
  const d = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value",
  );
  Object.defineProperty(select, "value", {
    configurable: true,
    get() {
      return d.get.call(this);
    },
    set(v) {
      d.set.call(this, v);
      aggiorna();
    },
  });
  new MutationObserver(aggiorna).observe(select, {
    childList: true,
    subtree: true,
    attributes: true,
  });
  select.addEventListener("change", aggiorna);
  aggiorna();
};
