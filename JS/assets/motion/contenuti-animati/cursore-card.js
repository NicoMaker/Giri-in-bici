// ============================================================
// cursore-card.js — Riflesso che segue il cursore sulle card
// principali, e leggera inclinazione 3D "magnetica" che segue il
// cursore.
//
// Un solo ascoltatore delegato sul documento: funziona anche per le
// card create dopo, senza doverle osservare una per una. Sposta
// quattro variabili CSS: --mx/--my (il riflesso) e --tilt-x/--tilt-y
// (l'inclinazione, gradi già pronti per rotateX/rotateY): il resto lo
// fa micro-interazioni.css / card-statistiche.css.
//
// Nessuna dipendenza. Rispetta prefers-reduced-motion.
// Richiamato da assets/motion/contenuti-animati.js
// ============================================================

window.ContenutiAnimati = window.ContenutiAnimati || {};

((CA) => {
  "use strict";

  const motoRidotto = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const TILT_MASSIMO = 6; // gradi: sottile, non un effetto da luna park

  CA.seguiCursoreSuCard = () => {
    if (motoRidotto) return;
    document.addEventListener(
      "pointermove",
      (e) => {
        const card =
          e.target.closest && e.target.closest(".colore, .bici-card");
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const xRapporto = (e.clientX - rect.left) / rect.width;
        const yRapporto = (e.clientY - rect.top) / rect.height;
        card.style.setProperty("--mx", xRapporto * 100 + "%");
        card.style.setProperty("--my", yRapporto * 100 + "%");
        card.style.setProperty(
          "--tilt-x",
          ((0.5 - yRapporto) * TILT_MASSIMO).toFixed(2) + "deg",
        );
        card.style.setProperty(
          "--tilt-y",
          ((xRapporto - 0.5) * TILT_MASSIMO).toFixed(2) + "deg",
        );
      },
      { passive: true },
    );
  };
})(window.ContenutiAnimati);
