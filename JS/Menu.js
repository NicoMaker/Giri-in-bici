// Menu.js
// Genera il menu laterale (hamburger) leggendo JS/Menu.json,
// con ricerca dal vivo. Nessuna dipendenza esterna.
// La voce "Pagina Precedente" usa href="javascript:history.back()"
// e non può essere deviata da altri eventi.

let menuItems = [];

/**
 * Restituisce il codice HTML per l'icona di una voce.
 * Supporto:
 * - percorso diretto a file .svg (campo "icona")
 * - chiave simbolica per window.Icone.svg()
 * - immagine PNG/JPG di fallback (campo "icon")
 */
function iconaVoce(item) {
  // 1) Se "icona" è un percorso che termina con .svg
  if (item.icona && item.icona.endsWith('.svg')) {
    return `<span class="ico-tile"><img src="${item.icona}" alt="" /></span>`;
  }

  // 2) Prova a usare window.Icone (se definito)
  let svg = '';
  if (item.icona && window.Icone && typeof window.Icone.svg === 'function') {
    svg = window.Icone.svg(item.icona) || '';
  }
  if (svg) {
    return `<span class="ico-tile">${svg}</span>`;
  }

  // 3) Fallback: immagine PNG/JPG
  const isLogo = item.name === 'Apertura Account GitHub';
  const classe = isLogo ? ' class="logo"' : '';
  return `<span class="ico-tile"><img src="${item.icon}"${classe} alt="" /></span>`;
}

/**
 * Renderizza la lista delle voci nel DOM.
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

      // CASO SPECIALE: "Pagina Precedente"
      // Usa href="javascript:history.back()" con onclick="return false;"
      // per evitare qualsiasi comportamento indesiderato.
      if (item.name.trim() === 'Pagina Precedente' && item.link === '#') {
        return `
          <li>
            <a href="javascript:history.back()" onclick="return false;" class="menu-back">
              ${icona}
              <span>${item.name}</span>
            </a>
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
 */
function filterMenu(search) {
  const term = search.toLowerCase();
  return menuItems.filter(item => item.name.toLowerCase().startsWith(term));
}

/**
 * Inizializza il menu: carica il JSON, ordina le voci, attiva la ricerca.
 */
async function initMenu() {
  try {
    const response = await fetch('JS/Menu.json');
    const data = await response.json();
    menuItems = [...data.items].sort((a, b) => a.name.localeCompare(b.name));
    renderMenuItems(menuItems);
  } catch (error) {
    console.error('Errore nel caricamento del menu:', error);
  }

  const searchInput = document.getElementById('menuSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderMenuItems(filterMenu(e.target.value));
    });
  }
}

document.addEventListener('DOMContentLoaded', initMenu);