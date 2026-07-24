// ============================================================
// icone.js — Set di icone disegnate a tratto, condiviso dal sito
// Nessuna dipendenza, nessun font esterno da scaricare.
//
// Le icone sono SVG scritti a mano su una griglia 24x24: prendono
// il colore del testo che le circonda (currentColor), quindi
// seguono da sole il tema chiaro/scuro e l'accento di stagione.
//
// Uso:
//   Icone.svg("bici")                -> stringa con il markup
//   <span data-icona="bici"></span>  -> riempito da solo al caricamento
// ============================================================

(function () {
  "use strict";

  var TRATTI = {
    casa:
      '<path d="M3.2 10.6 12 3.4l8.8 7.2"/>' +
      '<path d="M5.6 9.6V20.2h12.8V9.6"/>' +
      '<path d="M9.7 20.2v-5.6h4.6v5.6"/>',

    bici:
      '<circle cx="5.6" cy="16.6" r="3.4"/>' +
      '<circle cx="18.4" cy="16.6" r="3.4"/>' +
      '<path d="M6.2 16.6h5.4L9.5 9.4H8.2"/>' +
      '<path d="M9.5 9.4h5.8"/>' +
      '<path d="m11.6 16.6 3.7-7.2"/>' +
      '<path d="m15.3 9.4 3.1 7.2"/>',

    statistiche:
      '<path d="M4 20.4h16"/>' +
      '<rect x="5.6" y="12.4" width="3.6" height="5.6" rx="1.2"/>' +
      '<rect x="10.2" y="7.6" width="3.6" height="10.4" rx="1.2"/>' +
      '<rect x="14.8" y="10" width="3.6" height="8" rx="1.2"/>',

    primavera:
      '<circle cx="12" cy="12" r="2.2"/>' +
      '<circle cx="12" cy="6.6" r="2.7"/>' +
      '<circle cx="17.1" cy="10.3" r="2.7"/>' +
      '<circle cx="15.2" cy="16.4" r="2.7"/>' +
      '<circle cx="8.8" cy="16.4" r="2.7"/>' +
      '<circle cx="6.9" cy="10.3" r="2.7"/>',

    estate:
      '<circle cx="12" cy="12" r="4"/>' +
      '<path d="M12 2.4v2.2"/><path d="M12 19.4v2.2"/>' +
      '<path d="M2.4 12h2.2"/><path d="M19.4 12h2.2"/>' +
      '<path d="m5.2 5.2 1.6 1.6"/><path d="m17.2 17.2 1.6 1.6"/>' +
      '<path d="m18.8 5.2-1.6 1.6"/><path d="m6.8 17.2-1.6 1.6"/>',

    inverno:
      '<path d="M12 2.6v18.8"/>' +
      '<path d="m3.9 7.3 16.2 9.4"/>' +
      '<path d="m20.1 7.3-16.2 9.4"/>' +
      '<path d="m9.6 5 2.4-2.4L14.4 5"/>' +
      '<path d="m9.6 19 2.4 2.4L14.4 19"/>' +
      '<path d="M4.9 10.1 3.9 7.3l3-.5"/>' +
      '<path d="m19.1 13.9 1 2.8-3 .5"/>' +
      '<path d="m19.1 10.1 1-2.8-3-.5"/>' +
      '<path d="M4.9 13.9 3.9 16.7l3 .5"/>',

    indietro: '<path d="M20 12H4.4"/><path d="m10.6 5.6-6.2 6.4 6.2 6.4"/>',

    accesso:
      '<path d="M14.6 3.4h4a1.8 1.8 0 0 1 1.8 1.8v13.6a1.8 1.8 0 0 1-1.8 1.8h-4"/>' +
      '<path d="m9.6 8.2 4 3.8-4 3.8"/>' +
      '<path d="M13.6 12H3.6"/>',

    informazioni:
      '<circle cx="12" cy="12" r="9"/>' +
      '<path d="M12 11.2v5"/>' +
      '<path d="M12 7.6h.01"/>',

    codice:
      '<circle cx="6.6" cy="5.6" r="2.6"/>' +
      '<circle cx="6.6" cy="18.4" r="2.6"/>' +
      '<circle cx="17.4" cy="7.8" r="2.6"/>' +
      '<path d="M6.6 8.2v7.6"/>' +
      '<path d="M17.4 10.4v1.4a3.4 3.4 0 0 1-3.4 3.4H9.4"/>',

    qr:
      '<rect x="3.4" y="3.4" width="7" height="7" rx="1.6"/>' +
      '<rect x="13.6" y="3.4" width="7" height="7" rx="1.6"/>' +
      '<rect x="3.4" y="13.6" width="7" height="7" rx="1.6"/>' +
      '<path d="M13.6 13.6h3.2v3.2"/>' +
      '<path d="M20.6 16.8v3.8h-3.8"/>' +
      '<path d="M13.6 20.6h.01"/>',

    tutte:
      '<rect x="3.4" y="3.4" width="7.4" height="7.4" rx="2"/>' +
      '<rect x="13.2" y="3.4" width="7.4" height="7.4" rx="2"/>' +
      '<rect x="3.4" y="13.2" width="7.4" height="7.4" rx="2"/>' +
      '<rect x="13.2" y="13.2" width="7.4" height="7.4" rx="2"/>',

    montagna:
      '<path d="M2.6 19.6h18.8"/>' +
      '<path d="m3.4 19.6 6.2-11.4 3.6 6 2.2-3 5.2 8.4"/>' +
      '<path d="m7.9 11.1 1 .9 .7-.8 .9 1.1"/>',

    velocita:
      '<path d="M3.6 18.4a9 9 0 1 1 16.8 0"/>' +
      '<path d="m12 15.4 4-5.4"/>' +
      '<circle cx="12" cy="16.4" r="1.5"/>',

    santuario:
      '<path d="M12 2.4v4"/>' +
      '<path d="M10.2 4h3.6"/>' +
      '<path d="M5.6 20.8v-9.4L12 6.6l6.4 4.8v9.4z"/>' +
      '<path d="M10.1 20.8v-3.9a1.9 1.9 0 0 1 3.8 0v3.9"/>',

    menu: '<path d="M4 7.2h16"/><path d="M4 12h16"/><path d="M4 16.8h16"/>',

    chiudi: '<path d="m6.4 6.4 11.2 11.2"/><path d="M17.6 6.4 6.4 17.6"/>',
  };

  function svg(nome, dimensione) {
    var tratti = TRATTI[nome];
    if (!tratti) return "";
    var lato = dimensione || 24;
    return (
      '<svg class="ico" width="' +
      lato +
      '" height="' +
      lato +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' +
      tratti +
      "</svg>"
    );
  }

  // Riempie ogni <span data-icona="nome"> presente nella pagina
  function riempi(radice) {
    var dove = radice || document;
    dove.querySelectorAll("[data-icona]").forEach(function (el) {
      var markup = svg(el.getAttribute("data-icona"));
      if (markup) el.innerHTML = markup;
    });
  }

  window.Icone = { svg: svg, riempi: riempi, nomi: Object.keys(TRATTI) };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      riempi();
    });
  } else {
    riempi();
  }
})();
