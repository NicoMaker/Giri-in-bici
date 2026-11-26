// ---------- utenti ----------
let utenti = [];
const selUtenti = creaSelezione({
  contenitore: $("#u-barra-box"),
  singolare: "utente",
  plurale: "utenti",
  endpoint: "/api/gestione/utenti/elimina-multiplo",
  campo: "usernames",
  descrivi: (nomi) => {
    const elenco = nomi.map((n) => {
      const u = utenti.find((x) => x.username === n);
      return u ? `${nomeUtente(u)} (@${u.username})` : n;
    });
    return `${elenco.slice(0, 6).join(", ")}${elenco.length > 6 ? ` e altri ${elenco.length - 6}` : ""} saranno rimossi dall'elenco.`;
  },
  ridisegna: () => disegnaUtenti(),
});
const azzeraUtente = () => {
  $("#u-originale").value = "";
  for (const i of ["username", "name", "description", "avatar", "komoot"])
    $(`#u-${i}`).value = "";
  $("#u-visibile").value = "1";
  aggiornaAnteprimaAvatar();
};
const nomeUtente = (u) => u.name || u.username;
// Avatar vero se il file esiste in Img/About_US, altrimenti un'icona (con il motivo nel suggerimento).
const avatarUtenteNodo = (u, grande = false) => {
  const classe = `utente-avatar${grande ? " utente-avatar--grande" : ""}`;
  const icona = () =>
    el(
      "div",
      {
        class: `${classe} utente-avatar--icona`,
        title: u.avatarMancante
          ? `Avatar non trovato: Img/About_US/${u.avatar}`
          : "Nessun avatar",
      },
      ico(u.avatarMancante ? "alert" : "user"),
    );
  if (!u.avatarSrc) return icona();
  const img = el("img", {
    class: `${classe} utente-avatar--img`,
    src: u.avatarSrc,
    alt: `Avatar di ${nomeUtente(u)}`,
    loading: "lazy",
  });
  img.addEventListener("error", () => img.replaceWith(icona()), { once: true });
  return img;
};
// Anteprima dell'avatar scritto nel modulo (si aggiorna mentre scrivi il nome del file).
function aggiornaAnteprimaAvatar() {
  const box = $("#u-avatar-anteprima");
  if (!box) return;
  const file = $("#u-avatar").value.trim();
  const noto = utenti.find((u) => u.avatar === file && u.avatarSrc);
  box.replaceChildren(
    avatarUtenteNodo(
      noto
        ? noto
        : file && /^[\w.\- ]+\.(jpe?g|png|webp|gif|svg)$/i.test(file)
          ? {
              username: file,
              avatar: file,
              avatarSrc: `/img/About_US/${encodeURIComponent(file)}?v=${Date.now()}`,
              avatarMancante: true,
            }
          : { username: "?", avatar: "" },
      true,
    ),
  );
}
const utentiVisibili = () => {
  const q = norm($("#u-filtro").value.trim());
  return utenti.filter(
    (u) =>
      !q || norm([u.username, u.name, u.description].join(" ")).includes(q),
  );
};
const disegnaUtenti = () => {
  const dati = utentiVisibili();
  $("#u-conteggio").textContent = `${dati.length} di ${utenti.length} utenti`;
  $("#u-lista").replaceChildren(
    ...(dati.length
      ? dati.map((u) => {
          const spunta = selUtenti.casella(u.username, nomeUtente(u));
          return el(
            "article",
            {
              class: `ride utente-scheda${selUtenti.ha(u.username) ? " selezionata" : ""}`,
            },
            el(
              "div",
              { class: "utente-riga" },
              el("label", { class: "spunta" }, spunta),
              avatarUtenteNodo(u),
              el(
                "div",
                { class: "ride-info" },
                el("strong", { text: nomeUtente(u) }),
                el("p", {
                  text: `@${u.username}${u.description ? " · " + u.description : ""}`,
                }),
                el(
                  "div",
                  { class: "ride-meta" },
                  el(
                    "span",
                    {
                      class: `ride-tag ${u.visibleInTeam ? "tag-ok" : "tag-spento"}`,
                    },
                    ico(u.visibleInTeam ? "eye" : "eyeoff"),
                    u.visibleInTeam ? "Visibile nel team" : "Nascosto",
                  ),
                  u.avatar
                    ? el(
                        "span",
                        {
                          class: `ride-tag ${u.avatarMancante ? "tag-avviso" : ""}`,
                          title: `Img/About_US/${u.avatar}`,
                        },
                        ico(u.avatarMancante ? "alert" : "image"),
                        u.avatarMancante ? "Avatar non trovato" : u.avatar,
                      )
                    : null,
                  u.komootUrl
                    ? el(
                        "a",
                        {
                          class: "ride-tag",
                          href: u.komootUrl,
                          target: "_blank",
                          rel: "noopener",
                        },
                        ico("map"),
                        "Komoot",
                      )
                    : null,
                ),
              ),
            ),
            el(
              "div",
              { class: "azioni" },
              el(
                "button",
                {
                  class: "btn",
                  type: "button",
                  onclick: () => {
                    $("#u-originale").value = u.username;
                    $("#u-username").value = u.username;
                    $("#u-name").value = u.name || "";
                    $("#u-description").value = u.description || "";
                    $("#u-avatar").value = u.avatar || "";
                    $("#u-komoot").value = u.komootUrl || "";
                    $("#u-visibile").value = u.visibleInTeam ? "1" : "0";
                    aggiornaAnteprimaAvatar();
                    apriDlg("dlg-utente", "Modifica utente", "t-utente");
                  },
                },
                ...conIcona("edit", "Modifica"),
              ),
              el(
                "button",
                {
                  class: "btn danger",
                  type: "button",
                  onclick: async () => {
                    if (
                      await conferma(
                        "Eliminare l'utente?",
                        `${nomeUtente(u)} (@${u.username}) sarà rimosso dall'elenco.`,
                      )
                    )
                      await chiama(
                        "/api/gestione/utenti/elimina",
                        { username: u.username },
                        dopoModifica,
                      );
                  },
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
            ico("users", "ico-grande"),
            el("span", { text: "Nessun utente trovato." }),
          ),
        ]),
  );
  selUtenti.aggiorna(
    dati.map((u) => u.username),
    utenti.map((u) => u.username),
  );
};
$("#u-avatar").addEventListener("input", aggiornaAnteprimaAvatar);
