// ============================================================
// ui.js — Rifiniture condivise dell'interfaccia
// Nessuna dipendenza. Incluso in tutte le pagine con defer.
// ============================================================

(function () {
  "use strict";

  // Anno corrente nel piè di pagina
  function annoCorrente() {
    var elementi = document.querySelectorAll("[data-anno]");
    if (!elementi.length) return;

    // Imposta l'anno e programma il prossimo aggiornamento
    function impostaAnno() {
      var adesso = new Date();
      var anno = adesso.getFullYear();
      elementi.forEach(function (el) {
        el.textContent = anno;
      });

      // Calcola il prossimo mezzanotte (inizio del giorno successivo)
      var prossimaMezzanotte = new Date(adesso);
      prossimaMezzanotte.setDate(adesso.getDate() + 1);
      prossimaMezzanotte.setHours(0, 0, 0, 0);
      var millisecondiMancanti = prossimaMezzanotte - adesso;

      // Schedula l'aggiornamento al prossimo scoccare delle 00:00
      setTimeout(function () {
        impostaAnno(); // richiama se stesso ricorsivamente
      }, millisecondiMancanti);
    }

    impostaAnno();
  }

  // Comparsa graduale dei blocchi al primo scroll
  function rivelaAlloScroll() {
    var blocchi = document.querySelectorAll(".reveal");
    if (!blocchi.length) return;

    var motoRidotto = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motoRidotto.matches || !("IntersectionObserver" in window)) {
      blocchi.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var osservatore = new IntersectionObserver(
      function (voci) {
        voci.forEach(function (voce) {
          if (voce.isIntersecting) {
            voce.target.classList.add("is-visible");
            osservatore.unobserve(voce.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    blocchi.forEach(function (el) {
      osservatore.observe(el);
    });

    // Rete di sicurezza: nulla resta invisibile se qualcosa va storto
    setTimeout(function () {
      blocchi.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }, 3000);
  }

  // Il tasto Esc chiude il menu laterale
  function escChiudeMenu() {
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var menu = document.querySelector(".menu.showMenu");
      if (!menu) return;
      var hamburger = document.querySelector(".hamburger");
      if (hamburger) hamburger.click();
    });
  }

  // Evidenzia nella barra la pagina in cui ci si trova
  // Riduce qualsiasi indirizzo alla stessa forma, cosi' il confronto
  // funziona con link relativi, maiuscole diverse, "/" finale
  // e indirizzi puliti senza estensione (es. /Giri invece di /Giri.html).
  function percorsoNormalizzato(indirizzo) {
    var percorso;
    try {
      percorso = new URL(indirizzo, window.location.href).pathname;
    } catch (e) {
      return "";
    }
    try {
      percorso = decodeURIComponent(percorso);
    } catch (e) {
      /* indirizzo gia' leggibile */
    }
    percorso = percorso.toLowerCase();
    if (percorso.charAt(percorso.length - 1) === "/") percorso += "index.html";
    if (!/\.[a-z0-9]+$/.test(percorso)) percorso += ".html";
    return percorso;
  }

  // Le icone della barra passano da PNG neri a disegni a tratto:
  // essendo fatti di linee, prendono il colore del collegamento
  // (currentColor) e quindi si accendono da soli sulla pagina
  // attuale e restano leggibili anche in tema scuro.
  var DA_PNG_A_ICONA = {
    "home.png": "casa",
    "primavera.png": "primavera",
    "estate.png": "estate",
    "inverno.png": "inverno",
    "statistiche.png": "statistiche",
    "bici.png": "bici",
    "informazioni.png": "informazioni",
    "login.png": "accesso",
    "freccia.png": "indietro",
    "qr_code.png": "qr",
    "github.png": "codice",
  };

  function icoDisegnate() {
    if (!window.Icone) return; // senza icone.js restano i PNG di prima
    document.querySelectorAll(".Icons a img").forEach(function (img) {
      var file = (img.getAttribute("src") || "").split("/").pop().toLowerCase();
      var markup = window.Icone.svg(DA_PNG_A_ICONA[file]);
      if (!markup || !img.parentNode) return;

      var contenitore = document.createElement("span");
      contenitore.className = "ico-nav";
      contenitore.innerHTML = markup;
      img.parentNode.replaceChild(contenitore, img);
    });
  }

  function accendiIcona(link) {
    link.setAttribute("aria-current", "page");
    link.classList.add("is-attivo");
  }

  function segnaPaginaAttiva() {
    var link = document.querySelectorAll(".Icons a");
    if (!link.length) return;

    var corrente = percorsoNormalizzato(window.location.href);
    var eraCartella = /\/$/.test(window.location.pathname);
    var trovata = false;

    link.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#") return;
      if (percorsoNormalizzato(href) === corrente) {
        accendiIcona(a);
        trovata = true;
      }
    });

    // Se si apre la radice del sito e li' non c'e' index.html,
    // la pagina mostrata e' la home: accendiamo la casetta.
    if (trovata || !eraCartella) return;
    link.forEach(function (a) {
      var href = percorsoNormalizzato(a.getAttribute("href") || "");
      if (href.split("/").pop() === "giri.html") accendiIcona(a);
    });
  }

  // Apre le foto della galleria (.shot) a grandezza piena invece di scaricarle.
  // Le frecce scorrono tutte le foto del periodo in modo circolare: dopo
  // l'ultima si torna alla prima, prima della prima si va all'ultima.
  function abilitaLightbox() {
    var link = Array.prototype.slice.call(document.querySelectorAll("a.shot"));
    if (!link.length) return;

    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML =
      '<button class="lightbox-chiudi" type="button" aria-label="Chiudi foto">&times;</button>' +
      '<span class="lightbox-conta" aria-live="polite"></span>' +
      '<button class="lightbox-freccia lightbox-freccia--prec" type="button" aria-label="Foto precedente">&#10094;</button>' +
      '<img class="lightbox-img" alt="" />' +
      '<button class="lightbox-freccia lightbox-freccia--succ" type="button" aria-label="Foto successiva">&#10095;</button>' +
      '<a class="lightbox-scarica" download rel="noopener">Scarica la foto</a>';
    document.body.appendChild(overlay);

    var img = overlay.querySelector(".lightbox-img");
    var scarica = overlay.querySelector(".lightbox-scarica");
    var conta = overlay.querySelector(".lightbox-conta");
    var chiudiBtn = overlay.querySelector(".lightbox-chiudi");
    var precBtn = overlay.querySelector(".lightbox-freccia--prec");
    var succBtn = overlay.querySelector(".lightbox-freccia--succ");
    var indice = 0;
    var ultimoFocus = null;

    // Con una foto sola frecce e contatore non servono
    if (link.length < 2) {
      precBtn.hidden = true;
      succBtn.hidden = true;
      conta.hidden = true;
    }

    // Riporta sempre l'indice dentro l'elenco: -1 diventa l'ultima foto,
    // il numero oltre l'ultima torna alla prima. È qui che sta il giro.
    function normalizza(i) {
      var totale = link.length;
      return ((i % totale) + totale) % totale;
    }

    function mostra(i) {
      indice = normalizza(i);

      var a = link[indice];
      var interna = a.querySelector("img");
      var href = a.getAttribute("href");

      img.src = href;
      img.alt = interna ? interna.alt || "" : "";
      scarica.href = href;
      conta.textContent = indice + 1 + " / " + link.length;
    }

    function precedente() {
      mostra(indice - 1);
    }

    function successiva() {
      mostra(indice + 1);
    }

    function apri(i) {
      ultimoFocus = document.activeElement;
      mostra(i);
      overlay.classList.add("is-aperta");
      document.body.style.overflow = "hidden";
      chiudiBtn.focus();
    }

    function chiudi() {
      overlay.classList.remove("is-aperta");
      document.body.style.overflow = "";
      img.src = "";
      if (ultimoFocus && typeof ultimoFocus.focus === "function") {
        ultimoFocus.focus();
      }
    }

    link.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        apri(i);
      });
    });

    chiudiBtn.addEventListener("click", chiudi);
    precBtn.addEventListener("click", precedente);
    succBtn.addEventListener("click", successiva);

    // Il click sullo sfondo chiude, quello sulle frecce no
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) chiudi();
    });

    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("is-aperta")) return;
      if (e.key === "Escape") chiudi();
      if (link.length < 2) return;
      if (e.key === "ArrowLeft") precedente();
      if (e.key === "ArrowRight") successiva();
    });

    // Scorrimento con il dito su telefono e tablet
    var partenzaX = null;
    overlay.addEventListener(
      "touchstart",
      function (e) {
        partenzaX = e.changedTouches[0].clientX;
      },
      { passive: true },
    );

    overlay.addEventListener(
      "touchend",
      function (e) {
        if (partenzaX === null || link.length < 2) return;
        var spostamento = e.changedTouches[0].clientX - partenzaX;
        partenzaX = null;
        if (Math.abs(spostamento) < 45) return;
        if (spostamento > 0) precedente();
        else successiva();
      },
      { passive: true },
    );
  }

  function avvia() {
    annoCorrente();
    rivelaAlloScroll();
    escChiudeMenu();
    icoDisegnate();
    segnaPaginaAttiva();
    abilitaLightbox();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})();
