// ============================================================
// classifica-controlli.js — Controlli condivisi delle schede della
// pagina Classifica: "Ordine" (dal più al meno pedalato o inverso) e
// "Filtro per km" (da...a, con scorciatoie Min/Max).
//
// Un solo pezzo di logica, riusato una volta per scheda (Mesi
// migliori, Km mensili, Anni, Stagioni, Periodi, Giri: tutte e sei
// con entrambi i controlli). Chi chiama non deve sapere nulla di
// HTML: passa il contenitore già presente in pagina
// (".classifica-controlli") e riceve indietro solo lo stato e un
// modo per aggiornare i suggerimenti di Min/Max.
//
// I campi "Da"/"A" si scrivono liberi: qualsiasi numero, anche fuori
// dai km davvero presenti nei dati. Non c'è nessuna correzione
// automatica di quello che si scrive — solo i due pulsanti "Min"/
// "Max" per chi non conosce il valore vero e vuole partire da lì.
//
// Uso tipico (dentro Statistiche/History/classifica-mesi.js):
//
//   const controlli = ClassificaControlli.crea(
//     document.getElementById("controlli-mesi"),
//     { onCambia: ridisegna },
//   );
//   controlli.aggiornaLimiti(righe.map((r) => r.km));
//   function ridisegna() {
//     const stato = controlli.stato();
//     const filtrate = ClassificaControlli.filtra(righe, stato, (r) => r.km);
//     // "Ordine" inverte tutto insieme, podio compreso: non solo la
//     // lista completa sotto, altrimenti un "oro" fisso al valore più
//     // alto contraddirebbe la scelta "dal meno al più" appena fatta.
//     const ordinate = ClassificaControlli.ordina(filtrate, stato.ordine, (r) => r.km);
//     const perPodio = ordinate.slice(0, 3);
//     ...
//   }
//   ridisegna();
//
// "stato" è sempre { ordine: "desc"|"asc", min: number|null, max: number|null }.
// ============================================================

window.ClassificaControlli = window.ClassificaControlli || {};

(function (C) {
  "use strict";

  // Collega i pulsanti/campi già presenti dentro "contenitore" (il
  // markup vive in Statistiche/History/ClassificaMesi.html, sempre
  // con le stesse classi/attributi: ".classifica-ordine__pulsante
  // [data-ordine]", "input[data-range=min|max]",
  // "[data-azione=min|max|reset]"). Se il contenitore non esiste
  // (scheda senza questi controlli) restituisce uno stato neutro di
  // default, così chi chiama non deve controllare ogni volta se i
  // controlli ci sono davvero.
  C.crea = function (contenitore, opzioni) {
    opzioni = opzioni || {};

    if (!contenitore) {
      return {
        aggiornaLimiti: function () {},
        stato: function () {
          return { ordine: "desc", min: null, max: null };
        },
      };
    }

    var bottoniOrdine = contenitore.querySelectorAll("[data-ordine]");
    var inputMin = contenitore.querySelector('[data-range="min"]');
    var inputMax = contenitore.querySelector('[data-range="max"]');
    var bottoneMin = contenitore.querySelector('[data-azione="min"]');
    var bottoneMax = contenitore.querySelector('[data-azione="max"]');
    var bottoneReset = contenitore.querySelector('[data-azione="reset"]');

    var ordineAttuale = "desc";
    var limiti = { min: 0, max: 0 };

    function numeroOVuoto(campo) {
      if (!campo || campo.value === "") return null;
      var numero = Number(campo.value);
      return Number.isNaN(numero) ? null : numero;
    }

    function leggiStato() {
      return {
        ordine: ordineAttuale,
        min: numeroOVuoto(inputMin),
        max: numeroOVuoto(inputMax),
      };
    }

    function notifica() {
      if (typeof opzioni.onCambia === "function") {
        opzioni.onCambia(leggiStato());
      }
    }

    Array.prototype.forEach.call(bottoniOrdine, function (bottone) {
      bottone.addEventListener("click", function () {
        if (bottone.dataset.ordine === ordineAttuale) return;
        ordineAttuale = bottone.dataset.ordine;
        Array.prototype.forEach.call(bottoniOrdine, function (b) {
          var attivo = b === bottone;
          b.classList.toggle("attivo", attivo);
          b.setAttribute("aria-pressed", attivo ? "true" : "false");
        });
        notifica();
      });
    });

    // Il campo si scrive libero: qualsiasi numero, anche fuori dai km
    // davvero presenti nei dati (es. "100" quando il minimo vero è più
    // alto). Se non corrisponde a niente, il filtro mostrerà "nessun
    // risultato" invece di correggere da solo quello che si è scritto.
    if (inputMin) inputMin.addEventListener("input", notifica);
    if (inputMax) inputMax.addEventListener("input", notifica);

    // "Min"/"Max": per chi non conosce il valore più basso/alto
    // davvero presente nei dati, riempie il campo con quel valore
    // vero (arrotondato) invece di lasciarlo indovinare a occhio.
    if (bottoneMin) {
      bottoneMin.addEventListener("click", function () {
        if (inputMin) inputMin.value = String(Math.floor(limiti.min));
        notifica();
      });
    }
    if (bottoneMax) {
      bottoneMax.addEventListener("click", function () {
        if (inputMax) inputMax.value = String(Math.ceil(limiti.max));
        notifica();
      });
    }
    if (bottoneReset) {
      bottoneReset.addEventListener("click", function () {
        if (inputMin) inputMin.value = "";
        if (inputMax) inputMax.value = "";
        notifica();
      });
    }

    return {
      // Richiamata ogni volta che cambia l'insieme di dati
      // disponibile per questa scheda (es. selezionando un anno nel
      // filtro già esistente di "Km mensili"): aggiorna solo cosa i
      // pulsanti "Min"/"Max" scriveranno al prossimo click e il
      // segnaposto dei campi vuoti, non ridisegna nulla da sola.
      aggiornaLimiti: function (valori) {
        if (!valori || !valori.length) {
          limiti = { min: 0, max: 0 };
        } else {
          limiti = {
            min: Math.min.apply(null, valori),
            max: Math.max.apply(null, valori),
          };
        }
        // Solo un suggerimento (il segnaposto grigio, non un valore
        // vero): dice cos'è il minimo/massimo reale senza impedire di
        // scriverci sopra un numero diverso.
        if (inputMin) inputMin.placeholder = String(Math.floor(limiti.min));
        if (inputMax) inputMax.placeholder = String(Math.ceil(limiti.max));
      },
      stato: leggiStato,
    };
  };

  // Solo il filtro per km (min/max): non cambia l'ordine delle righe.
  C.filtra = function (righe, stato, valoreDi) {
    return righe.filter(function (r) {
      var v = valoreDi(r);
      if (stato.min != null && v < stato.min) return false;
      if (stato.max != null && v > stato.max) return false;
      return true;
    });
  };

  // Solo l'ordinamento: restituisce sempre una copia nuova, non
  // tocca mai l'array originale (che altre parti della pagina
  // potrebbero ancora star usando in ordine diverso).
  C.ordina = function (righe, ordine, valoreDi) {
    return righe.slice().sort(function (a, b) {
      return ordine === "asc"
        ? valoreDi(a) - valoreDi(b)
        : valoreDi(b) - valoreDi(a);
    });
  };
})(window.ClassificaControlli);
