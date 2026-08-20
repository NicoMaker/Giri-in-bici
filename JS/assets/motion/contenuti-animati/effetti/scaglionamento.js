// ============================================================
// scaglionamento.js — Entrata scaglionata delle card create da
// JavaScript (podi, classifiche, griglie...) appena inserite nel DOM.
//
// Stili corrispondenti: assets/css/componenti/animazioni/animazioni.css
// Dipendenze: contenuti-animati/numeri.js (CA.preparaNumeri) —
// guardano gli stessi contenitori con lo stesso osservatore, così non
// serve duplicare l'elenco dei contenitori e il MutationObserver.
// Richiamato da assets/motion/contenuti-animati.js
// ============================================================

window.ContenutiAnimati = window.ContenutiAnimati || {};

(function (CA) {
  "use strict";

  var motoRidotto = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  CA.CONTENITORI = [
    "#stampa",
    "#totale",
    "#km",
    "#dati",
    "#StampaBici",
    "#Grafici",
    "#grafici",
    "#mesi",
    ".team-grid",
    "#podio",
    "#classifica",
    "#record-mesi",
    "#podio-record-mesi",
    "#podio-anno-corrente",
    "#classifica-anno-corrente",
    "#podio-anni",
    "#classifica-anni",
    "#podio-stagioni",
    "#classifica-periodi",
    "#podio-periodi",
    "#podio-mensili",
    "#classifica-mensili",
  ];

  CA.scaglionaFigli = function (contenitore) {
    var griglia = contenitore.querySelector(".container") || contenitore;
    var figli = griglia.children;
    for (var i = 0; i < figli.length; i++) {
      if (figli[i].dataset.entrato) continue;
      figli[i].dataset.entrato = "1";
      figli[i].style.setProperty("--ritardo", i * 70 + "ms");
      figli[i].classList.add("entra");
    }
  };

  CA.osservaContenuti = function () {
    if (!("MutationObserver" in window)) return;

    var osservatore = new MutationObserver(function (mutazioni) {
      mutazioni.forEach(function (m) {
        if (!m.addedNodes.length) return;
        var bersaglio = m.target;
        if (!motoRidotto) CA.scaglionaFigli(bersaglio);
        CA.preparaNumeri(bersaglio);
      });
    });

    CA.CONTENITORI.forEach(function (selettore) {
      document.querySelectorAll(selettore).forEach(function (el) {
        osservatore.observe(el, { childList: true, subtree: true });
      });
    });
  };
})(window.ContenutiAnimati);
