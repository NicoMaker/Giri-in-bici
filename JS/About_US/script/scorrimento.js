// ============================================================
// scorrimento.js — Scorrimento morbido verso i collegamenti interni
// Richiamato da About_US/JS/script.js
// ============================================================

// Scorrimento morbido per i collegamenti interni
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || !href.startsWith("#")) return;

  const target = document.querySelector(href);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
