// ============================================================
// selettore-vista.js — Il selettore in cima alla pagina Classifica
// dei mesi: mostra o nasconde i gruppi [data-vista-gruppo].
//
// Indipendente dal caricamento dei dati: funziona subito, anche se
// i fetch delle altre schede sono ancora in corso o falliscono.
//
// La vista iniziale arriva da "?vista=" nell'indirizzo: ogni pagina
// del sito che porta qui sceglie già la scheda giusta (es. dalla
// pagina di una stagione arriva "?vista=stagioni"). Senza il
// parametro, o con un valore che non esiste, si parte da "mesi".
//
// Nessuna dipendenza.
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  const VISTE_VALIDE = [
    "mesi",
    "record",
    "anni",
    "stagioni",
    "periodi",
    "tappe",
  ];

  // Scorre fino all'inizio della PAGINA (non solo del contenuto della
  // scheda): toccando una pillola mentre si è più in basso — magari in
  // fondo alla classifica completa di un'altra scheda — deve sempre
  // riportare all'inizio della pagina, come un arrivo da capo.
  function scorriAllInizioPagina() {
    const motoRidotto = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: motoRidotto ? "auto" : "smooth" });
    });
  }

  CM.avviaSelettoreVista = function () {
    const gruppiVista = document.querySelectorAll("[data-vista-gruppo]");
    const pulsantiVista = document.querySelectorAll(
      "#selettore-vista .selettore-metrica__pulsante",
    );
    // Su schermi stretti le pillole lasciano il posto a questo select
    // nativo (vedi css/Statistiche/selettore-metrica.css): stessa
    // scelta, resa come menu a tendina invece che come fila di pulsanti.
    const selettoreMobile = document.getElementById("selettore-vista-mobile");

    function attivaVista(vista) {
      pulsantiVista.forEach((p) =>
        p.classList.toggle("attivo", p.dataset.vista === vista),
      );
      gruppiVista.forEach((gruppo) => {
        gruppo.style.display =
          gruppo.dataset.vistaGruppo === vista ? "" : "none";
      });
      if (selettoreMobile) selettoreMobile.value = vista;
    }

    const vistaIniziale = new URLSearchParams(window.location.search).get(
      "vista",
    );
    attivaVista(VISTE_VALIDE.includes(vistaIniziale) ? vistaIniziale : "mesi");

    // Chi arriva da un link con "?vista=" (es. da una pagina-stagione)
    // vede già la scheda giusta selezionata in cima, ma la pagina resta
    // ferma in cima: si arriva sempre dall'inizio (intestazione e
    // pillole comprese), non già scorsi in mezzo al contenuto. Solo il
    // cambio scheda FATTO A MANO (pillola o select, qui sotto) scorre:
    // qui all'arrivo no.

    // Cambio scheda manuale (pillola o select mobile): qui invece lo
    // scorrimento resta utile — si sta già leggendo qualcos'altro,
    // magari molto più in basso (es. in fondo alla classifica completa
    // di un'altra scheda) e toccare una pillola deve riportare
    // all'inizio della pagina, non lasciare a metà pagina un pezzo a
    // caso della scheda nuova.
    pulsantiVista.forEach((pulsante) => {
      pulsante.addEventListener("click", () => {
        attivaVista(pulsante.dataset.vista);
        scorriAllInizioPagina();
      });
    });

    if (selettoreMobile) {
      selettoreMobile.addEventListener("change", () => {
        attivaVista(selettoreMobile.value);
        scorriAllInizioPagina();
      });
    }
  };
})(window.ClassificaMesi);
