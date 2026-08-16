// ============================================================
// classifica-controlli.js — Controlli condivisi delle schede della
// pagina Classifica: "Ordine" (dal più al meno pedalato o inverso,
// alfabetico A-Z/Z-A, oppure dal più recente al meno recente o
// inverso), "Filtro per km" (da...a, con scorciatoie Min/Max) e
// "Cerca" (un campo di testo libero, per nome del mese, dell'anno,
// della stagione, del periodo o del giro/posto a seconda della
// scheda).
//
// Un solo pezzo di logica, riusato una volta per scheda (Mesi
// migliori, Km mensili, Anni, Stagioni, Periodi, Giri: tutte e sei
// con gli stessi tre controlli). Chi chiama non deve sapere nulla di
// HTML: passa il contenitore già presente in pagina
// (".classifica-controlli") e riceve indietro solo lo stato e un
// modo per aggiornare i suggerimenti di Min/Max.
//
// I campi "Da"/"A" si scrivono liberi: qualsiasi numero, anche fuori
// dai km davvero presenti nei dati. Non c'è nessuna correzione
// automatica di quello che si scrive — solo i due pulsanti "Min"/
// "Max" per chi non conosce il valore vero e vuole partire da lì.
//
// Il campo "Cerca" è altrettanto libero: confronta il testo scritto
// (senza distinguere maiuscole/minuscole né accenti, così "citta" e
// "città" trovano lo stesso risultato) contro il testo che CHI CHIAMA
// decide riga per riga con ClassificaControlli.estraiTesto — ogni
// scheda passa i propri campi (mese, anno, stagione, periodo, nome
// del giro...), il controllo stesso non sa cosa sta cercando dentro.
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
//     const cercate = ClassificaControlli.cerca(righe, stato.testo, (r) => r.mese);
//     const filtrate = ClassificaControlli.filtra(cercate, stato, (r) => r.km);
//     // "Ordine" inverte tutto insieme, podio compreso: non solo la
//     // lista completa sotto, altrimenti un "oro" fisso al valore più
//     // alto contraddirebbe la scelta "dal meno al più" appena fatta.
//     const ordinate = ClassificaControlli.ordina(filtrate, stato.ordine, (r) => r.km);
//     const perPodio = ordinate.slice(0, 3);
//     ...
//   }
//   ridisegna();
//
// "stato" è sempre { ordine: "desc"|"asc", min: number|null, max: number|null, testo: string }.
// ============================================================

window.ClassificaControlli = window.ClassificaControlli || {};

(function (C) {
  "use strict";

  // Toglie accenti e maiuscole prima di confrontare: chi scrive
  // "citta" deve trovare anche "città", "PRIMAVERA" deve trovare
  // "Primavera". Usata sia per leggere il campo "Cerca" sia per
  // preparare il testo di ogni riga (vedi C.cerca più sotto).
  function normalizzaTesto(testo) {
    return String(testo == null ? "" : testo)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

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
          return { ordine: "desc", min: null, max: null, testo: "" };
        },
      };
    }

    var bottoniOrdine = contenitore.querySelectorAll("[data-ordine]");
    var inputMin = contenitore.querySelector('[data-range="min"]');
    var inputMax = contenitore.querySelector('[data-range="max"]');
    var bottoneMin = contenitore.querySelector('[data-azione="min"]');
    var bottoneMax = contenitore.querySelector('[data-azione="max"]');
    var bottoneReset = contenitore.querySelector('[data-azione="reset"]');
    var inputRicerca = contenitore.querySelector("[data-ricerca]");

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
        // Già normalizzato qui (minuscolo, senza accenti): chi
        // riceve lo stato non deve rifarlo ogni volta da capo.
        testo: normalizzaTesto(inputRicerca ? inputRicerca.value : ""),
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
        // "Azzera filtro" svuota anche la ricerca: è un filtro come
        // gli altri due, non ha senso lasciarlo attivo da solo dopo
        // aver premuto un pulsante che promette di azzerare tutto.
        if (inputRicerca) inputRicerca.value = "";
        notifica();
      });
    }

    // Testo libero: ogni lettera digitata ridisegna subito, stesso
    // comportamento già scelto sopra per i campi "Da"/"A" (nessuna
    // attesa, nessun pulsante "Cerca" a parte).
    if (inputRicerca) inputRicerca.addEventListener("input", notifica);

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

  // Solo la ricerca per testo: tiene solo le righe il cui testo
  // (deciso da "testoDi", riga per riga) contiene quanto scritto nel
  // campo "Cerca". "testo" vuoto (campo vuoto) tiene tutte le righe.
  // Confronto senza maiuscole/minuscole né accenti (vedi
  // normalizzaTesto): "primavera" trova "Primavera", "citta" trova
  // "Città". Come C.filtra, non cambia l'ordine delle righe.
  C.cerca = function (righe, testo, testoDi) {
    var cercato = normalizzaTesto(testo);
    if (!cercato) return righe;
    return righe.filter(function (r) {
      return normalizzaTesto(testoDi(r)).indexOf(cercato) !== -1;
    });
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
  //
  // "ordine" può valere:
  //   "desc" / "asc"              per km/distanza (comportamento originale)
  //   "alfabetico" / "alfabetico-desc"   per nome, A→Z o Z→A
  //   "data-recente" / "data-vecchio"    per data/cronologia
  //
  // Il quarto parametro "extra" resta compatibile con l'uso di prima
  // (una funzione = solo lo spareggio) ma accetta anche un oggetto
  // con fino a tre estrattori:
  //   { spareggio, nome, data }
  //   - "spareggio" (opzionale): a parita' di valoreDi (es. stessi km)
  //     decide chi va prima nell'ordine "desc"/"asc", nello STESSO
  //     verso della classifica attuale — stessa logica di sempre per
  //     i Giri/Tappe (assets/tappe-piu-lunghe.js): dal piu' al meno
  //     pedalato vince il valore di spareggio piu' vecchio/basso, dal
  //     meno al piu' si specchia e vince quello piu' recente/alto.
  //     Senza spareggio, le righe pari restano nell'ordine di prima.
  //   - "nome" (richiesto per "alfabetico"/"alfabetico-desc"): estrae
  //     il testo da confrontare riga per riga. Confronto con le
  //     regole della lingua italiana (accenti, maiuscole/minuscole),
  //     via localeCompare.
  //   - "data" (richiesto per "data-recente"/"data-vecchio"): estrae
  //     un numero comparabile riga per riga (timestamp, aaaammgg,
  //     anno, o un qualunque indice crescente nel tempo). Se manca,
  //     si ricade su valoreDi.
  C.ordina = function (righe, ordine, valoreDi, extra) {
    var opzioni =
      typeof extra === "function" ? { spareggio: extra } : extra || {};
    var valoreSpareggio = opzioni.spareggio;
    var nomeDi = opzioni.nome;
    var dataDi = opzioni.data || valoreDi;

    if (ordine === "alfabetico" || ordine === "alfabetico-desc") {
      var estraiNome =
        nomeDi ||
        function () {
          return "";
        };
      return righe.slice().sort(function (a, b) {
        var risultato = String(estraiNome(a)).localeCompare(
          String(estraiNome(b)),
          "it",
          { sensitivity: "base", numeric: true },
        );
        return ordine === "alfabetico-desc" ? -risultato : risultato;
      });
    }

    if (ordine === "data-recente" || ordine === "data-vecchio") {
      return righe.slice().sort(function (a, b) {
        return ordine === "data-recente"
          ? dataDi(b) - dataDi(a)
          : dataDi(a) - dataDi(b);
      });
    }

    return righe.slice().sort(function (a, b) {
      var perValore =
        ordine === "asc"
          ? valoreDi(a) - valoreDi(b)
          : valoreDi(b) - valoreDi(a);
      if (perValore !== 0 || !valoreSpareggio) return perValore;
      return ordine === "asc"
        ? valoreSpareggio(b) - valoreSpareggio(a)
        : valoreSpareggio(a) - valoreSpareggio(b);
    });
  };
})(window.ClassificaControlli);
