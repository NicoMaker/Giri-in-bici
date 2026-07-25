// ============================================================
// motion.js — Animazioni condivise di Giri in Bici
// Nessuna dipendenza. Rispetta prefers-reduced-motion.
// ============================================================

(function () {
  "use strict";

  var motoRidotto = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ---------------------------------------------------------
  // 1. Barra di avanzamento della lettura
  // ---------------------------------------------------------
  function barraAvanzamento() {
    var barra = document.createElement("div");
    barra.className = "scroll-progress";
    barra.setAttribute("aria-hidden", "true");
    document.body.appendChild(barra);

    var inCorso = false;

    function aggiorna() {
      var altezza = document.documentElement.scrollHeight - window.innerHeight;
      var quota = altezza > 0 ? window.scrollY / altezza : 0;
      barra.style.transform = "scaleX(" + Math.min(quota, 1) + ")";
      inCorso = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (inCorso) return;
        inCorso = true;
        window.requestAnimationFrame(aggiorna);
      },
      { passive: true },
    );

    aggiorna();
  }

  // ---------------------------------------------------------
  // 2. Pulsante "torna su"
  // ---------------------------------------------------------
  function tornaSu() {
    var bottone = document.createElement("button");
    bottone.type = "button";
    bottone.className = "to-top";
    bottone.setAttribute("aria-label", "Torna all'inizio della pagina");
    bottone.innerHTML = '<span aria-hidden="true">&uarr;</span>';
    document.body.appendChild(bottone);

    bottone.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: motoRidotto ? "auto" : "smooth",
      });
    });

    var inCorso = false;

    function aggiorna() {
      bottone.classList.toggle("is-visible", window.scrollY > 600);
      inCorso = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (inCorso) return;
        inCorso = true;
        window.requestAnimationFrame(aggiorna);
      },
      { passive: true },
    );
  }

  // ---------------------------------------------------------
  // 3. Conteggio animato dei numeri
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

  // Anima TUTTI i numeri; il VALORE a destra (.num) è l'ultimo numero
  // FUORI dalle parentesi, gli altri sono .num-anim (neutri). Così
  // "(12 mesi) 27,92" allinea 27,92 e lascia "(12 mesi)" nell'etichetta.
  function animaNumero(elemento) {
    if (elemento.dataset.contato) return;
    elemento.dataset.contato = "1";

    var vuoleValore =
      elemento.classList &&
      (elemento.classList.contains("misuracolore") ||
        elemento.classList.contains("anima-numero"));

    var walker = document.createTreeWalker(
      elemento,
      NodeFilter.SHOW_TEXT,
      null,
    );
    var nodi = [];
    var inizi = [];
    var unito = "";
    while (walker.nextNode()) {
      inizi.push(unito.length);
      nodi.push(walker.currentNode);
      unito += walker.currentNode.nodeValue;
    }

    var numero = /(\d{1,3}(?:\.\d{3})+|\d+)(,\d+)?/g;

    var posValore = -1;
    if (vuoleValore) {
      var mm;
      var ultimoQualsiasi = -1;
      numero.lastIndex = 0;
      while ((mm = numero.exec(unito)) !== null) {
        ultimoQualsiasi = mm.index;
        var testa = unito.slice(0, mm.index);
        var aperte = (testa.match(/\(/g) || []).length;
        var chiuse = (testa.match(/\)/g) || []).length;
        if (aperte <= chiuse) posValore = mm.index;
      }
      if (posValore === -1) posValore = ultimoQualsiasi;
    }

    var daContare = [];

    for (var i = 0; i < nodi.length; i++) {
      var nodo = nodi[i];
      var testo = nodo.nodeValue;
      numero.lastIndex = 0;
      if (!numero.test(testo)) continue;
      numero.lastIndex = 0;

      var frammento = document.createDocumentFragment();
      var ultimo = 0;
      var m;

      while ((m = numero.exec(testo)) !== null) {
        var grezzo = m[0];
        var idx = m.index;
        var assoluto = inizi[i] + idx;
        var valore = parseFloat(grezzo.replace(/\./g, "").replace(",", "."));

        if (idx > ultimo) {
          frammento.appendChild(
            document.createTextNode(testo.slice(ultimo, idx)),
          );
        }

        if (!isFinite(valore) || valore <= 0) {
          frammento.appendChild(document.createTextNode(grezzo));
        } else {
          var decimali = m[2] ? m[2].length - 1 : 0;
          var span = document.createElement("span");
          span.className =
            vuoleValore && assoluto === posValore ? "num" : "num-anim";
          span.textContent = formattaNumero(0, decimali);
          frammento.appendChild(span);
          daContare.push({ span: span, valore: valore, decimali: decimali });
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

    var elementi = (radice || document).querySelectorAll(
      ".misuracolore:not([data-contato]):not([data-osservato])," +
        ".anima-numero:not([data-contato]):not([data-osservato])," +
        "td:not([data-contato]):not([data-osservato])," +
        ".bici-card__spec-value:not([data-contato]):not([data-osservato])",
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
  // 4. Entrata scaglionata dei contenuti creati da JavaScript
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
  // 5. Avvio
  // ---------------------------------------------------------
  function avvia() {
    document.documentElement.classList.add("motion-ready");
    barraAvanzamento();
    tornaSu();
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
