"use strict";
const $ = (selettore) => document.querySelector(selettore);
const el = (tag, props = {}, ...figli) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (k === "value") n.value = v;
    else if (k === "checked") n.checked = true;
    else n.setAttribute(k, v === true ? "" : v);
  }
  const appendi = (figlio) => {
    if (figlio === null || figlio === undefined || figlio === false)
      return;
    if (Array.isArray(figlio)) return figlio.forEach(appendi);
    n.append(
      figlio.nodeType ? figlio : document.createTextNode(String(figlio)),
    );
  };
  figli.forEach(appendi);
  return n;
};

const api = async (url, corpo) => {
  try {
    const r = await fetch(
      url,
      corpo === undefined
        ? {}
        : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo),
          },
    );
    const dati = await r.json();
    if (!r.ok || !dati.ok)
      return {
        ok: false,
        errore: dati.errore || `Richiesta non riuscita (${r.status}).`,
      };
    return dati;
  } catch {
    return {
      ok: false,
      errore:
        "Il server non risponde. Controlla che `node scripts/server.js` sia ancora acceso.",
    };
  }
};

const occupato = (testo) => {
  $("#occupato-testo").textContent = testo || "Un attimo…";
  $("#occupato").hidden = !testo;
};

const ordineNaturale = (a, b) =>
  a.name.localeCompare(b.name, "it", {
    numeric: true,
    sensitivity: "base",
  });

const campo = (etichetta, controllo, aiuto) =>
  el(
    "label",
    { class: "campo" },
    el("span", { class: "etichetta", text: etichetta }),
    controllo,
    aiuto ? el("small", { class: "aiuto", text: aiuto }) : null,
  );
const casella = (tipo, valore = "", extra = {}) =>
  el("input", {
    type: tipo,
    value: valore,
    autocomplete: "off",
    ...extra,
  });
const menuATendina = (opzioni, valore) => {
  const select = el(
    "select",
    {},
    opzioni.map((o) => el("option", { value: o.valore, text: o.testo })),
  );
  if (valore !== undefined) select.value = valore;
  return select;
};
const segmentato = (opzioni, valore, onCambio) => {
  let corrente = valore;
  const box = el("div", { class: "segmenti", role: "radiogroup" });
  const disegna = () =>
    box.replaceChildren(
      ...opzioni.map((o) =>
        el("button", {
          type: "button",
          role: "radio",
          "aria-checked": String(o.valore === corrente),
          class: `segmento${o.valore === corrente ? " attivo" : ""}`,
          text: o.testo,
          onclick: () => {
            corrente = o.valore;
            disegna();
            if (onCambio) onCambio(corrente);
          },
        }),
      ),
    );
  disegna();
  return { el: box, get: () => corrente };
};
const campioneColore = (colore) => {
  const valido = colore && CSS.supports("color", colore);
  return el(
    "span",
    { class: "campione" },
    el("i", { style: valido ? `background:${colore}` : "" }),
  );
};
const campoColore = (etichetta, usati) => {
  const testo = casella("text", "", {
    placeholder: "es. gold oppure #ff0060",
  });
  const scelta = casella("color", "#2dd4bf");
  const campione = el("span", { class: "campione" }, el("i"));
  const nota = el("small", { class: "aiuto" });
  const aggiorna = () => {
    const v = testo.value.trim();
    campione.firstChild.style.background =
      v && CSS.supports("color", v) ? v : "transparent";
    const doppio =
      v && usati.some((u) => u.toLowerCase() === v.toLowerCase());
    nota.className = doppio ? "aiuto avv" : "aiuto";
    nota.textContent = doppio
      ? "⚠ Questo colore è già usato da un altro periodo."
      : "";
  };
  testo.addEventListener("input", aggiorna);
  scelta.addEventListener("input", () => {
    testo.value = scelta.value;
    aggiorna();
  });
  const chips = usati.length
    ? el(
        "div",
        { class: "usati" },
        el("span", { class: "aiuto", text: "Già usati:" }),
        usati.map((u) =>
          el(
            "span",
            { class: "chip", title: u },
            el("i", { style: `background:${u}` }),
          ),
        ),
      )
    : null;
  return {
    el: el(
      "div",
      { class: "campo" },
      el("span", { class: "etichetta", text: etichetta }),
      el("div", { class: "riga-colore" }, campione, testo, scelta),
      nota,
      chips,
    ),
    get: () => testo.value.trim(),
  };
};

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
    if (scartati)
      info.textContent += ` · ignorati ${scartati} file non .jpg`;
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
  const pannello = el(
    "div",
    { class: "rs-panel", hidden: true },
    cerca,
    lista,
  );
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
                select.dispatchEvent(
                  new Event("change", { bubbles: true }),
                );
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
    const standard = paesi.filter((p) => !p.personalizzata);
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
    if (!fileSelezionato) {
      immagineLocale.removeAttribute("src");
      immagineLocale.hidden = true;
      statoUpload.textContent = "";
      return;
    }
    urlLocale = URL.createObjectURL(fileSelezionato);
    immagineLocale.src = urlLocale;
    immagineLocale.hidden = false;
    statoUpload.textContent = `${fileSelezionato.name} · ${Math.ceil(fileSelezionato.size / 1024)} KB`;
  };
  fileInput.addEventListener("change", () => scegliFile(fileInput.files?.[0]));
  drop.addEventListener("dragover", (event) => {
    event.preventDefault();
    drop.classList.add("in-trascinamento");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("in-trascinamento"));
  drop.addEventListener("drop", (event) => {
    event.preventDefault();
    drop.classList.remove("in-trascinamento");
    scegliFile(event.dataTransfer?.files?.[0]);
  });
  carica.addEventListener("click", async () => {
    if (!fileSelezionato) {
      statoUpload.textContent = "Scegli o trascina prima un'immagine.";
      return;
    }
    if (!nomeInput.value.trim()) {
      statoUpload.textContent = "Inserisci il nome che vuoi mostrare per la bandiera.";
      nomeInput.focus();
      return;
    }
    const cursore = input.selectionStart ?? input.value.length;
    carica.disabled = true;
    statoUpload.textContent = "Caricamento della bandiera…";
    try {
      const url = new URL("/api/gestione/bandiere", window.location.href);
      url.searchParams.set("nome", nomeInput.value.trim());
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": fileSelezionato.type || "application/octet-stream" },
        body: fileSelezionato,
      });
      const risultato = await response.json().catch(() => ({}));
      if (!response.ok || !risultato.ok)
        throw new Error(risultato.errore || "Non è stato possibile salvare la bandiera.");
      const catalogo = await api("/api/gestione/paesi");
      if (!catalogo.ok) throw new Error(catalogo.errore || "Catalogo bandiere non disponibile.");
      paesi = catalogo.paesi;
      window.dispatchEvent(new Event("bandiere:aggiornate"));
      input.setSelectionRange(cursore, cursore);
      inserisci(risultato.bandiera.codice);
      scegliFile(null);
      nomeInput.value = "";
      fileInput.value = "";
      statoUpload.textContent = `${risultato.messaggio} Bandiera inserita nel luogo.`;
    } catch (errore) {
      statoUpload.textContent = errore.message;
    } finally {
      carica.disabled = false;
    }
  });
  const aggiornaCatalogo = () => ricarica();
  window.addEventListener("bandiere:aggiornate", aggiornaCatalogo);
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
        text: "Scegli una bandiera esistente oppure creane una: verrà inserita nel punto in cui si trova il cursore.",
      }),
      anteprima,
      dettagli,
    ),
    ricarica,
    aggiorna,
  };
};
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
      el("button", {
        class: "btn",
        type: "button",
        title: "Togli link",
        text: "✕",
        onclick: () => r.remove(),
      }),
    );
    return r;
  };
  const set = (v) => righe.replaceChildren(...(v || []).map(riga));
  set(iniziali);
  const nodo = el(
    "div",
    { class: "link-editor" },
    righe,
    el("button", {
      class: "btn",
      type: "button",
      text: "＋ Aggiungi link",
      onclick: () => righe.append(riga()),
    }),
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

let stato = null;
let elenco = null;
const opzioniStagioni = () =>
  Object.entries(stato.stagioni).map(([k, s]) => ({
    valore: k,
    testo: s.etichetta,
  }));
const ricarica = async () => {
  const [s, e, pa] = await Promise.all([
    api("/api/stato"),
    api("/api/elenco"),
    api("/api/gestione/paesi"),
  ]);
  if (pa.ok) paesi = pa.paesi;
  if (!s.ok) throw new Error(s.errore);
  stato = {
    ...s,
    casi: s.casi.filter((c) => c.scrive && c.id !== "anno-completo"),
  };
  elenco = e.ok ? e : null;
};

const moduli = {};
moduli.giro = () => {
  const st = segmentato(opzioniStagioni(), stagioneDaMese(stato.oggi));
  const data = casella("date", stato.oggi);
  const luogo = casella("text", "", { placeholder: "es. Pinzano" });
  const km = casella("number", "", {
    min: "1",
    step: "1",
    inputmode: "numeric",
    placeholder: "es. 95",
  });
  const bandiere = bandierePicker(luogo);
  const links = editorLink();
  const nodo = el(
    "div",
    { class: "griglia" },
    el(
      "div",
      { class: "campo pieno" },
      el("span", { class: "etichetta", text: "Stagione" }),
      st.el,
    ),
    campo("Data del giro", data),
    campo("Distanza (km)", km),
    campo("Luogo", luogo),
    el(
      "div",
      { class: "campo pieno" },
      el("span", {
        class: "etichetta",
        text: "Bandiere nel luogo (facoltative)",
      }),
      bandiere.nodo,
    ),
    el(
      "div",
      { class: "campo pieno" },
      el("span", {
        class: "etichetta",
        text: "Link dei percorsi (facoltativi)",
      }),
      links.nodo,
    ),
  );
  return {
    nodo,
    raccogli: async () => ({
      stagione: st.get(),
      data: data.value,
      luogo: luogo.value,
      links: links.get(),
      km: km.value,
    }),
  };
};

moduli.mese = () => {
  const anno = menuATendina(
    stato.anni.map((a) => ({ valore: a, testo: a })),
    stato.ultimoAnno,
  );
  const mese = menuATendina(
    stato.mesi.map((m) => ({ valore: m, testo: m })),
    stato.mesi[new Date().getMonth()],
  );
  const km = casella("number", "", {
    min: "0",
    step: "1",
    inputmode: "numeric",
    placeholder: "es. 420",
  });
  const corse = casella("number", "0", {
    min: "0",
    step: "1",
    inputmode: "numeric",
  });
  const presenti = el("div", { class: "usati" });
  const modoBox = el("div", { class: "campo pieno" });
  const modo = segmentato(
    [
      { valore: "somma", testo: "Sommo ai km che ci sono" },
      { valore: "sostituisci", testo: "Sostituisco i km" },
    ],
    "somma",
  );
  modoBox.append(
    el("span", {
      class: "etichetta",
      text: "Il mese c'è già: cosa faccio?",
    }),
    modo.el,
  );
  const aggiorna = () => {
    const a =
      elenco &&
      elenco.anni.find((x) => String(x.anno) === String(anno.value));
    const mesi = a ? a.mesi : [];
    const chips = mesi.length
      ? mesi.map((m) =>
          el("span", {
            class: "chip testo",
            text: `${m.mese} ${m.km} km`,
          }),
        )
      : [el("span", { class: "chip testo", text: "nessuno" })];
    presenti.replaceChildren(
      el("span", {
        class: "aiuto",
        text: `Mesi presenti nel ${anno.value}:`,
      }),
      ...chips,
    );
    modoBox.hidden = !mesi.some((m) => m.mese === mese.value);
  };
  anno.addEventListener("change", aggiorna);
  mese.addEventListener("change", aggiorna);
  aggiorna();
  const nodo = el(
    "div",
    { class: "griglia" },
    campo("Anno", anno),
    campo("Mese", mese),
    el("div", { class: "pieno" }, presenti),
    modoBox,
    campo("Km", km),
    campo("Corse da aggiungere all'anno", corse),
  );
  return {
    nodo,
    raccogli: async () => ({
      anno: anno.value,
      mese: mese.value,
      km: km.value,
      corse: corse.value,
      sostituisci: !modoBox.hidden && modo.get() === "sostituisci",
    }),
  };
};

moduli.foto = () => {
  const periodo = menuATendina([]);
  const aggiornaPeriodi = (chiave) => {
    const s = stato.stagioni[chiave];
    periodo.replaceChildren(
      ...s.periodi.map((p) => el("option", { value: p, text: p })),
    );
    periodo.value = s.ultimo;
  };
  const st = segmentato(
    opzioniStagioni(),
    "Autunno_Inverno",
    aggiornaPeriodi,
  );
  aggiornaPeriodi(st.get());
  const zona = zonaFile({
    multiplo: true,
    titolo: "Trascina qui le foto .jpg o clicca per sceglierle",
    sotto:
      "Continuano la numerazione: le foto già presenti non vengono mai sovrascritte.",
  });
  const nodo = el(
    "div",
    { class: "griglia" },
    el(
      "div",
      { class: "campo pieno" },
      el("span", { class: "etichetta", text: "Stagione" }),
      st.el,
    ),
    campo("Periodo", periodo),
    el("div", { class: "pieno" }, zona.el),
  );
  return {
    nodo,
    raccogli: async () => ({
      stagione: st.get(),
      periodo: periodo.value,
      sid: await carica(zona.files(), "foto"),
    }),
  };
};

const sezionePrimoGiro = (chiave) => {
  const s = stato.stagioni[chiave];
  const annoPeriodo =
    String(s.ultimo || stato.ultimoAnno || stato.oggi.slice(0, 4)).match(
      /\d{4}/,
    )?.[0] || stato.oggi.slice(0, 4);
  const mesi = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
  const meseIndice = Math.max(
    0,
    mesi.findIndex((m) => m === s.meseIniziale),
  );
  const giornoData = `${annoPeriodo}-${String(meseIndice + 1).padStart(2, "0")}-01`;
  const data = casella("date", giornoData, {
    min: `${annoPeriodo}-01-01`,
    max: `${parseInt(annoPeriodo, 10)}-12-31`,
  });
  const luogo = casella("text", "", { placeholder: "Luogo" });
  const link = casella("url", "", {
    placeholder: "https://www.komoot.com/…",
  });
  const km = casella("number", "", {
    min: "0",
    step: "1",
    placeholder: "km",
  });
  const sez = opzionale(
    "Inserisci subito il primo giro (altrimenti metto un giro d'esempio da sostituire)",
    el(
      "div",
      { class: "griglia" },
      campo("Data del primo giro", data),
      campo("Km", km),
      campo("Luogo", luogo),
      campo("Link (facoltativo)", link),
    ),
  );
  return {
    el: sez.el,
    leggi: () => {
      if (!sez.attivo()) return null;
      const parti = String(data.value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!parti) throw new Error("Primo giro: scegli una data valida.");
      const mese = mesi[parseInt(parti[2], 10) - 1];
      return {
        data: `${parseInt(parti[3], 10)} ${mese}`,
        luogo: luogo.value,
        link: link.value,
        km: km.value,
      };
    },
  };
};

moduli.stagione = () => {
  let colore = null;
  let primoGiro = null;
  const contenitore = el("div", { class: "griglia" });
  const periodo = casella("text", "");
  const nFoto = casella("number", "0", {
    min: "0",
    step: "1",
    inputmode: "numeric",
  });
  const zona = zonaFile({
    multiplo: true,
    titolo: "Foto della stagione (.jpg): trascinale qui o clicca",
    sotto:
      "Verranno copiate come 1.jpg, 2.jpg… e la galleria della pagina verrà costruita automaticamente.",
  });
  const st = segmentato(opzioniStagioni(), "Primavera", (k) =>
    costruisci(k),
  );
  const costruisci = (chiave) => {
    const s = stato.stagioni[chiave];
    periodo.value = s.prossimo;
    colore = campoColore(
      `Colore di ${s.testo} (nome CSS o #esadecimale)`,
      s.colori,
    );
    primoGiro = sezionePrimoGiro(chiave);
    contenitore.replaceChildren(
      el(
        "div",
        { class: "campo pieno" },
        el("span", { class: "etichetta", text: "Stagione" }),
        st.el,
      ),
      campo(
        s.formato === "anno" ? "Anno" : "Periodo (es. 2027-2028)",
        periodo,
      ),
      colore.el,
      campo("Numero foto già pronte", nFoto),
      el("div", { class: "pieno" }, zona.el),
      primoGiro.el,
    );
  };
  costruisci(st.get());
  return {
    nodo: contenitore,
    raccogli: async () => ({
      stagione: st.get(),
      periodo: periodo.value,
      colore: colore.get(),
      nFoto: nFoto.value,
      sid: await carica(zona.files(), "foto"),
      primoGiro: primoGiro.leggi(),
    }),
  };
};

const sezionePrimoMese = () => {
  const mese = menuATendina(
    [
      "Gennaio",
      "Febbraio",
      "Marzo",
      "Aprile",
      "Maggio",
      "Giugno",
      "Luglio",
      "Agosto",
      "Settembre",
      "Ottobre",
      "Novembre",
      "Dicembre",
    ].map((m) => ({ valore: m, testo: m })),
    "Gennaio",
  );
  const km = casella("number", "0", { min: "0", step: "1" });
  const corse = casella("number", "0", { min: "0", step: "1" });
  const sez = opzionale(
    "Inserisci subito il primo mese (altrimenti metto Gennaio a 0 km da sostituire)",
    el(
      "div",
      { class: "griglia" },
      campo("Mese", mese),
      campo("Km del mese", km),
      campo("Corse dell'anno", corse),
    ),
  );
  return {
    el: sez.el,
    leggi: () =>
      sez.attivo()
        ? { mese: mese.value, km: km.value, corse: corse.value }
        : null,
  };
};

moduli.anno = () => {
  const anno = casella("text", stato.prossimoAnno);
  const colore = campoColore(
    "Colore dell'anno (nome CSS o #esadecimale)",
    stato.coloriAnni,
  );
  const icona = zonaFile({
    multiplo: false,
    titolo: "Icona dell'anno (.jpg): trascinala qui o clicca",
    sotto:
      "Facoltativa: se la salti la creo io, con l'anno scritto sul colore scelto.",
  });
  const mese = sezionePrimoMese();
  const nodo = el(
    "div",
    { class: "griglia" },
    campo("Nuovo anno", anno, `Ultimo presente: ${stato.ultimoAnno}`),
    colore.el,
    el("div", { class: "pieno" }, icona.el),
    mese.el,
  );
  return {
    nodo,
    raccogli: async () => ({
      anno: anno.value,
      colore: colore.get(),
      iconaSid: await carica(icona.files(), "icona"),
      primoMese: mese.leggi(),
    }),
  };
};

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
  r.note.map((n, i) =>
    i === 0 ? el("p", { class: "frase", text: n }) : null,
  ),
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

let casoAttuale = null;
const apriCaso = (id) => {
  const caso = stato.casi.find((c) => c.id === id) || stato.casi[0];
  casoAttuale = caso;
  history.replaceState(null, "", `#${caso.id}`);
  document
    .querySelectorAll(".voce")
    .forEach((v) =>
      v.classList.toggle("attiva", v.dataset.id === caso.id),
    );
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
