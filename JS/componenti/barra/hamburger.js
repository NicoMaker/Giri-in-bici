// hamburger.js — Il pulsante hamburger che apre il menu a tendina (su tutte le pagine).

export function hamburger() {
  return `<button class="hamburger" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="menu-sito"><i class="MenuIcon"><span data-icona="menu"></span></i><i class="CloseIcon"><span data-icona="chiudi"></span></i></button>`;
}
