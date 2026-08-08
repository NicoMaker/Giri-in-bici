// ============================================================
// tema-scuro.js — Tema chiaro/scuro con interruttore
//
// Va inserito come PRIMO (o tra i primi) script della pagina,
// SENZA "defer", cosi' il tema giusto viene applicato prima che
// il browser disegni qualsiasi cosa: niente lampeggio del tema
// sbagliato per una frazione di secondo al caricamento.
//
// Il tema scelto (chiaro/scuro) viene ricordato in localStorage,
// quindi vale su tutte le pagine del sito. Se non e' mai stato
// scelto nulla, si parte dal tema chiaro (il sito NON segue in
// automatico il tema del sistema operativo: solo il pulsante lo
// puo' cambiare, cosi' l'aspetto resta prevedibile).
//
// Ogni pulsante con classe "tema-toggle" presente nella pagina
// lo cambia al click.
// ============================================================

(function () {
  const CHIAVE = "temaSito";

  function temaSalvato() {
    const valore = localStorage.getItem(CHIAVE);
    return valore === "scuro" || valore === "chiaro" ? valore : "chiaro";
  }

  function applicaTema(tema) {
    document.documentElement.setAttribute(
      "data-theme",
      tema === "scuro" ? "dark" : "light",
    );
  }

  // Applicato subito, prima che il resto della pagina venga disegnato
  applicaTema(temaSalvato());

  function aggiornaPulsanti() {
    const scuro =
      document.documentElement.getAttribute("data-theme") === "dark";
    document.querySelectorAll(".tema-toggle").forEach((bottone) => {
      bottone.setAttribute("aria-pressed", String(scuro));
      bottone.setAttribute(
        "aria-label",
        scuro ? "Passa al tema chiaro" : "Passa al tema scuro",
      );
      bottone.title = scuro ? "Passa al tema chiaro" : "Passa al tema scuro";
    });
  }

  // Espone il cambio tema cosi' da poterlo richiamare anche da altri
  // script, se mai servisse (es. una voce nel menu laterale)
  window.cambiaTemaSito = function () {
    const attuale = document.documentElement.getAttribute("data-theme");
    const nuovo = attuale === "dark" ? "chiaro" : "scuro";
    applicaTema(nuovo);
    localStorage.setItem(CHIAVE, nuovo);
    aggiornaPulsanti();
  };

  function inizializza() {
    aggiornaPulsanti();
    document.querySelectorAll(".tema-toggle").forEach((bottone) => {
      bottone.addEventListener("click", window.cambiaTemaSito);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inizializza);
  } else {
    inizializza();
  }
})();
