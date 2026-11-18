// ============================================================
// barra-lettura.js — Barra di avanzamento della lettura
// Crea la barra in cima e la allunga man mano che si scorre.
// Stili corrispondenti: assets/css/componenti/interazioni/barra-lettura.css
// Nessuna dipendenza.
// ============================================================

(() => {
  "use strict";
  const barraAvanzamento = () => {
    const barra = document.createElement("div");
    barra.className = "scroll-progress";
    barra.setAttribute("aria-hidden", "true");
    document.body.appendChild(barra);

    let inCorso = false;

    const aggiorna = () => {
      const altezza =
        document.documentElement.scrollHeight - window.innerHeight;
      const quota = altezza > 0 ? window.scrollY / altezza : 0;
      barra.style.transform = "scaleX(" + Math.min(quota, 1) + ")";
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

    aggiorna();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", barraAvanzamento);
  } else {
    barraAvanzamento();
  }
})();
