// ============================================================
// torna-su.js — Pulsante "torna su"
// Compare dopo 600px di scorrimento e riporta in cima alla pagina.
// Stili corrispondenti: assets/css/componenti/torna-su.css
// Nessuna dipendenza.
// ============================================================

(function () {
  "use strict";

  var motoRidotto = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function tornaSu() {
    var bottone = document.createElement("button");
    bottone.type = "button";
    bottone.className = "to-top";
    bottone.setAttribute("aria-label", "Torna all'inizio della pagina");
    bottone.innerHTML = '<span aria-hidden="true">&uarr;</span>';
    document.body.appendChild(bottone);

    bottone.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: motoRidotto ? "auto" : "smooth",
      });
    });

    var inCorso = false;

    function aggiorna() {
      bottone.classList.toggle("is-visible", window.scrollY > 600);
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tornaSu);
  } else {
    tornaSu();
  }
})();
