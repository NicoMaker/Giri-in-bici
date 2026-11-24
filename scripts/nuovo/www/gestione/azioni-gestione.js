  $("#form-giro").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("#id").value || undefined;
    const luogo = $("#f-luogo").value.trim();
    const data = $("#f-data").value.split("-").reverse().join("/");
    const confermato = await conferma(
      id ? "Confermi le modifiche al giro?" : "Confermi la creazione del giro?",
      `${luogo} · ${data} · ${$("#f-km").value} km. I dati verranno salvati solo dopo questa conferma.`,
      id ? "Salva modifiche" : "Crea giro",
    );
    if (!confermato) return;
    await chiama(
      "/api/gestione/giri/salva",
      {
        id,
        stagione: $("#f-stagione").value,
        data: $("#f-data").value,
        luogo: $("#f-luogo").value,
        km: $("#f-km").value,
        links: selLink.get(),
      },
      dopoModifica,
    );
  });
  $("#nuovo-giro").addEventListener("click", () => {
    azzeraGiro();
    apriDlg("dlg-giro", "Nuovo giro", "t-giro");
  });
  $("#nuovo-utente").addEventListener("click", () => {
    azzeraUtente();
    apriDlg("dlg-utente", "Nuovo utente", "t-utente");
  });
  $("#nuovo-colore").addEventListener("click", () =>
    apriDlg("dlg-colore"),
  );
  $("#form-utente").addEventListener("submit", async (e) => {
    e.preventDefault();
    await chiama(
      "/api/gestione/utenti/salva",
      {
        originale: $("#u-originale").value || undefined,
        username: $("#u-username").value,
        name: $("#u-name").value,
        description: $("#u-description").value,
        avatar: $("#u-avatar").value,
        komootUrl: $("#u-komoot").value,
        visibleInTeam: $("#u-visibile").value === "1",
      },
      dopoModifica,
    );
  });
  $("#form-colore").addEventListener("submit", async (e) => {
    e.preventDefault();
    await chiama(
      "/api/gestione/stagioni/colore",
      {
        stagione: $("#col-stagione").value,
        periodo: $("#col-periodo").value,
        colore: $("#colore").value,
      },
      dopoModifica,
    );
  });
  $("#col-stagione").addEventListener("change", aggiornaPeriodoColore);
  $("#col-periodo").addEventListener("change", () => {
    const x = stagioni.find(
      (s) =>
        s.chiave === $("#col-stagione").value &&
        s.periodo === $("#col-periodo").value,
    );
    if (x) $("#colore").value = x.colore;
  });
  for (const [id, f] of [
    ["#filtro", disegnaGiri],
    ["#km-da", disegnaGiri],
    ["#km-a", disegnaGiri],
    ["#u-filtro", disegnaUtenti],
    ["#p-filtro", disegnaPeriodi],
  ])
    $(id).addEventListener("input", f);
  document.querySelectorAll("[data-ordina]").forEach((b) =>
    b.addEventListener("click", () => {
      ordine = b.dataset.ordina;
      segnaOrdine();
      disegnaGiri();
    }),
  );
  $("#km-min").addEventListener("click", () => {
    $("#km-da").value = $("#km-min").dataset.v;
    disegnaGiri();
  });
  $("#km-max").addEventListener("click", () => {
    $("#km-a").value = $("#km-max").dataset.v;
    disegnaGiri();
  });
  document.querySelectorAll("[data-reset]").forEach((b) =>
    b.addEventListener("click", () => {
      const t = b.dataset.reset;
      if (t !== "ricerca") {
        ordine = "recente";
        $("#km-da").value = "";
        $("#km-a").value = "";
        Object.values(multi).forEach((m) =>
          m.opzioni.forEach((o) => m.sel.add(o.v)),
        );
        costruisciFiltri();
      }
      if (t !== "pulsanti") $("#filtro").value = "";
      disegnaGiri();
    }),
  );

  // paesi arrivano da app.js dopo l'avvio: carico i dati alla prima apertura delle sezioni
  let pronto = false;
  document.addEventListener("sezione", async (e) => {
    if (e.detail !== "inserimento" && !pronto) {
      pronto = true;
      await caricaTutto();
    }
  });
})();
