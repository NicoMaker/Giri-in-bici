// ============================================================
// parallasse.js — Leggero effetto di profondità allo scroll
//
// Ogni elemento con [data-parallasse="velocita"] si sposta un po'
// più lento (o più veloce) del resto della pagina mentre si scorre,
// dando un effetto di profondità tipico dei siti moderni. La
// velocità è un numero piccolo (es. 0.12): più alto = si muove di
// più. Applicato al CONTENITORE attorno all'immagine, non
// all'immagine stessa, così non entra in conflitto con l'animazione
// di galleggiamento già su .immagini_stagione (animazioni-extra.css).
//
// Nessuna dipendenza. Rispetta prefers-reduced-motion (in quel caso
// non fa nulla, gli elementi restano fermi come sempre).
// ============================================================

(() => {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const elementi = document.querySelectorAll("[data-parallasse]");
  if (!elementi.length) return;

  const lista = Array.prototype.map.call(elementi, (el) => ({
    elemento: el,
    velocita: parseFloat(el.dataset.parallasse) || 0.15,
  }));

  let aggiornamentoRichiesto = false;

  const aggiorna = () => {
    aggiornamentoRichiesto = false;
    const vh = window.innerHeight;

    lista.forEach((voce) => {
      const rect = voce.elemento.getBoundingClientRect();
      // Solo se e' (almeno un po') visibile: risparmia calcoli inutili
      // quando la pagina e' scrollata molto piu' in basso o in alto.
      if (rect.bottom < -200 || rect.top > vh + 200) return;

      const centro = rect.top + rect.height / 2;
      const distanzaDalCentro = centro - vh / 2;
      const scostamento = -distanzaDalCentro * voce.velocita;
      voce.elemento.style.transform =
        "translateY(" + scostamento.toFixed(1) + "px)";
    });
  };

  const richiediAggiornamento = () => {
    if (aggiornamentoRichiesto) return;
    aggiornamentoRichiesto = true;
    window.requestAnimationFrame(aggiorna);
  };

  window.addEventListener("scroll", richiediAggiornamento, { passive: true });
  window.addEventListener("resize", richiediAggiornamento);
  aggiorna();
})();
