// ricerca-menu.js — Filtra le voci del menu mentre si scrive.

// Una voce resta visibile se il suo nome inizia con quello che hai scritto.
export function collegaRicerca(campo, elenco, messaggioVuoto) {
  if (!campo) return;

  campo.addEventListener("input", () => {
    const testo = campo.value.trim().toLowerCase();
    let visibili = 0;

    elenco.querySelectorAll("li").forEach((voce) => {
      const nome = (voce.dataset.nome || "").toLowerCase();
      const mostra = nome.startsWith(testo);
      voce.hidden = !mostra;
      if (mostra) visibili++;
    });

    if (messaggioVuoto) messaggioVuoto.hidden = visibili > 0;
  });
}
