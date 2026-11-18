// ============================================================
// torna-su.js — Pulsante "torna su"
// Compare dopo 600px di scorrimento e riporta in cima alla pagina.
// Stili corrispondenti: assets/css/componenti/interazioni/torna-su.css
// Nessuna dipendenza.
// ============================================================

(() => {
  "use strict";
  const motoRidotto = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const tornaSu = () => {
    const bottone = document.createElement("button");
    bottone.type = "button";
    bottone.className = "to-top";
    bottone.setAttribute("aria-label", "Torna all'inizio della pagina");
    bottone.innerHTML = '<span aria-hidden="true">&uarr;</span>';
    document.body.appendChild(bottone);

    bottone.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: motoRidotto ? "auto" : "smooth",
      });
    });

    let inCorso = false;

    const aggiorna = () => {
      bottone.classList.toggle("is-visible", window.scrollY > 600);
      inCorso = false;
    };

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
    document.addEventListener("DOMContentLoaded", tornaSu);
  } else {
    tornaSu();
  }
})();
