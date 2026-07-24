// ============================================================
// rivelazione.js — Comparsa graduale dei blocchi al primo scroll
// Aggiunge .is-visible agli elementi .reveal quando entrano nello
// schermo. Stili corrispondenti: assets/css/componenti/rivelazione.css
// Nessuna dipendenza.
// ============================================================

(function () {
  "use strict";

  function rivelaAlloScroll() {
    var blocchi = document.querySelectorAll(".reveal");
    if (!blocchi.length) return;

    var motoRidotto = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motoRidotto.matches || !("IntersectionObserver" in window)) {
      blocchi.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var osservatore = new IntersectionObserver(
      function (voci) {
        voci.forEach(function (voce) {
          if (voce.isIntersecting) {
            voce.target.classList.add("is-visible");
            osservatore.unobserve(voce.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    blocchi.forEach(function (el) {
      osservatore.observe(el);
    });

    // Rete di sicurezza: nulla resta invisibile se qualcosa va storto
    setTimeout(function () {
      blocchi.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }, 3000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rivelaAlloScroll);
  } else {
    rivelaAlloScroll();
  }
})();
