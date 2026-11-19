// apertura.js — Apre e chiude il menu a tendina.
//
// Si apre col pulsante hamburger. Si chiude con la X, con Esc, con un clic
// fuori dal pannello o scegliendo una voce.

export const collegaApertura = (pannello, pulsante) => {
  if (!pannello || !pulsante) return;

  const chiudiPannello = pannello.querySelector(".menu-close");

  const imposta = (aperto) => {
    pannello.classList.toggle("showMenu", aperto);
    pulsante.classList.toggle("closeIcon", aperto);
    pulsante.setAttribute("aria-expanded", aperto ? "true" : "false");
    pulsante.setAttribute(
      "aria-label",
      aperto ? "Chiudi il menu" : "Apri il menu",
    );
  };

  const chiudi = () => {
    if (!pannello.classList.contains("showMenu")) return;
    imposta(false);

    // Il campo di ricerca non viene messo a fuoco da solo all'apertura,
    // altrimenti su telefono si aprirebbe subito la tastiera.
    const campo = pannello.querySelector("input");
    if (campo && document.activeElement === campo) campo.blur();
    pulsante.focus();
  };

  pulsante.setAttribute("aria-expanded", "false");
  pulsante.addEventListener("click", () => {
    if (pannello.classList.contains("showMenu")) chiudi();
    else imposta(true);
  });

  if (chiudiPannello) chiudiPannello.addEventListener("click", chiudi);

  // Un clic su una voce (link o pulsante) richiude il menu
  pannello.addEventListener("click", (e) => {
    const voce = e.target.closest("a, button");
    const resta = voce && voce.closest(".menu-espandi");
    if (voce && voce !== chiudiPannello && !resta) chiudi();
  });

  // Un clic fuori dal pannello lo richiude
  document.addEventListener("click", (e) => {
    if (pannello.contains(e.target) || pulsante.contains(e.target)) return;
    chiudi();
  });

  // Esc chiude il pannello
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") chiudi();
  });
};
