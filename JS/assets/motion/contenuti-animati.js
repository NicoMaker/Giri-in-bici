// ============================================================
// contenuti-animati.js — Vita ai contenuti creati da JavaScript
//
// Solo l'avvio. I pezzi stanno in motion/contenuti-animati/:
//   numeri.js         conteggio animato dei numeri
//   scaglionamento.js entrata scaglionata delle card appena inserite
//   cursore-card.js   riflesso e inclinazione 3D che seguono il cursore
//
// Stili corrispondenti: assets/css/componenti/animazioni/animazioni.css
// Dipendenze: motion/contenuti-animati/numeri.js,
//             motion/contenuti-animati/scaglionamento.js,
//             motion/contenuti-animati/cursore-card.js
// Nessuna dipendenza esterna. Incluso in tutte le pagine con defer.
// ============================================================

(function (CA) {
  "use strict";

  function avvia() {
    document.documentElement.classList.add("motion-ready");
    CA.osservaContenuti();
    CA.preparaNumeri(document);
    CA.seguiCursoreSuCard();

    // Rete di sicurezza: se qualcosa arriva tardi (tabelle, card...), lo
    // anima comunque. Si ripassa anche tutto il documento, così i numeri
    // delle tabelle finite in contenitori non osservati non restano fermi.
    setTimeout(function () {
      var motoRidotto = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      CA.CONTENITORI.forEach(function (selettore) {
        document.querySelectorAll(selettore).forEach(function (el) {
          if (!motoRidotto) CA.scaglionaFigli(el);
        });
      });
      CA.preparaNumeri(document);
    }, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})(window.ContenutiAnimati);
