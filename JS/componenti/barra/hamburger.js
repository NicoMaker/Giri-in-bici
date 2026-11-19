// hamburger.js — Il pulsante hamburger che apre il menu a tendina (su tutte le pagine).

export const hamburger = () =>
  `<button class="hamburger" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="menu-sito"><i class="MenuIcon"><span data-icona="menu"></span></i><i class="CloseIcon"><span data-icona="chiudi"></span></i></button>`;

// Pulsante che apre il modale "Mappa del sito" (vedi ../mappa/mappa.js)
export const pulsanteMappa = () =>
  `<button class="btn-mappa" type="button" data-apri-mappa aria-label="Apri la mappa del sito" title="Mappa del sito"><span data-icona="mappa"></span></button>`;
