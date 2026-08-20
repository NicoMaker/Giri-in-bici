// ============================================================
// cerca-per-data.js — "Che giro ho fatto il...?"
//
// L'utente sceglie una data col selettore nativo del browser, e puo'
// aggiungerne quante altre vuole col bottone "+ Aggiungi un'altra
// data": alla ricerca, tutte le date inserite vengono cercate
// insieme e i giri trovati compaiono tutti nello stesso elenco,
// ordinati dal piu' vecchio al piu' recente.
//
// Sotto le date puo' anche indicare uno o piu' posti (facoltativo):
// se ne inserisce piu' di uno, vengono mostrati i giri che
// corrispondono a uno qualsiasi di essi (ricerca "o questo o quello").
//
// La logica di dove cercare ogni data (quale file, quale stagione)
// vive in dati-giri.js, che va incluso prima di questo file insieme
// a Json (JS/json.js) e formatNumber (JS/utils.js).
// ============================================================

(function () {
  "use strict";

  var ultimiRisultati = null;
  var bottoniOrdine = null;
  var postiRicerca = [];

  function nuovaRigaData() {
    var riga = document.createElement("div");
    riga.className = "riga-data-input";

    var input = document.createElement("input");
    input.type = "date";
    input.setAttribute("aria-label", "Data aggiuntiva");
    input.min = "2020-05-30";
    input.max = new Date().toISOString().slice(0, 10);

    var rimuovi = document.createElement("button");
    rimuovi.type = "button";
    rimuovi.className = "rimuovi-data";
    rimuovi.setAttribute("aria-label", "Rimuovi questa data");
    rimuovi.textContent = "×";
    rimuovi.addEventListener("click", function () {
      riga.remove();
    });

    riga.appendChild(input);
    riga.appendChild(rimuovi);
    return riga;
  }

  function nuovaRigaPosto() {
    var riga = document.createElement("div");
    riga.className = "riga-data-input";

    var input = document.createElement("input");
    input.type = "text";
    input.setAttribute("aria-label", "Posto aggiuntivo");
    input.placeholder = "Es. Gemona, Lignano\u2026";

    var rimuovi = document.createElement("button");
    rimuovi.type = "button";
    rimuovi.className = "rimuovi-data";
    rimuovi.setAttribute("aria-label", "Rimuovi questo posto");
    rimuovi.textContent = "×";
    rimuovi.addEventListener("click", function () {
      riga.remove();
    });

    riga.appendChild(input);
    riga.appendChild(rimuovi);
    return riga;
  }

  function raccogliDate() {
    var input = document.querySelectorAll(
      '#contenitoreDate input[type="date"]',
    );
    var valori = [];
    input.forEach(function (el) {
      if (el.value) valori.push(el.value);
    });
    return valori;
  }

  function raccogliPosti() {
    var input = document.querySelectorAll(
      '#contenitorePostiData input[type="text"]',
    );
    var valori = [];
    input.forEach(function (el) {
      var v = el.value.trim();
      if (v) valori.push(v);
    });
    return valori;
  }

  function analizzaData(valoreInput) {
    var parti = valoreInput.split("-");
    var anno = parseInt(parti[0], 10);
    var meseIndice = parseInt(parti[1], 10) - 1;
    var giorno = parseInt(parti[2], 10);
    if (!anno || meseIndice < 0 || meseIndice > 11 || !giorno) return null;

    var etichettaGiorno =
      String(giorno).padStart(2, "0") + " " + window.DatiGiri.MESI[meseIndice];
    return {
      anno: anno,
      meseIndice: meseIndice,
      etichettaGiorno: etichettaGiorno,
      etichettaCompleta: etichettaGiorno + " " + anno,
    };
  }

  function filtraPerPosti(risultati, posti) {
    if (!posti.length) return risultati;

    var queryNormalizzate = posti.map(function (v) {
      return window.DatiGiri.normalizza(v);
    });

    return risultati.filter(function (u) {
      var postoNormalizzato = window.DatiGiri.normalizza(u.postoTesto);
      return queryNormalizzate.some(function (q) {
        return postoNormalizzato.indexOf(q) !== -1;
      });
    });
  }

  async function cercaGiri(valoriDate, valoriPosti) {
    var contenitore = document.getElementById("risultatiCercaData");
    var messaggio = document.getElementById("messaggioCercaData");
    if (!contenitore || !messaggio) return;

    contenitore.innerHTML = "";
    ultimiRisultati = null;
    postiRicerca = valoriPosti.slice();

    if (!valoriDate.length) {
      messaggio.textContent = "Scegli almeno una data.";
      messaggio.hidden = false;
      return;
    }

    // Spareggia i doppioni (la stessa data inserita due volte) e
    // mette da parte le date scritte in modo non valido.
    var bersagli = [];
    var etichetteViste = {};
    var nonValide = 0;

    valoriDate.forEach(function (v) {
      var b = analizzaData(v);
      if (!b) {
        nonValide += 1;
        return;
      }
      if (etichetteViste[b.etichettaCompleta]) return;
      etichetteViste[b.etichettaCompleta] = true;
      bersagli.push(b);
    });

    if (!bersagli.length) {
      messaggio.textContent = "Data non valida.";
      messaggio.hidden = false;
      return;
    }

    messaggio.textContent = "Ricerca in corso...";
    messaggio.hidden = false;

    // Un solo elenco di file da leggere, senza doppioni, anche se
    // piu' date ricadono nello stesso file (es. due date della
    // stessa Estate).
    var candidatiPerUrl = {};
    bersagli.forEach(function (b) {
      window.DatiGiri.candidatiPerData(b.meseIndice, b.anno).forEach(
        function (c) {
          candidatiPerUrl[c.url] = c;
        },
      );
    });
    var candidati = Object.keys(candidatiPerUrl).map(function (url) {
      return candidatiPerUrl[url];
    });

    var tutteLeUscite = await window.DatiGiri.leggiUscite(candidati);

    var risultati = [];
    var bersagliSenzaGiri = [];
    bersagli.forEach(function (b) {
      var trovati = tutteLeUscite.filter(function (u) {
        return u.data === b.etichettaGiorno && u.anno === b.anno;
      });
      if (trovati.length) {
        risultati = risultati.concat(trovati);
      } else {
        bersagliSenzaGiri.push(b.etichettaCompleta);
      }
    });

    risultati.sort(function (a, b) {
      return a.chiaveData - b.chiaveData;
    });

    if (postiRicerca.length) {
      risultati = filtraPerPosti(risultati, postiRicerca);
    }

    if (risultati.length === 0) {
      if (postiRicerca.length) {
        messaggio.textContent =
          postiRicerca.length > 1
            ? "Nessun giro trovato per le date scelte con i posti: " +
              postiRicerca.join(", ") +
              "."
            : 'Nessun giro trovato per le date scelte con il posto "' +
              postiRicerca[0] +
              '".';
      } else if (bersagli.length > 1) {
        messaggio.textContent =
          "Nessun giro trovato per le date scelte. Forse quei giorni siete rimasti a casa!";
      } else {
        messaggio.textContent =
          "Nessun giro trovato per il " +
          bersagli[0].etichettaCompleta +
          ". Forse quel giorno siete rimasti a casa!";
      }
      messaggio.hidden = false;
      return;
    }

    if (bersagliSenzaGiri.length && !postiRicerca.length) {
      messaggio.textContent =
        "Nessun giro trovato per: " + bersagliSenzaGiri.join(", ") + ".";
      messaggio.hidden = false;
    } else {
      messaggio.hidden = true;
    }

    ultimiRisultati = risultati;
    mostraOrdinati();
  }

  function mostraOrdinati() {
    var contenitore = document.getElementById("risultatiCercaData");
    var messaggio = document.getElementById("messaggioCercaData");
    if (!contenitore || !ultimiRisultati) return;

    var criterio = bottoniOrdine ? bottoniOrdine.leggi() : "data-recente";
    contenitore.innerHTML = window.DatiGiri.elencoRisultati(
      window.DatiGiri.ordina(ultimiRisultati, criterio),
    );
  }

  function inizializza() {
    var form = document.getElementById("formCercaData");
    var input = document.getElementById("dataGiro");
    var contenitoreDate = document.getElementById("contenitoreDate");
    var bottoneAggiungiData = document.getElementById("aggiungiData");
    var contenitorePosti = document.getElementById("contenitorePostiData");
    var bottoneAggiungiPosto = document.getElementById("aggiungiPostoData");
    if (!form || !input) return;

    // Non si puo' cercare prima dell'inizio del diario, ne' dopo oggi.
    input.min = "2020-05-30";
    input.max = new Date().toISOString().slice(0, 10);

    if (bottoneAggiungiData && contenitoreDate) {
      bottoneAggiungiData.addEventListener("click", function () {
        contenitoreDate.appendChild(nuovaRigaData());
      });
    }

    if (bottoneAggiungiPosto && contenitorePosti) {
      bottoneAggiungiPosto.addEventListener("click", function () {
        contenitorePosti.appendChild(nuovaRigaPosto());
      });
    }

    bottoniOrdine = window.DatiGiri.inizializzaBottoniOrdine(
      "criterioOrdinamentoData",
      mostraOrdinati,
    );

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      cercaGiri(raccogliDate(), raccogliPosti());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inizializza);
  } else {
    inizializza();
  }
})();
