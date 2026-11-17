// azzera.js — I pulsanti "Reset": solo pulsanti, solo ricerca, entrambi.

export function azzera() {
  return `<div class="classifica-reset" role="group" aria-label="Azzera i filtri di questa scheda">
                <span class="classifica-reset__etichetta">Reset</span>
                <button type="button" class="classifica-range__reset" data-azione="reset-filtri" title="Azzera solo i pulsanti: ordine, chilometri e scelte Anno/Stagione/Mese. Il testo cercato resta.">Solo pulsanti</button>
                <button type="button" class="classifica-range__reset" data-azione="reset-ricerca" title="Svuota solo il campo Cerca. Pulsanti e chilometri restano.">Solo ricerca</button>
                <button type="button" class="classifica-range__reset classifica-range__reset--tutto" data-azione="reset-tutto" title="Azzera pulsanti e ricerca insieme.">Entrambi</button>
              </div>`;
}
