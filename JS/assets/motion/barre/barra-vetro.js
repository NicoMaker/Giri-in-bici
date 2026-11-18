// ============================================================
// barra-vetro.js — Barra di navigazione "di vetro"
// Aggiunge .is-scrolled a .site-bar dopo un filo di scorrimento,
// cosi' il vetro smerigliato si scurisce un po' e prende un'ombra
// leggera invece di restare sempre uguale in cima alla pagina.
// Stessa soglia/pattern di motion/torna-su.js, nessuna dipendenza.
// Stili corrispondenti: css/assets/componenti/layout/struttura/barra.css
// ============================================================

(() => {
  "use strict";
  const avvia = () => {
    const barra = document.querySelector(".site-bar");
    if (!barra) return;

    let inCorso = false;

    const aggiorna = () => {
      barra.classList.toggle("is-scrolled", window.scrollY > 12);
      inCorso = false;
    };

    aggiorna();

    window.addEventListener(
      "scroll",
      () => {
        if (inCorso) return;
        inCorso = true;
        window.requestAnimationFrame(aggiorna);
      },
      { passive: true },
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})();
