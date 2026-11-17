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
// Poi è l'indirizzo a seguire la scheda scelta (vedi stato-url.js).
//
// Dipende da: nucleo/stato-url.js (da caricare prima).
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

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
    // nativo (vedi css/Statistiche/classifiche/selettore-metrica.css): stessa
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

      // Nella barra in alto: dove si trova l'utente ("Classifica › Giri").
      const posizione = document.getElementById("posizione-vista");
      const attivo = Array.from(pulsantiVista).find(
        (p) => p.dataset.vista === vista,
      );
      if (posizione && attivo) {
        const nome = attivo.textContent.trim();
        posizione.textContent = nome;
        document.title = `${nome} · Classifica | Giri in Bici`;
      }
    }

    // Scheda di apertura: "?vista=" se valido, altrimenti "mesi" (la
    // decide stato-url.js, che poi tiene l'indirizzo allineato).
    attivaVista(CM.statoUrl.vistaIniziale());

    // Il browser (indietro/avanti, ricarica, tocco su un link alla stessa
    // pagina) puo' rimettere nel select mobile l'ultima scelta fatta,
    // per esempio "Anni", dopo che la pagina e' gia' partita: la scheda
    // mostrata resta quella giusta ma il menu dice un'altra cosa. Si
    // riallinea al caricamento completo e quando la pagina torna visibile.
    function riallinea() {
      const vista = CM.statoUrl.vistaAttiva();
      if (selettoreMobile && selettoreMobile.value !== vista) {
        selettoreMobile.value = vista;
      }
    }
    window.addEventListener("load", riallinea);
    window.addEventListener("pageshow", riallinea);

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
