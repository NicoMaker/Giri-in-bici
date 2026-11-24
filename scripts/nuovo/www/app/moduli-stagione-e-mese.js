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
