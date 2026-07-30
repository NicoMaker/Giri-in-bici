// ============================================================
// Menu.js — Avvio del menu laterale (hamburger)
//
// Carica JS/Menu.json, ordina le voci e collega la ricerca.
// I pezzi stanno in JS/Menu/:
//   voci.js     icona e HTML di ogni voce
//   ricerca.js  filtro mentre si scrive
//
// La voce "Pagina Precedente" usa href="javascript:history.back()"
// e non puo' essere deviata da altri eventi.
// ============================================================

let menuItems = [];

/**
 * Inizializza il menu: carica il JSON, ordina le voci, attiva la ricerca.
 */
async function initMenu() {
  try {
    const data = await Json.leggi("json/Menu.json");
    menuItems = [...data.items].sort((a, b) => a.name.localeCompare(b.name));
    renderMenuItems(menuItems);
  } catch (error) {
    console.error("Errore nel caricamento del menu:", error);
  }

  const searchInput = document.getElementById("menuSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderMenuItems(filterMenu(e.target.value));
    });
  }
}

document.addEventListener("DOMContentLoaded", initMenu);
