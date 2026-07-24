// ============================================================
// barra-lettura.js — Barra di avanzamento della lettura
// Crea la barra in cima e la allunga man mano che si scorre.
// Stili corrispondenti: assets/css/componenti/barra-lettura.css
// Nessuna dipendenza.
// ============================================================

(function () {
  "use strict";

  function barraAvanzamento() {
    var barra = document.createElement("div");
    barra.className = "scroll-progress";
    barra.setAttribute("aria-hidden", "true");
    document.body.appendChild(barra);

    var inCorso = false;

    function aggiorna() {
      var altezza = document.documentElement.scrollHeight - window.innerHeight;
      var quota = altezza > 0 ? window.scrollY / altezza : 0;
      barra.style.transform = "scaleX(" + Math.min(quota, 1) + ")";
      inCorso = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (inCorso) return;
        inCorso = true;
        window.requestAnimationFrame(aggiorna);
      },
      { passive: true },
    );

    aggiorna();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", barraAvanzamento);
  } else {
    barraAvanzamento();
  }
})();
