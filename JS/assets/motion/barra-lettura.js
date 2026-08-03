// ============================================================
// barra-lettura.js — Barra di avanzamento della lettura
// Crea la barra in cima e la allunga man mano che si scorre.
// Stili corrispondenti: assets/css/componenti/interazioni/barra-lettura.css
// Nessuna dipendenza.
// ============================================================

(function () {
  "use strict";

  function barraAvanzamento() {
    var barra = document.createElement("div");
    barra.className = "scroll-progress";
    barra.setAttribute("aria-hidden", "true");
    document.body.appendChild(barra);

    var ruota = document.createElement("div");
    ruota.className = "scroll-progress-wheel";
    ruota.setAttribute("aria-hidden", "true");
    document.body.appendChild(ruota);

    var inCorso = false;

    function aggiorna() {
      var altezza = document.documentElement.scrollHeight - window.innerHeight;
      var quota = altezza > 0 ? window.scrollY / altezza : 0;
      var percentuale = Math.min(quota, 1);
      barra.style.transform = "scaleX(" + percentuale + ")";
      ruota.style.left = percentuale * 100 + "%";
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
