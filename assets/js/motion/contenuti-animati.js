// ============================================================
// contenuti-animati.js — Vita ai contenuti creati da JavaScript
//
// Due effetti che restano insieme perche' guardano gli stessi
// contenitori con lo stesso osservatore: separarli vorrebbe dire
// duplicare l'elenco dei contenitori e il MutationObserver.
//   1. conteggio animato dei numeri (.misuracolore)
//   2. entrata scaglionata delle card appena inserite
//
// Stili corrispondenti: assets/css/componenti/animazioni.css
// Nessuna dipendenza. Rispetta prefers-reduced-motion.
// ============================================================

(function () {
  "use strict";

  var motoRidotto = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ---------------------------------------------------------
  // 1. Conteggio animato dei numeri
  // ---------------------------------------------------------
  // Formattazione italiana con separatore delle migliaia SEMPRE attivo da
  // 1.000 in su. Non si usa toLocaleString("it-IT") perche' la regola CLDR
  // italiana non raggruppa i numeri a 4 cifre (1234 restava "1234" mentre
  // 12345 diventava "12.345"): l'animazione sovrascriveva cosi' la
  // formattazione corretta prodotta da JS/utils.js.
  function formattaNumero(valore, decimali) {
    var negativo = valore < 0;
    var fisso = Math.abs(valore).toFixed(decimali);
    var pezzi = fisso.split(".");
    var intero = pezzi[0];

    if (intero.length > 3) {
      var gruppi = [];
      var i = intero.length;
      while (i > 0) {
        gruppi.unshift(intero.substring(Math.max(0, i - 3), i));
        i -= 3;
      }
      intero = gruppi.join(".");
    }

    return (negativo ? "-" : "") + intero + (pezzi[1] ? "," + pezzi[1] : "");
  }

  function conta(elemento, obiettivo, decimali) {
    var durata = 1100;
    var avvio = null;

    function passo(ora) {
      if (avvio === null) avvio = ora;
      var t = Math.min((ora - avvio) / durata, 1);
      var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      elemento.textContent = formattaNumero(obiettivo * eased, decimali);
      if (t < 1) window.requestAnimationFrame(passo);
      else elemento.textContent = formattaNumero(obiettivo, decimali);
    }

    window.requestAnimationFrame(passo);
  }

  // Trova il primo numero in italiano dentro l'elemento e lo anima
  function animaNumero(elemento) {
    if (elemento.dataset.contato) return;
    elemento.dataset.contato = "1";

    var walker = document.createTreeWalker(
      elemento,
      NodeFilter.SHOW_TEXT,
      null,
    );
    var nodi = [];
    while (walker.nextNode()) nodi.push(walker.currentNode);

    for (var i = 0; i < nodi.length; i++) {
      var nodo = nodi[i];
      var trovato = nodo.nodeValue.match(/(\d{1,3}(?:\.\d{3})+|\d+)(,\d+)?/);
      if (!trovato) continue;

      var grezzo = trovato[0];
      var valore = parseFloat(grezzo.replace(/\./g, "").replace(",", "."));
      if (!isFinite(valore) || valore <= 0) continue;

      var decimali = trovato[2] ? trovato[2].length - 1 : 0;
      var testo = nodo.nodeValue;
      var prima = testo.slice(0, trovato.index);
      var dopo = testo.slice(trovato.index + grezzo.length);

      var span = document.createElement("span");
      span.className = "num";
      span.textContent = formattaNumero(0, decimali);

      var frammento = document.createDocumentFragment();
      if (prima) frammento.appendChild(document.createTextNode(prima));
      frammento.appendChild(span);
      if (dopo) frammento.appendChild(document.createTextNode(dopo));

      nodo.parentNode.replaceChild(frammento, nodo);
      conta(span, valore, decimali);
      return;
    }
  }

  // Conta solo quando la card entra davvero nello schermo
  var osservatoreNumeri = null;

  function preparaNumeri(radice) {
    if (motoRidotto) return;

    // .misuracolore sono le righe delle card; .anima-numero e' l'aggancio
    // per i numeri che stanno fuori da quelle righe (es. le quote di
    // stagione nel riepilogo), dove la posizione la decide gia' il CSS.
    var elementi = (radice || document).querySelectorAll(
      ".misuracolore:not([data-contato]):not([data-osservato])," +
        ".anima-numero:not([data-contato]):not([data-osservato])",
    );
    if (!elementi.length) return;

    if (!("IntersectionObserver" in window)) {
      elementi.forEach(animaNumero);
      return;
    }

    if (!osservatoreNumeri) {
      osservatoreNumeri = new IntersectionObserver(
        function (voci) {
          voci.forEach(function (voce) {
            if (!voce.isIntersecting) return;
            animaNumero(voce.target);
            osservatoreNumeri.unobserve(voce.target);
          });
        },
        { threshold: 0.25 },
      );
    }

    elementi.forEach(function (el) {
      el.dataset.osservato = "1";
      osservatoreNumeri.observe(el);
    });
  }

  // ---------------------------------------------------------
  // 2. Entrata scaglionata dei contenuti creati da JavaScript
  // ---------------------------------------------------------
  var CONTENITORI = [
    "#stampa",
    "#totale",
    "#km",
    "#dati",
    "#StampaBici",
    "#Grafici",
    "#grafici",
    "#mesi",
    ".team-grid",
  ];

  function scaglionaFigli(contenitore) {
    var griglia = contenitore.querySelector(".container") || contenitore;
    var figli = griglia.children;
    for (var i = 0; i < figli.length; i++) {
      if (figli[i].dataset.entrato) continue;
      figli[i].dataset.entrato = "1";
      figli[i].style.setProperty("--ritardo", i * 70 + "ms");
      figli[i].classList.add("entra");
    }
  }

  function osservaContenuti() {
    if (!("MutationObserver" in window)) return;

    var osservatore = new MutationObserver(function (mutazioni) {
      mutazioni.forEach(function (m) {
        if (!m.addedNodes.length) return;
        var bersaglio = m.target;
        if (!motoRidotto) scaglionaFigli(bersaglio);
        preparaNumeri(bersaglio);
      });
    });

    CONTENITORI.forEach(function (selettore) {
      document.querySelectorAll(selettore).forEach(function (el) {
        osservatore.observe(el, { childList: true, subtree: true });
      });
    });
  }

  // ---------------------------------------------------------
  // 3. Avvio
  // ---------------------------------------------------------
  function avvia() {
    document.documentElement.classList.add("motion-ready");
    osservaContenuti();
    preparaNumeri(document);

    // Rete di sicurezza: se qualcosa arriva tardi, lo anima comunque
    setTimeout(function () {
      CONTENITORI.forEach(function (selettore) {
        document.querySelectorAll(selettore).forEach(function (el) {
          if (!motoRidotto) scaglionaFigli(el);
          preparaNumeri(el);
        });
      });
    }, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})();
