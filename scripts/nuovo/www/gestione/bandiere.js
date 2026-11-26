// ---------- bandiere: creare, sostituire ed eliminare le immagini (Img/Icons/Bandiere/<Nome>.<ext>) ----------
const MAX_BANDIERA_MB = 5;
let bandieraFile = null;
let bandieraUrlLocale = null;
const nomeCartellaBandiera = (nome) =>
  String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48)
    .replace(/_+$/g, "");
const selezioneBandiere = creaSelezione({
  contenitore: $("#b-barra-box"),
  singolare: "bandiera",
  plurale: "bandiere",
  genere: "f",
  endpoint: "/api/gestione/bandiere/elimina-multiplo",
  campo: "codici",
  descrivi: (codici) => {
    const nomi = codici.map(
      (c) => (paesi.find((p) => p.codice === c) || { nome: c }).nome,
    );
    return `${nomi.join(", ")}: verranno tolte dal catalogo e i file cancellati da Img/Icons/Bandiere. Quelle ancora usate nei giri restano.`;
  },
  ridisegna: () => disegnaBandiere(),
});
const usiBandiera = (codice) =>
  giri.filter((g) => String(g.luogo || "").includes(`{${codice}}`)).length;
const percorsoBandiera = () => {
  const cartella = nomeCartellaBandiera($("#b-nome").value);
  const codice = $("#b-codice").value;
  const attuale = paesi.find((p) => p.codice === codice);
  let estensione = attuale ? attuale.file.split(".").pop() : "png";
  if (bandieraFile) {
    const tipo = bandieraFile.type;
    estensione =
      tipo === "image/jpeg" ? "jpg" : tipo === "image/webp" ? "webp" : "png";
  }
  $("#b-percorso").textContent = cartella
    ? `Verrà salvata in Img/Icons/Bandiere/${cartella}.${estensione}`
    : "Il file prende il nome che scrivi qui.";
};
const scegliFileBandiera = (file) => {
  if (file && !/^image\/(png|jpeg|webp)$/.test(file.type)) {
    $("#b-stato").textContent = "Usa un'immagine PNG, JPG o WebP.";
    return;
  }
  if (file && file.size > MAX_BANDIERA_MB * 1024 * 1024) {
    $("#b-stato").textContent = `L'immagine supera ${MAX_BANDIERA_MB} MB.`;
    return;
  }
  bandieraFile = file || null;
  if (bandieraUrlLocale) URL.revokeObjectURL(bandieraUrlLocale);
  bandieraUrlLocale = null;
  const anteprima = $("#b-anteprima");
  if (!bandieraFile) {
    $("#b-stato").textContent = "";
  } else {
    bandieraUrlLocale = URL.createObjectURL(bandieraFile);
    anteprima.src = bandieraUrlLocale;
    anteprima.hidden = false;
    $("#b-stato").textContent =
      `${bandieraFile.name} · ${Math.ceil(bandieraFile.size / 1024)} KB`;
  }
  percorsoBandiera();
};
const azzeraBandiera = () => {
  $("#b-codice").value = "";
  $("#b-nome").value = "";
  $("#b-file").value = "";
  $("#b-anteprima").hidden = true;
  $("#b-anteprima").removeAttribute("src");
  $("#b-drop-testo").textContent =
    "Trascina qui un'immagine oppure scegli un file";
  $("#b-stato").textContent = "";
  $("#b-salva-testo").textContent = "Salva bandiera";
  scegliFileBandiera(null);
};
const modificaBandiera = (p) => {
  azzeraBandiera();
  $("#b-codice").value = p.codice;
  $("#b-nome").value = p.nome;
  $("#b-anteprima").src = p.src;
  $("#b-anteprima").hidden = false;
  $("#b-drop-testo").textContent =
    "Trascina una nuova immagine per sostituirla (facoltativo)";
  $("#b-salva-testo").textContent = "Salva modifiche";
  percorsoBandiera();
  apriDlg("dlg-bandiera", `Modifica ${p.nome}`, "t-bandiera");
};
const disegnaBandiere = () => {
  const q = norm($("#b-filtro").value.trim());
  const dati = paesi.filter((p) => !q || norm(p.nome).includes(q));
  $("#b-conteggio").textContent = `${dati.length} di ${paesi.length} bandiere`;
  $("#b-lista").replaceChildren(
    ...(dati.length
      ? dati.map((p) => {
          const usi = usiBandiera(p.codice);
          const immagine = el("img", {
            src: p.src,
            alt: p.nome,
            loading: "lazy",
          });
          immagine.addEventListener(
            "error",
            () =>
              immagine.replaceWith(
                el("span", { class: "carta-bandiera__vuota" }, ico("alert")),
              ),
            { once: true },
          );
          return el(
            "article",
            {
              class: `carta-bandiera${p.mancante ? " carta-bandiera--rotta" : ""}${selezioneBandiere.ha(p.codice) ? " selezionata" : ""}`,
            },
            el(
              "label",
              { class: "spunta carta-bandiera__spunta" },
              selezioneBandiere.casella(p.codice, p.nome),
            ),
            el("div", { class: "carta-bandiera__immagine" }, immagine),
            el(
              "div",
              { class: "carta-bandiera__info" },
              el("strong", { text: p.nome }),
              el("code", { text: `Img/Icons/Bandiere/${p.file}` }),
              el(
                "span",
                {
                  class: `ride-tag ${p.mancante ? "tag-avviso" : usi ? "tag-ok" : ""}`,
                },
                ico(p.mancante ? "alert" : usi ? "check" : "flag"),
                p.mancante
                  ? "File mancante: sostituiscilo"
                  : usi
                    ? `Usata in ${usi} ${usi === 1 ? "giro" : "giri"}`
                    : "Non ancora usata",
              ),
            ),
            el(
              "div",
              { class: "carta-bandiera__azioni" },
              el(
                "button",
                {
                  class: "btn",
                  type: "button",
                  onclick: () => modificaBandiera(p),
                },
                ...conIcona("edit", "Modifica"),
              ),
              el(
                "button",
                {
                  class: "btn danger",
                  type: "button",
                  title: usi
                    ? "Prima togli la bandiera dai giri che la usano"
                    : "Elimina la bandiera",
                  onclick: () => eliminaBandiera(p),
                },
                ...conIcona("trash", "Elimina"),
              ),
            ),
          );
        })
      : [
          el(
            "div",
            { class: "empty-state" },
            ico("flag", "ico-grande"),
            el("span", {
              text: paesi.length
                ? "Nessuna bandiera trovata."
                : "Nessuna bandiera: creane una con “Nuova bandiera” o metti un'immagine in Img/Icons/Bandiere.",
            }),
          ),
        ]),
  );
  selezioneBandiere.aggiorna(
    dati.map((p) => p.codice),
    paesi.map((p) => p.codice),
  );
};
const eliminaBandiera = async (p) => {
  const usi = usiBandiera(p.codice);
  if (usi)
    return avvisa(
      `${p.nome} è usata in ${usi} ${usi === 1 ? "giro" : "giri"}: toglila prima dai giri, poi potrai eliminarla.`,
      true,
    );
  const ok = await conferma(
    "Eliminare la bandiera?",
    `${p.nome} verrà rimossa dal catalogo e il file Img/Icons/Bandiere/${p.file} cancellato.`,
    "Elimina bandiera",
  );
  if (ok)
    await chiama(
      "/api/gestione/bandiere/elimina",
      { codice: p.codice },
      dopoModifica,
    );
};
const salvaBandiera = async (e) => {
  e.preventDefault();
  const codice = $("#b-codice").value;
  const nome = $("#b-nome").value.trim();
  if (!nome) return avvisa("Scrivi il nome della bandiera.", true);
  if (!codice && !bandieraFile)
    return avvisa("Scegli o trascina prima un'immagine.", true);
  const bottone = $("#b-salva");
  bottone.disabled = true;
  try {
    const url = new URL(
      codice ? "/api/gestione/bandiere/modifica" : "/api/gestione/bandiere",
      window.location.href,
    );
    url.searchParams.set("nome", nome);
    if (codice) url.searchParams.set("codice", codice);
    const risposta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": bandieraFile?.type || "application/octet-stream",
      },
      body: bandieraFile || new Blob([]),
    });
    const esito = await risposta.json().catch(() => ({}));
    if (!risposta.ok || !esito.ok)
      return avvisa(
        esito.errore || "Non è stato possibile salvare la bandiera.",
        true,
      );
    const catalogo = await api("/api/gestione/paesi");
    if (catalogo.ok) paesi = catalogo.paesi;
    window.dispatchEvent(new Event("bandiere:aggiornate"));
    avvisa(esito.messaggio);
    await dopoModifica();
    azzeraBandiera();
  } catch {
    avvisa(
      "Il server non risponde. Controlla che `node scripts/server.js` sia acceso.",
      true,
    );
  } finally {
    bottone.disabled = false;
  }
};
$("#nuova-bandiera").addEventListener("click", () => {
  azzeraBandiera();
  apriDlg("dlg-bandiera", "Nuova bandiera", "t-bandiera");
  $("#b-nome").focus();
});
$("#form-bandiera").addEventListener("submit", salvaBandiera);
$("#b-nome").addEventListener("input", percorsoBandiera);
$("#b-filtro").addEventListener("input", disegnaBandiere);
$("#b-file").addEventListener("change", (e) =>
  scegliFileBandiera(e.target.files?.[0]),
);
$("#b-drop").addEventListener("dragover", (e) => {
  e.preventDefault();
  $("#b-drop").classList.add("in-trascinamento");
});
$("#b-drop").addEventListener("dragleave", () =>
  $("#b-drop").classList.remove("in-trascinamento"),
);
$("#b-drop").addEventListener("drop", (e) => {
  e.preventDefault();
  $("#b-drop").classList.remove("in-trascinamento");
  scegliFileBandiera(e.dataTransfer?.files?.[0]);
});
window.addEventListener("bandiere:aggiornate", disegnaBandiere);
