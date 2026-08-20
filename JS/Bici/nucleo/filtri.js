// ============================================================
// filtri.js — La barra delle categorie
//
// Evidenzia il filtro attivo e collega i click dei pulsanti.
// Dipende da: Bici/js/vista.js
// ============================================================

window.Bici = window.Bici || {};

(function (B) {
  "use strict";

  // Evidenzia il filtro attivo sia nella barra pillole sia nel menu a comparsa
  B.impostaFiltroAttivo = function (tipo) {
    document.querySelectorAll(".bici-filtro").forEach((btn) => {
      btn.classList.toggle("attivo", btn.dataset.filtro === tipo);
    });
  };

  // Collega la barra dei filtri, se presente in pagina
  B.collegaBarra = function () {
    document.querySelectorAll(".bici-filtro").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tipo = btn.dataset.filtro;
        if (tipo === "home") window.Home();
        else B.mostraBiciFiltrate(tipo);
      });
    });
  };
})(window.Bici);
