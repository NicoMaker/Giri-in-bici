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
  const st = segmentato(opzioniStagioni(), "Primavera", (k) => costruisci(k));
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
      campo(s.formato === "anno" ? "Anno" : "Periodo (es. 2027-2028)", periodo),
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
