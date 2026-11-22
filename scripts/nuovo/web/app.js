"use strict";

// Interfaccia web di Giri in Bici. Parla con scripts/nuovo/server (API /api/...).

// ---------- piccoli attrezzi ----------

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
  for (const f of figli.flat(Infinity)) {
    if (f === null || f === undefined || f === false) continue;
    n.append(f.nodeType ? f : document.createTextNode(String(f)));
  }
  return n;
};

const $ = (s) => document.querySelector(s);

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
    return await r.json();
  } catch {
    return {
      ok: false,
      errore: "Il server non risponde. Controlla che `node scripts/server.js` sia ancora acceso.",
    };
  }
};

const occupato = (testo) => {
  $("#occupato-testo").textContent = testo || "Un attimo…";
  $("#occupato").hidden = !testo;
};

const ordineNaturale = (a, b) =>
  a.name.localeCompare(b.name, "it", { numeric: true, sensitivity: "base" });

// ---------- componenti dei moduli ----------

const campo = (etichetta, controllo, aiuto) =>
  el(
    "label",
    { class: "campo" },
    el("span", { class: "etichetta", text: etichetta }),
    controllo,
    aiuto ? el("small", { class: "aiuto", text: aiuto }) : null,
  );

const casella = (tipo, valore = "", extra = {}) =>
  el("input", { type: tipo, value: valore, autocomplete: "off", ...extra });

const menuATendina = (opzioni, valore) => {
  const s = el(
    "select",
    {},
    opzioni.map((o) => el("option", { value: o.valore, text: o.testo })),
  );
  if (valore !== undefined) s.value = valore;
  return s;
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
  const ok = colore && CSS.supports("color", colore);
  return el("span", { class: "campione" }, el("i", { style: ok ? `background:${colore}` : "" }));
};

const campoColore = (etichetta, usati) => {
  const testo = casella("text", "", { placeholder: "es. gold oppure #ff0060" });
  const scelta = casella("color", "#2dd4bf");
  const campione = el("span", { class: "campione" }, el("i"));
  const nota = el("small", { class: "aiuto" });
  const aggiorna = () => {
    const v = testo.value.trim();
    campione.firstChild.style.background = v && CSS.supports("color", v) ? v : "transparent";
    const doppio = v && usati.some((u) => u.toLowerCase() === v.toLowerCase());
    nota.className = doppio ? "aiuto avv" : "aiuto";
    nota.textContent = doppio ? "⚠ Questo colore è già usato da un altro periodo." : "";
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
        usati.map((u) => el("span", { class: "chip", title: u }, el("i", { style: `background:${u}` }), u)),
      )
    : null;
  const box = el(
    "div",
    { class: "campo" },
    el("span", { class: "etichetta", text: etichetta }),
    el("div", { class: "riga-colore" }, campione, testo, scelta),
    nota,
    chips,
  );
  return { el: box, get: () => testo.value.trim() };
};

// Zona per trascinare o scegliere file .jpg. Mostra le miniature nell'ordine in cui verranno numerate.
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
        return el("div", { class: "mini", title: f.name }, el("img", { src: u, alt: f.name }), multiplo ? el("span", { text: String(i + 1) }) : null);
      }),
      files.length > mostrate.length
        ? el("div", { class: "mini altro", text: `+${files.length - mostrate.length}` })
        : null,
    );
    info.textContent = files.length
      ? `${files.length} foto pronte${multiplo ? " · numerate nell'ordine dei nomi dei file" : ""}`
      : "";
  };
  const imposta = (lista) => {
    const jpg = [...lista].filter((f) => /\.jpe?g$/i.test(f.name)).sort(ordineNaturale);
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
        e.preventDefault();
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

// Carica i file sul server (cartella temporanea) e ritorna l'identificativo.
const carica = async (files, cartella) => {
  if (!files.length) return null;
  const sid = crypto.randomUUID();
  for (let i = 0; i < files.length; i++) {
    occupato(`Carico le foto… ${i + 1}/${files.length}`);
    const nome = `${String(i).padStart(4, "0")}-${files[i].name}`;
    const r = await fetch(
      `/api/upload?sid=${sid}&cartella=${cartella}&nome=${encodeURIComponent(nome)}`,
      { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: files[i] },
    );
    const j = await r.json().catch(() => ({ ok: false, errore: "Caricamento non riuscito." }));
    if (!j.ok) throw new Error(j.errore || "Caricamento non riuscito.");
  }
  return sid;
};

const opzionale = (titolo, contenuto, aperto = false) => {
  const dentro = el("div", { class: "dentro" }, contenuto);
  dentro.hidden = !aperto;
  const check = el("input", { type: "checkbox", checked: aperto, onchange: () => (dentro.hidden = !check.checked) });
  return {
    el: el("div", { class: "opzionale pieno" }, el("label", { class: "interruttore" }, check, titolo), dentro),
    attivo: () => check.checked,
  };
};

const stagioneDaMese = (iso) => {
  const m = parseInt(iso.slice(5, 7), 10);
  return m >= 3 && m <= 5 ? "Primavera" : m >= 6 && m <= 8 ? "Estate" : "Autunno_Inverno";
};

// ---------- stato globale ----------

let stato = null;
let elenco = null;

const opzioniStagioni = () =>
  Object.entries(stato.stagioni).map(([k, s]) => ({ valore: k, testo: s.etichetta }));

const ricarica = async () => {
  const [s, e] = await Promise.all([api("/api/stato"), api("/api/elenco")]);
  if (!s.ok) throw new Error(s.errore);
  stato = s;
  elenco = e.ok ? e : null;
};

// ---------- moduli dei casi ----------

const moduli = {};

moduli.giro = () => {
  const st = segmentato(opzioniStagioni(), stagioneDaMese(stato.oggi));
  const data = casella("date", stato.oggi);
  const luogo = casella("text", "", { placeholder: "es. Pinzano" });
  const km = casella("number", "", { min: "1", step: "1", inputmode: "numeric", placeholder: "es. 95" });
  const link = casella("url", "", { placeholder: "https://www.komoot.com/…" });
  const nodo = el(
    "div",
    { class: "griglia" },
    el("div", { class: "campo pieno" }, el("span", { class: "etichetta", text: "Stagione" }), st.el),
    campo("Data del giro", data),
    campo("Distanza (km)", km),
    el("div", { class: "pieno" }, campo("Luogo (come comparirà nella tabella)", luogo)),
    el("div", { class: "pieno" }, campo("Link al percorso (facoltativo)", link, "Komoot o altro: se lo lasci vuoto il luogo resta senza link.")),
  );
  return {
    nodo,
    raccogli: async () => ({
      stagione: st.get(),
      data: data.value,
      luogo: luogo.value,
      link: link.value,
      km: km.value,
    }),
  };
};

moduli.mese = () => {
  const anno = menuATendina(stato.anni.map((a) => ({ valore: a, testo: a })), stato.ultimoAnno);
  const mese = menuATendina(stato.mesi.map((m) => ({ valore: m, testo: m })), stato.mesi[new Date().getMonth()]);
  const km = casella("number", "", { min: "0", step: "1", inputmode: "numeric", placeholder: "es. 420" });
  const corse = casella("number", "0", { min: "0", step: "1", inputmode: "numeric" });
  const presenti = el("div", { class: "usati" });
  const modoBox = el("div", { class: "campo pieno" });
  const modo = segmentato(
    [
      { valore: "somma", testo: "Sommo ai km che ci sono" },
      { valore: "sostituisci", testo: "Sostituisco i km" },
    ],
    "somma",
  );
  modoBox.append(el("span", { class: "etichetta", text: "Il mese c'è già: cosa faccio?" }), modo.el);
  const aggiorna = () => {
    const a = elenco && elenco.anni.find((x) => x.anno === anno.value);
    const mesi = a ? a.mesi : [];
    presenti.replaceChildren(
      el("span", { class: "aiuto", text: `Mesi presenti nel ${anno.value}:` }),
      mesi.length
        ? mesi.map((m) => el("span", { class: "chip testo", text: `${m.mese} ${m.km} km` }))
        : el("span", { class: "chip testo", text: "nessuno" }),
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
    campo("Corse da aggiungere all'anno", corse, "0 = non cambiare il numero di corse."),
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
    periodo.replaceChildren(...s.periodi.map((p) => el("option", { value: p, text: p })));
    periodo.value = s.ultimo;
  };
  const st = segmentato(opzioniStagioni(), "Autunno_Inverno", aggiornaPeriodi);
  aggiornaPeriodi(st.get());
  const zona = zonaFile({
    multiplo: true,
    titolo: "Trascina qui le foto .jpg o clicca per sceglierle",
    sotto: "Continuano la numerazione: le foto già presenti non vengono mai sovrascritte.",
  });
  const nodo = el(
    "div",
    { class: "griglia" },
    el("div", { class: "campo pieno" }, el("span", { class: "etichetta", text: "Stagione" }), st.el),
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

// Sezione "primo giro" riusata da nuova stagione.
const sezionePrimoGiro = (chiave) => {
  const s = stato.stagioni[chiave];
  const data = casella("text", `01 ${s.meseIniziale}`, { placeholder: "es. 05 Giugno" });
  const luogo = casella("text", "", { placeholder: "Luogo" });
  const link = casella("url", "", { placeholder: "https://www.komoot.com/…" });
  const km = casella("number", "", { min: "0", step: "1", placeholder: "km" });
  const sez = opzionale(
    "Inserisci subito il primo giro (altrimenti metto un giro d'esempio da sostituire)",
    el(
      "div",
      { class: "griglia" },
      campo("Data (giorno e mese)", data),
      campo("Km", km),
      el("div", { class: "pieno" }, campo("Luogo", luogo)),
      el("div", { class: "pieno" }, campo("Link (facoltativo)", link)),
    ),
  );
  return {
    el: sez.el,
    leggi: () => (sez.attivo() ? { data: data.value, luogo: luogo.value, link: link.value, km: km.value } : null),
  };
};

moduli.stagione = () => {
  let colore = null;
  let primoGiro = null;
  const contenitore = el("div", { class: "griglia" });
  const periodo = casella("text", "");
  const nFoto = casella("number", "0", { min: "0", step: "1", inputmode: "numeric" });
  const zona = zonaFile({
    multiplo: true,
    titolo: "Foto della stagione (.jpg): trascinale qui o clicca",
    sotto: "Verranno copiate come 1.jpg, 2.jpg… e la galleria della pagina verrà costruita da sola. Puoi anche saltare.",
  });
  const st = segmentato(opzioniStagioni(), "Primavera", (k) => costruisci(k));
  const costruisci = (chiave) => {
    const s = stato.stagioni[chiave];
    periodo.value = s.prossimo;
    colore = campoColore(`Colore di ${s.testo} (nome CSS o #esadecimale)`, s.colori);
    primoGiro = sezionePrimoGiro(chiave);
    contenitore.replaceChildren(
      el("div", { class: "campo pieno" }, el("span", { class: "etichetta", text: "Stagione" }), st.el),
      campo(s.formato === "anno" ? "Anno" : "Periodo (es. 2027-2028)", periodo, `Ultimo presente: ${s.ultimo}`),
      colore.el,
      el("div", { class: "pieno" }, zona.el),
      campo("Se non carichi foto: quante ne avrà la pagina?", nFoto, "0 = galleria vuota, le aggiungi dopo."),
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

// Sezione "primo mese" riusata da anno e anno completo.
const sezionePrimoMese = () => {
  const mese = menuATendina(stato.mesi.map((m) => ({ valore: m, testo: m })), "Gennaio");
  const km = casella("number", "0", { min: "0", step: "1" });
  const corse = casella("number", "0", { min: "0", step: "1" });
  const sez = opzionale(
    "Inserisci subito il primo mese (altrimenti metto Gennaio a 0 km da sostituire)",
    el("div", { class: "griglia" }, campo("Mese", mese), campo("Km del mese", km), campo("Corse dell'anno finora", corse)),
  );
  return {
    el: sez.el,
    leggi: () => (sez.attivo() ? { mese: mese.value, km: km.value, corse: corse.value } : null),
  };
};

moduli.anno = () => {
  const anno = casella("text", stato.prossimoAnno);
  const colore = campoColore("Colore dell'anno (nome CSS o #esadecimale)", stato.coloriAnni);
  const icona = zonaFile({
    multiplo: false,
    titolo: "Icona dell'anno (.jpg): trascinala qui o clicca",
    sotto: "Facoltativa: se la salti la creo io, con l'anno scritto sul colore scelto.",
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

moduli["anno-completo"] = () => {
  const anno = casella("text", stato.prossimoAnno);
  const colore = campoColore("Colore dell'anno (Statistiche)", stato.coloriAnni);
  const icona = zonaFile({
    multiplo: false,
    titolo: "Icona dell'anno (.jpg): trascinala qui o clicca",
    sotto: "Facoltativa: se la salti la creo io.",
  });
  const mese = sezionePrimoMese();
  const stagioni = Object.entries(stato.stagioni).map(([chiave, s]) => ({
    chiave,
    s,
    colore: campoColore(`Colore di ${s.testo}`, s.colori),
    nFoto: casella("number", "0", { min: "0", step: "1", inputmode: "numeric" }),
    titolo: el("h3", { text: s.etichetta }),
  }));
  const periodoDi = (chiave) => {
    const n = parseInt(anno.value, 10);
    if (!n) return "";
    return stato.stagioni[chiave].formato === "anno" ? String(n) : `${n}-${n + 1}`;
  };
  const aggiornaTitoli = () =>
    stagioni.forEach((x) => (x.titolo.textContent = `${x.s.etichetta} ${periodoDi(x.chiave)}`));
  anno.addEventListener("input", aggiornaTitoli);
  aggiornaTitoli();
  const nodo = el(
    "div",
    { class: "griglia" },
    campo("Nuovo anno", anno, `Ultimo presente: ${stato.ultimoAnno}`),
    colore.el,
    el("div", { class: "pieno" }, icona.el),
    mese.el,
    stagioni.map((x) =>
      el(
        "div",
        { class: "gruppo pieno" },
        x.titolo,
        el("div", { class: "griglia" }, x.colore.el, campo("Quante foto avrà la pagina?", x.nFoto, "0 = galleria vuota.")),
      ),
    ),
  );
  return {
    nodo,
    raccogli: async () => ({
      anno: anno.value,
      colore: colore.get(),
      iconaSid: await carica(icona.files(), "icona"),
      primoMese: mese.leggi(),
      stagioni: Object.fromEntries(stagioni.map((x) => [x.chiave, { colore: x.colore.get(), nFoto: x.nFoto.value }])),
    }),
  };
};

// ---------- elenco (sola lettura) ----------

const vistaElenco = () => {
  const radice = el("div");
  if (!elenco) {
    radice.append(el("p", { class: "aiuto", text: "Impossibile leggere i dati." }));
    return radice;
  }
  const mostra = el("div");
  const tab = segmentato(
    [
      { valore: "anni", testo: "📅 Anni" },
      { valore: "giri", testo: "🚴 Giri per stagione" },
    ],
    "anni",
    () => disegna(),
  );

  const MESI_BREVI = ["G", "F", "M", "A", "M", "G", "L", "A", "S", "O", "N", "D"];

  const disegnaAnni = () => {
    const massimo = Math.max(1, ...elenco.anni.flatMap((a) => a.mesi.map((m) => m.km)));
    return el(
      "div",
      { class: "schede" },
      [...elenco.anni].reverse().map((a) =>
        el(
          "article",
          { class: "anno" },
          el(
            "header",
            {},
            el("h3", {}, el("i", { style: a.colore ? `background:${a.colore}` : "" }), a.anno),
            el("div", { class: "numeri" }, `${a.km} km`, el("br"), `${a.corse} corse`),
          ),
          el(
            "div",
            { class: "barre" },
            stato.mesi.map((nome) => {
              const m = a.mesi.find((x) => x.mese === nome);
              return el("div", {
                class: m ? "" : "vuoto",
                style: `height:${m ? Math.max(4, (m.km / massimo) * 100) : 4}%`,
                title: m ? `${nome}: ${m.km} km` : `${nome}: —`,
              });
            }),
          ),
          el("div", { class: "barre-etichette" }, MESI_BREVI.map((x) => el("span", { text: x }))),
        ),
      ),
    );
  };

  const disegnaGiri = () => {
    const st = segmentato(
      elenco.stagioni.map((s) => ({ valore: s.chiave, testo: s.etichetta })),
      "Autunno_Inverno",
      () => riempi(),
    );
    const periodo = menuATendina([]);
    const tabella = el("div");
    const riempi = () => {
      const s = elenco.stagioni.find((x) => x.chiave === st.get());
      const attuale = periodo.value;
      periodo.replaceChildren(...s.periodi.map((p) => el("option", { value: p.periodo, text: p.periodo })));
      periodo.value = s.periodi.some((p) => p.periodo === attuale) ? attuale : s.periodi[s.periodi.length - 1].periodo;
      scrivi();
    };
    const scrivi = () => {
      const s = elenco.stagioni.find((x) => x.chiave === st.get());
      const p = s.periodi.find((x) => x.periodo === periodo.value);
      tabella.replaceChildren(
        el("p", { class: "frase", text: `${s.testo} ${p.periodo}: ${p.giri.length} giri · ${p.km} km` }),
        el(
          "div",
          { class: "tabella-box" },
          el(
            "table",
            {},
            el("thead", {}, el("tr", {}, el("th", { class: "num", text: "#" }), el("th", { text: "Data" }), el("th", { text: "Luogo" }), el("th", { class: "num", text: "Km" }))),
            el(
              "tbody",
              {},
              p.giri.map((g, i) =>
                el(
                  "tr",
                  {},
                  el("td", { class: "num", text: String(i + 1) }),
                  el("td", { text: g.data }),
                  el("td", {}, g.link ? el("a", { href: g.link, target: "_blank", rel: "noopener", text: g.luogo }) : g.luogo),
                  el("td", { class: "num", text: String(g.km) }),
                ),
              ),
            ),
          ),
        ),
      );
    };
    periodo.addEventListener("change", scrivi);
    riempi();
    return el(
      "div",
      { class: "griglia" },
      el("div", { class: "campo pieno" }, st.el),
      campo("Periodo", periodo),
      el("div", { class: "pieno" }, tabella),
    );
  };

  const disegna = () => mostra.replaceChildren(tab.get() === "anni" ? disegnaAnni() : disegnaGiri());
  radice.append(el("div", { class: "campo", style: "margin-bottom:18px" }, tab.el), mostra);
  disegna();
  return radice;
};

// ---------- risultato (anteprima / esito) ----------

const mostraErrore = (testo) => {
  $("#risultato").replaceChildren(
    el("div", { class: "esito errore", role: "alert" }, el("h3", { text: "Non posso procedere" }), el("p", { text: testo })),
  );
  $("#risultato").scrollIntoView({ behavior: "smooth", block: "nearest" });
};

const corpoRiepilogo = (r) => [
  r.note.map((n, i) => (i === 0 ? el("p", { class: "frase", text: n }) : null)),
  r.note.length > 1 ? el("ul", { class: "elenco-note" }, r.note.slice(1).map((n) => el("li", { text: n.replace(/^•\s*/, "") }))) : null,
  r.avvisi.map((a) => el("div", { class: "avviso", text: `⚠ ${a}` })),
  r.creati.map((f) => el("div", { class: "file crea" }, el("b", { text: "+ crea" }), f)),
  r.cartelle.map((f) => el("div", { class: "file crea" }, el("b", { text: "+ cartella" }), `${f}/`)),
  r.modificati.map((f) => el("div", { class: "file modifica" }, el("b", { text: "~ aggiorna" }), f)),
  r.promemoria.length
    ? el("div", { class: "promemoria" }, el("strong", { text: "Da fare a mano" }), r.promemoria.map((p) => el("div", { text: `• ${p}` })))
    : null,
  r.esempio ? el("div", { class: "promemoria", text: "Sostituisci il giro/mese d'esempio con i dati veri quando li hai." }) : null,
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
      r.prova ? el("div", { class: "avviso", text: "Modalità --prova: l'anteprima è corretta ma non viene scritto nessun file." }) : null,
      el("div", { class: "azioni" }, conferma, el("button", { class: "btn", type: "button", text: "Annulla", onclick: onAnnulla })),
    ),
  );
  $("#risultato").scrollIntoView({ behavior: "smooth", block: "nearest" });
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
  $("#risultato").scrollIntoView({ behavior: "smooth", block: "nearest" });
};

// ---------- navigazione ----------

let casoAttuale = null;

const apriCaso = (id) => {
  const caso = stato.casi.find((c) => c.id === id) || stato.casi[0];
  casoAttuale = caso;
  history.replaceState(null, "", `#${caso.id}`);
  document.querySelectorAll(".voce").forEach((v) => v.classList.toggle("attiva", v.dataset.id === caso.id));
  $("#risultato").replaceChildren();

  const vista = $("#vista");
  vista.replaceChildren(el("h2", { text: `${caso.icona} ${caso.titolo}` }), el("p", { class: "sotto", text: caso.descrizione }));

  if (!caso.scrive) {
    vista.append(vistaElenco());
    return;
  }

  const modulo = moduli[caso.id]();
  const bottone = el("button", { class: "btn primario", type: "button", text: "Anteprima" });
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

const disegnaMenu = () => {
  $("#menu").replaceChildren(
    ...stato.casi.map((c) =>
      el(
        "button",
        { class: "voce", type: "button", "data-id": c.id, onclick: () => apriCaso(c.id) },
        el("span", { class: "ico", text: c.icona }),
        el("span", {}, el("strong", { text: c.titolo }), el("small", { text: c.descrizione })),
      ),
    ),
  );
};

(async () => {
  try {
    await ricarica();
  } catch (e) {
    $("#vista").replaceChildren(el("h2", { text: "Non riesco a leggere i dati" }), el("p", { text: e.message }));
    return;
  }
  $("#radice").textContent = stato.radice;
  $("#badge-prova").hidden = !stato.prova;
  disegnaMenu();
  apriCaso(location.hash.slice(1) || "giro");
})();
