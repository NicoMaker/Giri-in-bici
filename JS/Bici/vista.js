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
    const scrivi = function () {
      B.contenitore.innerHTML = `
            <img class="immagini_stagione" src="${B.dati.intestazioni.home}" alt="" />
            <p class="bici-home-frase">
              La Madonnina in Bici ci ricorda perch&eacute; pedaliamo: benessere,
              salute e libert&agrave; a ogni giro di pedale.
            </p>`;
      B.impostaFiltroAttivo("home");
      B.contenitore.classList.remove("bici-cambio");
    };

    const motoRidotto = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (motoRidotto || !B.contenitore.innerHTML.trim()) {
      scrivi();
      return;
    }

    B.contenitore.classList.add("bici-cambio");
    window.setTimeout(scrivi, 180);
  };

  // Mostra le bici filtrate per tipo ("mtb", "corsa" o "tutte")
  B.mostraBiciFiltrate = function (tipo) {
    const biciFiltrate =
      tipo === "tutte"
        ? B.dati.bici
        : B.dati.bici.filter((b) => b.tipo === tipo);

    const intestazioni = B.renderIntestazioni(tipo);

    const scrivi = function () {
      B.contenitore.innerHTML = `
            ${intestazioni}
            <div class="bici-grid">
              ${biciFiltrate.map(B.renderCard).join("")}
            </div>`;
      B.impostaFiltroAttivo(tipo);
      B.contenitore.classList.remove("bici-cambio");
    };

    // Prima di sostituire il catalogo, una breve dissolvenza: il
    // cambio di categoria non è più un taglio secco. Al primo
    // caricamento (riquadro vuoto) o con "riduci animazioni" attivo,
    // si scrive subito, senza attesa.
    const motoRidotto = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (motoRidotto || !B.contenitore.innerHTML.trim()) {
      scrivi();
      return;
    }

    B.contenitore.classList.add("bici-cambio");
    window.setTimeout(scrivi, 180);
  };
})(window.Bici);
