// ============================================================
// tocco-pulsanti.js — Cerchio che si espande al tocco/click
//
// Un solo ascoltatore delegato su tutto il documento: funziona
// anche sui pulsanti creati dopo (pillole del selettore, "Vai al
// periodo", voci del podio...), senza doverli agganciare uno per
// uno e senza toccare nessun file che li genera.
//
// Stile corrispondente: assets/css/componenti/interazioni/
// micro-interazioni.css (classe .tocco-cerchio)
// Rispetta prefers-reduced-motion: con quella preferenza attiva
// lo script non si avvia proprio.
// ============================================================

(function () {
  "use strict";

  var motoRidotto = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (motoRidotto) return;

  // Pulsanti e pillole già esistenti nel sito: pillole del
  // selettore vista, pulsanti "vai a...", torna su, link-bottone,
  // paginazione, e qualunque <button> generico.
  var SELETTORE =
    "button, .selettore-metrica__pulsante, .cta-classifica, " +
    ".colore__vai-a, .to-top, .link-bottone";

  document.addEventListener(
    "pointerdown",
    function (e) {
      if (e.button !== undefined && e.button !== 0) return; // solo tasto sinistro / tocco
      var bersaglio = e.target.closest && e.target.closest(SELETTORE);
      if (!bersaglio || bersaglio.disabled) return;

      // Serve un contenitore posizionato per piazzare il cerchio dentro
      // ai bordi arrotondati del pulsante: se il pulsante è già
      // posizionato (es. .to-top è "fixed") non si tocca nulla.
      if (getComputedStyle(bersaglio).position === "static") {
        bersaglio.style.position = "relative";
      }
      if (!bersaglio.style.overflow) {
        bersaglio.style.overflow = "hidden";
      }

      var rect = bersaglio.getBoundingClientRect();
      var lato = Math.max(rect.width, rect.height) * 1.6;
      var cerchio = document.createElement("span");
      cerchio.className = "tocco-cerchio";
      cerchio.style.width = lato + "px";
      cerchio.style.height = lato + "px";
      cerchio.style.left = e.clientX - rect.left - lato / 2 + "px";
      cerchio.style.top = e.clientY - rect.top - lato / 2 + "px";
      bersaglio.appendChild(cerchio);

      cerchio.addEventListener("animationend", function () {
        cerchio.remove();
      });
      // Rete di sicurezza: se per qualche motivo "animationend" non
      // arriva (tab in background, ecc.), il cerchio non resta lì.
      setTimeout(function () {
        if (cerchio.parentNode) cerchio.remove();
      }, 900);
    },
    { passive: true },
  );
})();
