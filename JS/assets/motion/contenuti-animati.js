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

  // Anima TUTTI i numeri in italiano dentro l'elemento (non solo il primo).
  //
  // Il primo numero delle righe .misuracolore / .anima-numero resta in un
  // <span class="num">, come prima: così la posizione a destra e il grassetto
  // decisi dal CSS non cambiano di una virgola. Ogni numero in più (e i numeri
  // nelle tabelle, nelle schede bici, ecc.) va in <span class="num-anim">, una
  // classe neutra che conta senza toccare l'impaginazione.
  function animaNumero(elemento) {
    if (elemento.dataset.contato) return;
    elemento.dataset.contato = "1";

    // Solo per queste righe il primo numero mantiene la classe storica .num.
    var vuolePrimoNum =
      elemento.classList &&
      (elemento.classList.contains("misuracolore") ||
        elemento.classList.contains("anima-numero"));

    var walker = document.createTreeWalker(
      elemento,
      NodeFilter.SHOW_TEXT,
      null,
    );
    var nodi = [];
    while (walker.nextNode()) nodi.push(walker.currentNode);

    var primo = true;
    var daContare = [];
    var regex = /(\d{1,3}(?:\.\d{3})+|\d+)(,\d+)?/g;

    for (var i = 0; i < nodi.length; i++) {
      var nodo = nodi[i];
      var testo = nodo.nodeValue;
      regex.lastIndex = 0;
      if (!regex.test(testo)) continue;
      regex.lastIndex = 0;

      var frammento = document.createDocumentFragment();
      var ultimo = 0;
      var m;

      while ((m = regex.exec(testo)) !== null) {
        var grezzo = m[0];
        var idx = m.index;
        var valore = parseFloat(grezzo.replace(/\./g, "").replace(",", "."));

        if (idx > ultimo) {
          frammento.appendChild(
            document.createTextNode(testo.slice(ultimo, idx)),
          );
        }

        if (!isFinite(valore) || valore <= 0) {
          // Zeri o valori non animabili: lasciati come testo, fermi.
          frammento.appendChild(document.createTextNode(grezzo));
        } else {
          var decimali = m[2] ? m[2].length - 1 : 0;
          var span = document.createElement("span");
          span.className = primo && vuolePrimoNum ? "num" : "num-anim";
          span.textContent = formattaNumero(0, decimali);
          frammento.appendChild(span);
          daContare.push({ span: span, valore: valore, decimali: decimali });
          primo = false;
        }

        ultimo = idx + grezzo.length;
      }

      if (ultimo < testo.length) {
        frammento.appendChild(document.createTextNode(testo.slice(ultimo)));
      }

      nodo.parentNode.replaceChild(frammento, nodo);
    }

    for (var j = 0; j < daContare.length; j++) {
      conta(daContare[j].span, daContare[j].valore, daContare[j].decimali);
    }
  }

  // Conta solo quando la card entra davvero nello schermo
  var osservatoreNumeri = null;

  function preparaNumeri(radice) {
    if (motoRidotto) return;

    // .misuracolore sono le righe delle card; .anima-numero e' l'aggancio
    // per i numeri fuori da quelle righe. In piu' ora si animano anche i
    // numeri delle tabelle (celle td: storico mensile, mesi, totali...) e
    // i valori delle schede bici: cosi' "tutti i numeri, da ogni parte"
    // entrano contando. Le intestazioni (th) e le etichette restano ferme.
    var selettore =
      ".misuracolore:not([data-contato]):not([data-osservato])," +
      ".anima-numero:not([data-contato]):not([data-osservato])," +
      "td:not([data-contato]):not([data-osservato])," +
      ".bici-card__spec-value:not([data-contato]):not([data-osservato])";
    var elementi = (radice || document).querySelectorAll(selettore);
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

    // Rete di sicurezza: se qualcosa arriva tardi (tabelle, card...), lo
    // anima comunque. Si ripassa anche tutto il documento, così i numeri
    // delle tabelle finite in contenitori non osservati non restano fermi.
    setTimeout(function () {
      CONTENITORI.forEach(function (selettore) {
        document.querySelectorAll(selettore).forEach(function (el) {
          if (!motoRidotto) scaglionaFigli(el);
        });
      });
      preparaNumeri(document);
    }, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})();
