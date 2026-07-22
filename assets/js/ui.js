// ============================================================
// ui.js — Rifiniture condivise dell'interfaccia
// Nessuna dipendenza. Incluso in tutte le pagine con defer.
// ============================================================

(function () {
  "use strict";

  // Anno corrente nel piè di pagina
  function annoCorrente() {
    document.querySelectorAll("[data-anno]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
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
  function segnaPaginaAttiva() {
    var corrente = window.location.pathname.split("/").pop() || "Giri.html";
    document.querySelectorAll(".Icons a").forEach(function (link) {
      var href = (link.getAttribute("href") || "").split("/").pop();
      if (href && href === corrente) {
        link.setAttribute("aria-current", "page");
        link.style.background = "var(--a-soft)";
      }
    });
  }

  // Apre le foto della galleria (.shot) a grandezza piena invece di scaricarle
  function abilitaLightbox() {
    var link = document.querySelectorAll("a.shot");
    if (!link.length) return;

    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML =
      '<button class="lightbox-chiudi" type="button" aria-label="Chiudi foto">&times;</button>' +
      '<img class="lightbox-img" alt="" />' +
      '<a class="lightbox-scarica" download rel="noopener">Scarica la foto</a>';
    document.body.appendChild(overlay);

    var img = overlay.querySelector(".lightbox-img");
    var scarica = overlay.querySelector(".lightbox-scarica");
    var chiudiBtn = overlay.querySelector(".lightbox-chiudi");
    var ultimoFocus = null;

    function apri(a) {
      var immagine = a.querySelector("img");
      var href = a.getAttribute("href");
      ultimoFocus = document.activeElement;
      img.src = href;
      img.alt = immagine ? immagine.alt || "" : "";
      scarica.href = href;
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

    link.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        apri(a);
      });
    });

    chiudiBtn.addEventListener("click", chiudi);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) chiudi();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-aperta")) {
        chiudi();
      }
    });
  }

  function avvia() {
    annoCorrente();
    rivelaAlloScroll();
    escChiudeMenu();
    segnaPaginaAttiva();
    abilitaLightbox();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})();
