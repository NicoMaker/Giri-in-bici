// ============================================================
// schede.js — HTML delle bici e delle intestazioni illustrate
//
// Costruisce il markup e basta: non tocca la pagina e non decide
// cosa mostrare. Legge i dati da Bici.dati, riempito da ScriptBici.js.
// ============================================================

window.Bici = window.Bici || {};

(function (B) {
  "use strict";

  B.ETICHETTE_TIPO = { mtb: "Mountain bike", corsa: "Bici da corsa" };

  // Riga di intestazioni AI per la categoria selezionata (3 per riga).
  // Con "tutte" uniamo le gallerie di mtb e corsa cosi' si vedono tutte
  // le immagini celebrative, non solo quelle di una categoria.
  B.renderIntestazioni = function (tipo) {
    const data = B.dati;
    const immagini =
      tipo === "tutte"
        ? [...(data.intestazioni.mtb || []), ...(data.intestazioni.corsa || [])]
        : data.intestazioni[tipo];
    if (!immagini || !immagini.length) return "";
    return `
          <div class="bici-hero-row">
            ${immagini.map((img) => `<img src="${img}" alt="" loading="lazy" />`).join("")}
          </div>`;
  };

  // Una singola card scheda tecnica
  B.renderCard = function (bici) {
    const rapportoTotale = bici.avanti * bici.dietro;
    return `
          <article class="bici-card">
            <div class="bici-card__media">
              <img src="${bici.immagine}" alt="${bici.nome}" loading="lazy" />
              <span class="bici-card__anno">${bici.anno}</span>
            </div>
            <div class="bici-card__body">
              <h3 class="bici-card__nome">${bici.nome}</h3>
              <span class="bici-card__tipo">${B.ETICHETTE_TIPO[bici.tipo] || bici.tipo}</span>
              <ul class="bici-card__specs">
                <li class="bici-card__spec">
                  <span class="material-icons">adjust</span>
                  <span class="bici-card__spec-text">
                    <span class="bici-card__spec-label">Freni</span>
                    <span class="bici-card__spec-value">${bici.tipo_freni}</span>
                  </span>
                </li>
                <li class="bici-card__spec">
                  <span class="material-icons">construction</span>
                  <span class="bici-card__spec-text">
                    <span class="bici-card__spec-label">Materiale</span>
                    <span class="bici-card__spec-value">${bici.materiale}</span>
                  </span>
                </li>
                <li class="bici-card__spec">
                  <span class="material-icons">circle</span>
                  <span class="bici-card__spec-text">
                    <span class="bici-card__spec-label">Ruote</span>
                    <span class="bici-card__spec-value">${bici.misura_ruote}"</span>
                  </span>
                </li>
                <li class="bici-card__spec">
                  <span class="material-icons">event</span>
                  <span class="bici-card__spec-text">
                    <span class="bici-card__spec-label">Anno</span>
                    <span class="bici-card__spec-value">${bici.anno}</span>
                  </span>
                </li>
                <li class="bici-card__spec bici-card__spec--wide">
                  <span class="material-icons">settings</span>
                  <span class="bici-card__spec-text">
                    <span class="bici-card__spec-label">Cambio</span>
                    <span class="bici-card__spec-value">${bici.avanti} avanti &times; ${bici.dietro} dietro &mdash; ${rapportoTotale} rapporti totali</span>
                  </span>
                </li>
              </ul>
            </div>
          </article>`;
  };
})(window.Bici);
