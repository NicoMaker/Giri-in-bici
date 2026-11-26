moduli.foto = () => {
  const periodo = menuATendina([]);
  const aggiornaPeriodi = (chiave) => {
    const s = stato.stagioni[chiave];
    periodo.replaceChildren(
      ...s.periodi.map((p) => el("option", { value: p, text: p })),
    );
    periodo.value = s.ultimo;
  };
  const st = segmentato(opzioniStagioni(), "Autunno_Inverno", aggiornaPeriodi);
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
