// ---------- utenti ----------
let utenti = [];
const azzeraUtente = () => {
  $("#u-originale").value = "";
  for (const i of ["username", "name", "description", "avatar", "komoot"])
    $(`#u-${i}`).value = "";
  $("#u-visibile").value = "1";
};
const disegnaUtenti = () => {
  const q = norm($("#u-filtro").value.trim());
  const dati = utenti.filter(
    (u) =>
      !q || norm([u.username, u.name, u.description].join(" ")).includes(q),
  );
  $("#u-conteggio").textContent = `${dati.length} di ${utenti.length} utenti`;
  $("#u-lista").replaceChildren(
    ...(dati.length
      ? dati.map((u) =>
          el(
            "article",
            { class: "ride" },
            el(
              "div",
              { class: "utente-riga" },
              el("div", {
                class: "utente-avatar",
                text: (u.name || u.username)[0].toUpperCase(),
              }),
              el(
                "div",
                { class: "ride-info" },
                el("strong", { text: u.name || u.username }),
                el("p", {
                  text: `@${u.username}${u.description ? " · " + u.description : ""}`,
                }),
                el(
                  "div",
                  { class: "ride-meta" },
                  el("span", {
                    class: "ride-tag",
                    text: u.visibleInTeam ? "Visibile nel team" : "Nascosto",
                  }),
                  u.komootUrl
                    ? el("a", {
                        class: "ride-tag",
                        href: u.komootUrl,
                        target: "_blank",
                        rel: "noopener",
                        text: "Komoot",
                      })
                    : null,
                ),
              ),
            ),
            el(
              "div",
              { class: "azioni" },
              el("button", {
                class: "btn",
                type: "button",
                text: "Modifica",
                onclick: () => {
                  $("#u-originale").value = u.username;
                  $("#u-username").value = u.username;
                  $("#u-name").value = u.name || "";
                  $("#u-description").value = u.description || "";
                  $("#u-avatar").value = u.avatar || "";
                  $("#u-komoot").value = u.komootUrl || "";
                  $("#u-visibile").value = u.visibleInTeam ? "1" : "0";
                  apriDlg("dlg-utente", "Modifica utente", "t-utente");
                },
              }),
              el("button", {
                class: "btn danger",
                type: "button",
                text: "Elimina",
                onclick: async () => {
                  if (
                    await conferma(
                      "Eliminare l'utente?",
                      `${u.name || u.username} (@${u.username}) sarà rimosso dall'elenco.`,
                    )
                  )
                    await chiama(
                      "/api/gestione/utenti/elimina",
                      { username: u.username },
                      dopoModifica,
                    );
                },
              }),
            ),
          ),
        )
      : [
          el("div", {
            class: "empty-state",
            text: "Nessun utente trovato.",
          }),
        ]),
  );
};
