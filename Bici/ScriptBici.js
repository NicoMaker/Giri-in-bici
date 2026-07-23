document.addEventListener("DOMContentLoaded", function () {
  fetch("bici.json")
    .then((response) => response.json())
    .then((data) => {
      const bici = document.getElementById("StampaBici");

      const ETICHETTE_TIPO = { mtb: "Mountain bike", corsa: "Bici da corsa" };

      // Riga di intestazioni AI per la categoria selezionata (3 per riga).
      // Con "tutte" uniamo le gallerie di mtb e corsa cosi' si vedono tutte
      // le immagini celebrative, non solo quelle di una categoria.
      function renderIntestazioni(tipo) {
        const immagini =
          tipo === "tutte"
            ? [
                ...(data.intestazioni.mtb || []),
                ...(data.intestazioni.corsa || []),
              ]
            : data.intestazioni[tipo];
        if (!immagini || !immagini.length) return "";
        return `
          <div class="bici-hero-row">
            ${immagini.map((img) => `<img src="${img}" alt="" loading="lazy" />`).join("")}
          </div>`;
      }

      // Una singola card scheda tecnica
      function renderCard(bici) {
        const rapportoTotale = bici.avanti * bici.dietro;
        return `
          <article class="bici-card">
            <div class="bici-card__media">
              <img src="${bici.immagine}" alt="${bici.nome}" loading="lazy" />
              <span class="bici-card__anno">${bici.anno}</span>
            </div>
            <div class="bici-card__body">
              <h3 class="bici-card__nome">${bici.nome}</h3>
              <span class="bici-card__tipo">${ETICHETTE_TIPO[bici.tipo] || bici.tipo}</span>
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
      }

      // Mostra solo l'intestazione Home (schermata di benvenuto)
      function mostraHome() {
        bici.innerHTML = `
          <img class="immagini_stagione" src="${data.intestazioni.home}" alt="" />
          <p class="bici-home-frase">
            La Madonnina in Bici ci ricorda perch&eacute; pedaliamo: benessere,
            salute e libert&agrave; a ogni giro di pedale.
          </p>`;
        impostaFiltroAttivo("home");
      }

      // Mostra le bici filtrate per tipo ("mtb", "corsa" o "tutte")
      function mostraBiciFiltrate(tipo) {
        const biciFiltrate =
          tipo === "tutte"
            ? data.bici
            : data.bici.filter((b) => b.tipo === tipo);

        const intestazioni = renderIntestazioni(tipo);

        bici.innerHTML = `
          ${intestazioni}
          <div class="bici-grid">
            ${biciFiltrate.map(renderCard).join("")}
          </div>`;

        impostaFiltroAttivo(tipo);
      }

      // Evidenzia il filtro attivo sia nella barra pillole sia nel menu a comparsa
      function impostaFiltroAttivo(tipo) {
        document.querySelectorAll(".bici-filtro").forEach((btn) => {
          btn.classList.toggle("attivo", btn.dataset.filtro === tipo);
        });
      }

      window.CalcolaMTB = () => mostraBiciFiltrate("mtb");
      window.CalcolaCorsa = () => mostraBiciFiltrate("corsa");
      window.CalcolaTutte = () => mostraBiciFiltrate("tutte");
      window.Home = mostraHome;

      // Collega la barra dei filtri, se presente in pagina
      document.querySelectorAll(".bici-filtro").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tipo = btn.dataset.filtro;
          if (tipo === "home") window.Home();
          else mostraBiciFiltrate(tipo);
        });
      });

      // All'avvio mostra la Madonnina in Bici, non subito tutto il catalogo
      mostraHome();
    })
    .catch((error) => console.error("Errore nel caricamento del JSON:", error));
});
