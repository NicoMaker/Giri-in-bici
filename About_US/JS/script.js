// ============================================================
// script.js — Avvio della pagina Informazioni
//
// Solo l'avvio. Le funzionalita' stanno in About_US/JS/script/:
//   footer.js       data di oggi nel pie' di pagina
//   rivelazione.js  comparsa dei blocchi allo scroll
//   scorrimento.js  scorrimento morbido sui link interni
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  updateFooter();
  scheduleMidnightUpdate();
  initReveal();
});
