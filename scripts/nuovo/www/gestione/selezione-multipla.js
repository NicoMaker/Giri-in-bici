// ---------- selezione di più elementi + eliminazione insieme (utenti, giri, bandiere) ----------
// Crea la barra con "seleziona tutti", contatore, "Deseleziona" ed "Elimina selezionati" e dà alle righe
// una casella (Maiusc + clic spunta un intervallo). Le chiavi scelte restano anche cambiando i filtri.
const creaSelezione = ({
  contenitore, // dove mettere la barra
  singolare, // "giro"
  plurale, // "giri"
  genere = "m", // "m" → selezionato/eliminato, "f" → selezionata/eliminata
  endpoint, // POST che elimina più elementi
  campo, // nome del campo con le chiavi nel corpo della richiesta
  descrivi, // (chiavi) => testo che elenca cosa si sta per eliminare
  ridisegna, // ridisegna la lista
}) => {
  const scelti = new Set();
  let ultimo = null;
  let visibili = [];
  const f = genere === "f";
  const tutti = el("input", {
    type: "checkbox",
    "aria-label": `Seleziona tutti: ${plurale} visibili`,
  });
  const testo = el("span", { "aria-live": "polite" });
  const deseleziona = el(
    "button",
    {
      class: "btn",
      type: "button",
      hidden: true,
      onclick: () => {
        scelti.clear();
        ridisegna();
      },
    },
    ...conIcona("close", "Deseleziona"),
  );
  const elimina = el(
    "button",
    {
      class: "btn danger",
      type: "button",
      disabled: true,
      onclick: () => eliminaScelti(),
    },
    ...conIcona("trash", "Elimina selezionati"),
  );
  const barra = el(
    "div",
    {
      class: "barra-selezione",
      role: "toolbar",
      "aria-label": `Selezione multipla: ${plurale}`,
    },
    el("label", { class: "spunta spunta-tutti" }, tutti),
    testo,
    deseleziona,
    elimina,
  );
  contenitore.replaceChildren(barra);
  const imposta = (k, acceso) => (acceso ? scelti.add(k) : scelti.delete(k));
  const aggiorna = (chiaviVisibili, chiaviEsistenti) => {
    visibili = chiaviVisibili;
    if (chiaviEsistenti)
      for (const k of [...scelti])
        if (!chiaviEsistenti.includes(k)) scelti.delete(k);
    const spuntati = visibili.filter((k) => scelti.has(k)).length;
    const n = scelti.size;
    tutti.checked = visibili.length > 0 && spuntati === visibili.length;
    tutti.indeterminate = spuntati > 0 && spuntati < visibili.length;
    tutti.disabled = !visibili.length;
    barra.classList.toggle("attiva", n > 0);
    testo.textContent = n
      ? `${n} ${n === 1 ? singolare : plurale} ${n === 1 ? (f ? "selezionata" : "selezionato") : f ? "selezionate" : "selezionati"}`
      : `Spunta ${f ? "una o più" : "uno o più"} ${plurale} per eliminar${f ? "le" : "li"} insieme`;
    elimina.disabled = n === 0;
    deseleziona.hidden = n === 0;
  };
  const casella = (k, etichetta) => {
    const c = el("input", {
      type: "checkbox",
      class: "spunta-riga",
      "aria-label": `Seleziona ${etichetta}`,
    });
    c.checked = scelti.has(k);
    c.addEventListener("click", (e) => {
      const acceso = c.checked;
      const da = ultimo === null ? -1 : visibili.indexOf(ultimo);
      const a = visibili.indexOf(k);
      if (e.shiftKey && da >= 0 && a >= 0)
        visibili
          .slice(Math.min(da, a), Math.max(da, a) + 1)
          .forEach((x) => imposta(x, acceso));
      else imposta(k, acceso);
      ultimo = k;
      ridisegna();
    });
    return c;
  };
  tutti.addEventListener("change", () => {
    visibili.forEach((k) => imposta(k, tutti.checked));
    ridisegna();
  });
  const eliminaScelti = async () => {
    const chiavi = [...scelti];
    if (!chiavi.length) return;
    const n = chiavi.length;
    const ok = await conferma(
      n === 1
        ? `Eliminare ${f ? "la" : "il"} ${singolare}?`
        : `Eliminare ${n} ${plurale}?`,
      descrivi(chiavi),
      n === 1 ? `Elimina ${singolare}` : `Elimina ${n} ${plurale}`,
    );
    if (!ok) return;
    const r = await chiama(endpoint, { [campo]: chiavi }, dopoModifica);
    if (r) scelti.clear();
    ridisegna();
  };
  return {
    casella,
    aggiorna,
    ha: (k) => scelti.has(k),
    pulisci: () => scelti.clear(),
  };
};
