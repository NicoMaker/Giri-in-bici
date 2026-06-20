// Menu.js
// Genera il menu laterale (hamburger) leggendo JS/Menu.json,
// con ricerca dal vivo. Sostituisce la vecchia versione basata
// su Alpine.js con semplice JavaScript senza dipendenze esterne.

let menuItems = [];

function renderMenuItems(items) {
  const list = document.getElementById("menuList");
  const noResults = document.getElementById("menuNoResults");
  if (!list) return;

  if (items.length === 0) {
    list.innerHTML = "";
    if (noResults) noResults.style.display = "block";
    return;
  }

  if (noResults) noResults.style.display = "none";

  list.innerHTML = items
    .map((item) => {
      const isLogo = item.name === "Apertura Account GitHub";
      const imgClass = isLogo ? ' class="logo"' : "";

      if (item.name === "Pagina Precedente" && item.link === "#") {
        return `
          <li>
            <button type="button" onclick="history.back()">
              <img src="${item.icon}"${imgClass} alt="" />
              <span>${item.name}</span>
            </button>
          </li>
        `;
      }

      const target = item.link.startsWith("http") ? ' target="_blank"' : "";
      return `
        <li>
          <a href="${item.link}"${target}>
            <img src="${item.icon}"${imgClass} alt="" />
            ${item.name}
          </a>
        </li>
      `;
    })
    .join("");
}

function filterMenu(search) {
  const term = search.toLowerCase();
  return menuItems.filter((item) =>
    item.name.toLowerCase().startsWith(term),
  );
}

async function initMenu() {
  try {
    const response = await fetch("JS/Menu.json");
    const data = await response.json();
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
