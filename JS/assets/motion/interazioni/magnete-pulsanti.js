// ============================================================
// magnete-pulsanti.js — I pulsanti principali "seguono" appena il cursore
//
// Solo sui pulsanti piu' importanti della pagina (".graficostagioni",
// il CTA "Stagioni" in barra, e ".cta-classifica", i pulsanti "Vai
// alla classifica..."): mentre il cursore ci passa vicino, il
// pulsante si sposta di pochi pixel verso di lui, per poi tornare
// al centro con la stessa molla usata sull'hover (--ease-spring,
// vedi animazioni-scroll-moderne.css). Spostamento minimo (max 8px):
// resta un dettaglio, non uno spostamento vero del layout.
//
// Attivo solo se il dispositivo ha davvero un puntatore preciso
// (mouse/trackpad, non un dito) e l'utente non ha ridotto le
// animazioni. Un solo ascoltatore per pulsante, nessuna dipendenza.
//
// Stile corrispondente: assets/css/componenti/animazioni/base/
// animazioni-scroll-moderne.css (usa la transizione gia' definita
// li' su .graficostagioni/.cta-classifica, non ne aggiunge una qui).
// ============================================================

(function () {
  "use strict";

  var motoRidotto = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var puntatoreFine = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  if (motoRidotto || !puntatoreFine) return;

  var RAGGIO_MASSIMO = 8; // px, spostamento massimo in ogni direzione

  function avvia() {
    var pulsanti = document.querySelectorAll(
      ".graficostagioni, .cta-classifica",
    );
    if (!pulsanti.length) return;

    pulsanti.forEach(function (pulsante) {
      pulsante.addEventListener(
        "pointermove",
        function (e) {
          var rect = pulsante.getBoundingClientRect();
          var relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
          var relY = (e.clientY - rect.top) / rect.height - 0.5;
          pulsante.style.transform =
            "translate(" +
            (relX * RAGGIO_MASSIMO * 2).toFixed(1) +
            "px, " +
            (relY * RAGGIO_MASSIMO * 2).toFixed(1) +
            "px)";
        },
        { passive: true },
      );

      pulsante.addEventListener("pointerleave", function () {
        // Vuoto: la transizione con --ease-spring (definita nel CSS)
        // riporta da sola il pulsante al posto suo, con il rimbalzo.
        pulsante.style.transform = "";
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})();
