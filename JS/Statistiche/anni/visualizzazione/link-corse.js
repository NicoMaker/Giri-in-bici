// ============================================================
// link-corse.js — Dalla pagina di un anno alle sue corse
//
// In ogni pagina Statistiche/Anni/<anno>.html aggiunge, in fondo,
// il riquadro "Le corse del <anno>" con il pulsante che apre
// CorsePerAnno.html gia' impostata su quell'anno:
//
//   CorsePerAnno.html?anno=<anno>
//
// L'anno si ricava da solo dal file JSON della pagina (il div
// #json con link="json/Statistiche/anni/<anno>.json"), quindi
// quando si crea un nuovo anno copiando una pagina esistente il
// link giusto compare in automatico: non c'e' niente da scrivere.
//
// Dipende da: niente (usa solo il DOM). Va incluso con "defer".
// ============================================================

(function () {
  "use strict";

  function annoDellaPagina() {
    var json = document.getElementById("json");
    var sorgente =
      (json && json.getAttribute("link")) || window.location.pathname;
    var trovato = String(sorgente).match(
      /(\d{4})(?:\.json|\.html)?(?:[?#].*)?$/,
    );
    return trovato ? trovato[1] : null;
  }

  function crea() {
    var main = document.querySelector("main");
    var anno = annoDellaPagina();
    if (!main || !anno || document.getElementById("linkCorseAnno")) return;

    var sezione = document.createElement("section");
    sezione.className = "section";
    sezione.id = "linkCorseAnno";

    var eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Diario";

    var titolo = document.createElement("h2");
    titolo.textContent = "Le corse del " + anno;

    var testo = document.createElement("p");
    testo.className = "hero-sub";
    testo.textContent =
      "Tutte le uscite del " +
      anno +
      ", da Gennaio a Dicembre, con ricerca per posto, intervallo di date e stagione.";

    var wrap = document.createElement("div");
    wrap.className = "cta-classifica-wrap";

    var link = document.createElement("a");
    link.className = "cta-classifica";
    link.href = "../../CorsePerAnno.html?anno=" + anno;
    link.textContent = "Vedi le corse del " + anno;
    wrap.appendChild(link);

    sezione.appendChild(eyebrow);
    sezione.appendChild(titolo);
    sezione.appendChild(testo);
    sezione.appendChild(wrap);
    main.appendChild(sezione);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", crea);
  } else {
    crea();
  }
})();
