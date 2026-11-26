const zonaFile = ({ multiplo, titolo, sotto }) => {
  let files = [];
  const input = el("input", {
    type: "file",
    accept: ".jpg,.jpeg,image/jpeg",
    multiple: multiplo,
    hidden: true,
  });
  const miniature = el("div", { class: "miniature" });
  const info = el("small", { class: "aiuto" });
  let urls = [];
  const disegna = () => {
    urls.forEach((u) => URL.revokeObjectURL(u));
    urls = [];
    const mostrate = files.slice(0, 23);
    miniature.replaceChildren(
      ...mostrate.map((f, i) => {
        const u = URL.createObjectURL(f);
        urls.push(u);
        return el(
          "div",
          { class: "mini", title: f.name },
          el("img", { src: u, alt: f.name }),
          multiplo ? el("span", { text: String(i + 1) }) : null,
        );
      }),
      files.length > mostrate.length
        ? el("div", {
            class: "mini altro",
            text: `+${files.length - mostrate.length}`,
          })
        : null,
    );
    info.textContent = files.length
      ? `${files.length} foto pronte${multiplo ? " · numerate nell'ordine dei nomi dei file" : ""}`
      : "";
  };
  const imposta = (lista) => {
    const jpg = [...lista]
      .filter((f) => /\.jpe?g$/i.test(f.name))
      .sort(ordineNaturale);
    const scartati = lista.length - jpg.length;
    files = multiplo ? jpg : jpg.slice(0, 1);
    disegna();
    if (scartati) info.textContent += ` · ignorati ${scartati} file non .jpg`;
  };
  const zona = el(
    "div",
    {
      class: "zona",
      tabindex: "0",
      role: "button",
      onclick: () => input.click(),
      onkeydown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          input.click();
        }
      },
      ondragover: (e) => {
        e.preventDefault();
        zona.classList.add("sopra");
      },
      ondragleave: () => zona.classList.remove("sopra"),
      ondrop: (e) => {
        e.preventEventDefault();
        zona.classList.remove("sopra");
        imposta(e.dataTransfer.files);
      },
    },
    el("div", {}, el("strong", { text: titolo }), el("br"), sotto),
  );
  input.addEventListener("change", () => imposta(input.files));
  return {
    el: el("div", { class: "campo" }, zona, input, info, miniature),
    files: () => files,
  };
};
const carica = async (files, cartella) => {
  if (!files.length) return null;
  const sid = crypto.randomUUID();
  for (let i = 0; i < files.length; i++) {
    occupato(`Carico le foto… ${i + 1}/${files.length}`);
    const nome = `${String(i).padStart(4, "0")}-${files[i].name}`;
    const r = await fetch(
      `/api/upload?sid=${sid}&cartella=${cartella}&nome=${encodeURIComponent(nome)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: files[i],
      },
    );
    const j = await r
      .json()
      .catch(() => ({ ok: false, errore: "Caricamento non riuscito." }));
    if (!j.ok) throw new Error(j.errore || "Caricamento non riuscito.");
  }
  return sid;
};
const opzionale = (titolo, contenuto, aperto = false) => {
  const dentro = el("div", { class: "dentro" }, contenuto);
  dentro.hidden = !aperto;
  const check = el("input", {
    type: "checkbox",
    checked: aperto,
    onchange: () => {
      dentro.hidden = !check.checked;
    },
  });
  return {
    el: el(
      "div",
      { class: "opzionale pieno" },
      el("label", { class: "interruttore" }, check, titolo),
      dentro,
    ),
    attivo: () => check.checked,
  };
};
