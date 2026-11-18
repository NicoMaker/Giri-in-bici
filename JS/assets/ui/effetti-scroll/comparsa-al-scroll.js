// ============================================================
// rivelazione.js — Comparsa graduale dei blocchi al primo scroll
// Aggiunge .is-visible agli elementi .reveal quando entrano nello
// schermo. Stili corrispondenti: assets/css/componenti/interazioni/rivelazione.css
// Nessuna dipendenza.
// ============================================================

(() => {
  "use strict";
  const rivelaAlloScroll = () => {
    const blocchi = document.querySelectorAll(".reveal");
    if (!blocchi.length) return;

    const motoRidotto = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motoRidotto.matches || !("IntersectionObserver" in window)) {
      blocchi.forEach((el) => {
        el.classList.add("is-visible");
      });
      return;
    }

    const osservatore = new IntersectionObserver(
      (voci) => {
        voci.forEach((voce) => {
          if (voce.isIntersecting) {
            voce.target.classList.add("is-visible");
            osservatore.unobserve(voce.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    blocchi.forEach((el) => {
      osservatore.observe(el);
    });

    // Rete di sicurezza: nulla resta invisibile se qualcosa va storto
    setTimeout(() => {
      blocchi.forEach((el) => {
        el.classList.add("is-visible");
      });
    }, 3000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rivelaAlloScroll);
  } else {
    rivelaAlloScroll();
  }
})();
