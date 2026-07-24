// ============================================================
// ricerca.js — Filtra le voci mentre si scrive
// Richiamato da JS/Menu.js
// ============================================================

/**
 * Filtra le voci in base al testo di ricerca (case‑insensitive, prefix match).
 */
function filterMenu(search) {
  const term = search.toLowerCase();
  return menuItems.filter((item) => item.name.toLowerCase().startsWith(term));
}
