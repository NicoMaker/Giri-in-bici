// ============================================================
// vista.js — Cosa si vede nel riquadro del catalogo
//
// Decide se mostrare la schermata di benvenuto o le bici filtrate,
// e scrive il risultato dentro Bici.contenitore.
// Dipende da: Bici/js/schede.js, Bici/js/filtri.js
// ============================================================

window.Bici = window.Bici || {};

(function (B) {
  "use strict";

  // Mostra solo l'intestazione Home (schermata di benvenuto)
  B.mostraHome = function () {
    B.contenitore.innerHTML = `
          <img class="immagini_stagione" src="${B.dati.intestazioni.home}" alt="" />
          <p class="bici-home-frase">
            La Madonnina in Bici ci ricorda perch&eacute; pedaliamo: benessere,
            salute e libert&agrave; a ogni giro di pedale.
          </p>`;
    B.impostaFiltroAttivo("home");
  };

  // Mostra le bici filtrate per tipo ("mtb", "corsa" o "tutte")
  B.mostraBiciFiltrate = function (tipo) {
    const biciFiltrate =
      tipo === "tutte"
        ? B.dati.bici
        : B.dati.bici.filter((b) => b.tipo === tipo);

    const intestazioni = B.renderIntestazioni(tipo);

    B.contenitore.innerHTML = `
          ${intestazioni}
          <div class="bici-grid">
            ${biciFiltrate.map(B.renderCard).join("")}
          </div>`;

    B.impostaFiltroAttivo(tipo);
  };
})(window.Bici);
