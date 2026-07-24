// ============================================================
// menu-tastiera.js — Il tasto Esc chiude il menu laterale
// Lavora insieme a JS/Hamburger.js: simula il click sul pulsante,
// così la chiusura resta una sola, in un posto solo.
// ============================================================

(function () {
  "use strict";

  function escChiudeMenu() {
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var menu = document.querySelector(".menu.showMenu");
      if (!menu) return;
      var hamburger = document.querySelector(".hamburger");
      if (hamburger) hamburger.click();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", escChiudeMenu);
  } else {
    escChiudeMenu();
  }
})();
