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
