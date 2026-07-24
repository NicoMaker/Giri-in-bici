// ============================================================
// lightbox.js — Ogni foto del sito si apre a grandezza piena
// Frecce, tastiera, scorrimento col dito e scaricamento.
// Stili corrispondenti: assets/css/componenti/lightbox.css
// Nessuna dipendenza.
// ============================================================

(function () {
  "use strict";

  // Foto che si possono aprire. Sono elencate a mano di proposito:
  // cosi' restano fuori le icone della barra, le bandierine, il logo
  // e il traguardo, che sono elementi di interfaccia e non foto.
  var SEL_FOTO = [
    "a.shot", // album dei periodi
    ".bici-card__media img", // foto delle bici
    ".bici-hero-row img", // intestazioni illustrate delle bici
    ".immagini_stagione", // copertine stagione e Madonnina in Bici
    ".immagini_stagione2",
    ".immmaginejnrobot",
    ".immagine_bicisx",
    ".immagine_bicidx",
    ".immagineParticolare",
  ].join(",");

  // Le cartelle Icons/ e assets/img/ contengono l'interfaccia: icone,
  // bandierine, il traguardo, i disegni dei pulsanti. Non sono foto e
  // non devono aprirsi, nemmeno quando finiscono dentro una scheda
  // che per il resto contiene foto (succede in "Informazioni").
  function eUnIcona(el) {
    var src = (el.getAttribute("src") || "").toLowerCase();
    return src.indexOf("/icons/") !== -1 || src.indexOf("assets/img/") !== -1;
  }

  // Contenitori che formano un gruppo: le frecce girano dentro il gruppo,
  // cosi' dalle bici non si finisce in altre foto. Gli avatar del team in
  // "Informazioni" non si aprono piu', quindi .team-grid non serve piu'.
  var SEL_GRUPPO = ".gallery, .bici-grid, .bici-hero-row";

  // Indirizzo e descrizione della foto, sia che sia un link sia un'immagine
  function datiFoto(el) {
    if (el.tagName === "A") {
      var interna = el.querySelector("img");
      return {
        src: el.getAttribute("href"),
        alt: interna ? interna.alt || "" : "",
      };
    }
    return {
      src: el.currentSrc || el.getAttribute("src"),
      alt: el.alt || "",
    };
  }

  // Le foto vicine tra cui scorrere con le frecce
  function gruppoDi(el) {
    var contenitore = el.closest(SEL_GRUPPO);
    if (!contenitore) return [el]; // foto isolata: nessuna freccia
    var vicine = Array.prototype.slice
      .call(contenitore.querySelectorAll(SEL_FOTO))
      .filter(eApribile);
    return vicine.indexOf(el) === -1 ? [el] : vicine;
  }

  // Un'immagine dentro un collegamento resta un collegamento: il click
  // deve portare alla pagina, non aprire la foto. Fa eccezione .shot,
  // che e' proprio il link della galleria.
  function dentroUnLink(el) {
    if (el.tagName === "A") return false;
    var link = el.closest("a");
    return !!link && !link.classList.contains("shot");
  }

  // Vera foto apribile: non un'icona e non dentro un collegamento
  function eApribile(el) {
    return !dentroUnLink(el) && !(el.tagName === "IMG" && eUnIcona(el));
  }

  function abilitaLightbox() {
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

    var gruppo = [];
    var indice = 0;
    var ultimoFocus = null;

    // Riporta sempre l'indice dentro l'elenco: -1 diventa l'ultima foto,
    // il numero oltre l'ultima torna alla prima. E' qui che sta il giro.
    function normalizza(i) {
      var totale = gruppo.length;
      return ((i % totale) + totale) % totale;
    }

    function mostra(i) {
      indice = normalizza(i);
      var dati = datiFoto(gruppo[indice]);

      img.src = dati.src;
      img.alt = dati.alt;
      scarica.href = dati.src;
      conta.textContent = indice + 1 + " / " + gruppo.length;

      // Con una foto sola frecce e contatore non servono
      var unaSola = gruppo.length < 2;
      precBtn.hidden = unaSola;
      succBtn.hidden = unaSola;
      conta.hidden = unaSola;
    }

    function precedente() {
      mostra(indice - 1);
    }

    function successiva() {
      mostra(indice + 1);
    }

    function apri(el) {
      gruppo = gruppoDi(el);
      ultimoFocus = document.activeElement;
      mostra(gruppo.indexOf(el));
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

    function aperta() {
      return overlay.classList.contains("is-aperta");
    }

    // Un solo ascoltatore sul documento: funziona anche per le foto
    // che compaiono dopo, come le schede bici caricate dal JSON.
    document.addEventListener("click", function (e) {
      if (overlay.contains(e.target)) return;
      var el = e.target.closest(SEL_FOTO);
      if (!el || !eApribile(el)) return;
      e.preventDefault();
      apri(el);
    });

    // Stessa cosa da tastiera, per chi non usa il mouse
    document.addEventListener("keydown", function (e) {
      if (aperta()) {
        if (e.key === "Escape") chiudi();
        if (gruppo.length < 2) return;
        if (e.key === "ArrowLeft") precedente();
        if (e.key === "ArrowRight") successiva();
        return;
      }
      if (e.key !== "Enter" && e.key !== " ") return;
      var attivo = document.activeElement;
      if (!attivo || !attivo.closest) return;
      var el = attivo.closest(SEL_FOTO);
      if (!el || !eApribile(el)) return;
      e.preventDefault();
      apri(el);
    });

    chiudiBtn.addEventListener("click", chiudi);
    precBtn.addEventListener("click", precedente);
    succBtn.addEventListener("click", successiva);

    // Il click sullo sfondo chiude, quello sulle frecce no
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) chiudi();
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
        if (partenzaX === null || gruppo.length < 2) return;
        var spostamento = e.changedTouches[0].clientX - partenzaX;
        partenzaX = null;
        if (Math.abs(spostamento) < 45) return;
        if (spostamento > 0) precedente();
        else successiva();
      },
      { passive: true },
    );
  }

  // Rende raggiungibili da tastiera le immagini apribili. Le schede
  // arrivano dal JSON dopo il caricamento, quindi restiamo in ascolto
  // delle nuove immagini inserite nella pagina.
  function rendiFotoRaggiungibili(radice) {
    var nodi = (radice || document).querySelectorAll(SEL_FOTO);
    Array.prototype.forEach.call(nodi, function (el) {
      if (el.tagName === "A" || el.dataset.apribile) return;
      if (!eApribile(el)) return;
      el.dataset.apribile = "1";
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      if (!el.getAttribute("aria-label")) {
        el.setAttribute("aria-label", "Apri la foto a grandezza piena");
      }
    });
  }

  function osservaNuoveFoto() {
    rendiFotoRaggiungibili(document);
    if (!("MutationObserver" in window)) return;
    new MutationObserver(function (modifiche) {
      modifiche.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType === 1) rendiFotoRaggiungibili(n);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  function avvia() {
    abilitaLightbox();
    osservaNuoveFoto();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})();
