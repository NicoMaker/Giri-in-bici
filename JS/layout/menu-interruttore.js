// ============================================================
// Hamburger.js — Apertura del menu laterale e scorciatoie contatti
// Sicuro anche sulle pagine senza menu.
// ============================================================

(function () {
  "use strict";

  const menu = document.querySelector(".menu"),
    hamburger = document.querySelector(".hamburger");

  function toggleMenu() {
    if (!menu || !hamburger) return;

    const aperto = menu.classList.toggle("showMenu");
    hamburger.classList.toggle("closeIcon", aperto);
    hamburger.setAttribute("aria-expanded", aperto ? "true" : "false");
    hamburger.setAttribute(
      "aria-label",
      aperto ? "Chiudi il menu" : "Apri il menu",
    );

    // Il campo di ricerca NON viene messo a fuoco automaticamente:
    // altrimenti su telefono si apriva subito la tastiera.
    if (!aperto) {
      const campo = menu.querySelector("input");
      if (campo && document.activeElement === campo) campo.blur();
      hamburger.focus();
    }
  }

  if (hamburger && menu) {
    // Segnala alla pagina che c'è l'hamburger fisso, così la barra
    // in alto gli lascia il posto e non finisce sopra "Stagioni".
    document.body.classList.add("con-hamburger");

    hamburger.setAttribute("aria-expanded", "false");
    hamburger.addEventListener("click", toggleMenu);

    // Un clic fuori dal pannello lo richiude
    document.addEventListener("click", function (e) {
      if (!menu.classList.contains("showMenu")) return;
      if (menu.contains(e.target) || hamburger.contains(e.target)) return;
      toggleMenu();
    });

    // Esc chiude il pannello
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (!menu.classList.contains("showMenu")) return;
      toggleMenu();
    });
  }

  window.toggleMenu = toggleMenu;
})();

// ---------- Contatti ----------

function contactEmail(indirizzo, oggettoSito) {
  const soggetto = `info sul sito ${oggettoSito}`;
  window.location.href = `mailto:${indirizzo}?subject=${encodeURIComponent(soggetto)}`;
}

const contactell = () => (window.location.href = "tel:+393337024320");

const openWhatsAppChat = () => {
  const numero = "+393337024320",
    messaggio = encodeURIComponent("*Info sul sito Giri in Bici*");
  window.location.href = `https://wa.me/${numero}?text=${messaggio}`;
};
