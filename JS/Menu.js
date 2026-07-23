// Menu.js
// Genera il menu laterale (hamburger) leggendo JS/Menu.json,
// con ricerca dal vivo. Sostituisce la vecchia versione basata
// su Alpine.js con semplice JavaScript senza dipendenze esterne.

let menuItems = [];

/**
 * Restituisce il codice HTML per l'icona di una voce di menu.
 * Supporta tre modalità (in ordine di priorità):
 * 1. Se il campo "icona" è un percorso che termina con .svg, lo inserisce come <img>.
 * 2. Se esiste window.Icone e il campo "icona" è una chiave valida, usa il relativo SVG inline.
 * 3. Altrimenti usa l'immagine PNG dal campo "icon" (fallback).
 */
function iconaVoce(item) {
  // 1) Se "icona" è un percorso di file SVG (termina con .svg)
  if (item.icona && item.icona.endsWith('.svg')) {
    return `<span class="ico-tile"><img src="${item.icona}" alt="" /></span>`;
  }

  // 2) Tentativo di usare l'oggetto globale Icone (se definito)
  let svg = '';
  if (item.icona && window.Icone && typeof window.Icone.svg === 'function') {
    svg = window.Icone.svg(item.icona) || '';
  }
  if (svg) {
    return `<span class="ico-tile">${svg}</span>`;
  }

  // 3) Fallback: immagine PNG (o JPG) dal campo "icon"
  const isLogo = item.name === "Apertura Account GitHub";
  const classe = isLogo ? ' class="logo"' : '';
  return `<span class="ico-tile"><img src="${item.icon}"${classe} alt="" /></span>`;
}

/**
 * Renderizza la lista di voci nel DOM.
 * @param {Array} items - Array di oggetti voce (già filtrati eventualmente)
 */
function renderMenuItems(items) {
  const list = document.getElementById('menuList');
  const noResults = document.getElementById('menuNoResults');
  if (!list) return;

  if (items.length === 0) {
    list.innerHTML = '';
    if (noResults) noResults.style.display = 'block';
    return;
  }
  if (noResults) noResults.style.display = 'none';

  list.innerHTML = items
    .map((item) => {
      const icona = iconaVoce(item);

      // Caso speciale: "Pagina Precedente" → pulsante che esegue history.back()
      if (item.name === 'Pagina Precedente' && item.link === '#') {
        return `
          <li>
            <button type="button" onclick="history.back()">
              ${icona}
              <span>${item.name}</span>
            </button>
          </li>
        `;
      }

      // Link normale (con target _blank per URL esterne)
      const target = item.link.startsWith('http') ? ' target="_blank"' : '';
      return `
        <li>
          <a href="${item.link}"${target}>
            ${icona}
            <span>${item.name}</span>
          </a>
        </li>
      `;
    })
    .join('');
}

/**
 * Filtra le voci in base al testo di ricerca (case‑insensitive, prefix match).
 * @param {string} search - Termine di ricerca
 * @returns {Array} Voci il cui nome inizia con il termine (ignorando maiuscole/minuscole)
 */
function filterMenu(search) {
  const term = search.toLowerCase();
  return menuItems.filter((item) => item.name.toLowerCase().startsWith(term));
}

/**
 * Inizializza il menu: carica il JSON, ordina le voci, e imposta la ricerca dal vivo.
 */
async function initMenu() {
  try {
    const response = await fetch('JS/Menu.json');
    const data = await response.json();
    // Ordina alfabeticamente per nome (case‑sensitive, ma va bene)
    menuItems = [...data.items].sort((a, b) => a.name.localeCompare(b.name));
    renderMenuItems(menuItems);
  } catch (error) {
    console.error('Errore nel caricamento del menu:', error);
  }

  // Attiva la ricerca in tempo reale
  const searchInput = document.getElementById('menuSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderMenuItems(filterMenu(e.target.value));
    });
  }
}

// Avvia il tutto quando il DOM è pronto
document.addEventListener('DOMContentLoaded', initMenu);