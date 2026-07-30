// ============================================================
// navigazione.js — Icone della barra e pagina attiva
// Due compiti che guardano gli stessi elementi (.Icons a):
// sostituisce i PNG con i disegni a tratto e accende il
// collegamento della pagina in cui ci si trova.
// Dipende da: assets/js/icone.js (window.Icone), da caricare prima.
// ============================================================

(function () {
  "use strict";

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
  // attuale.
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

  function avvia() {
    icoDisegnate();
    segnaPaginaAttiva();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})();
