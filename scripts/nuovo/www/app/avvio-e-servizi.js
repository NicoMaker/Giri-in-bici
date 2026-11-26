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
    if (figlio === null || figlio === undefined || figlio === false) return;
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
    lang: tipo === "date" ? "it" : undefined,
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
    const doppio = v && usati.some((u) => u.toLowerCase() === v.toLowerCase());
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
