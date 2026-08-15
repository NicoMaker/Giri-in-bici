// ============================================================
// cerca-per-data.js — "Che giro ho fatto il...?"
//
// L'utente sceglie una data col selettore nativo del browser, e puo'
// aggiungerne quante altre vuole col bottone "+ Aggiungi un'altra
// data": alla ricerca, tutte le date inserite vengono cercate
// insieme e i giri trovati compaiono tutti nello stesso elenco,
// ordinati dal piu' vecchio al piu' recente.
//
// La logica di dove cercare ogni data (quale file, quale stagione)
// vive in dati-giri.js, che va incluso prima di questo file insieme
// a Json (JS/json.js) e formatNumber (JS/utils.js).
// ============================================================

(function () {
  "use strict";

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

  async function cercaGiri(valori) {
    var contenitore = document.getElementById("risultatiCercaData");
    var messaggio = document.getElementById("messaggioCercaData");
    if (!contenitore || !messaggio) return;

    contenitore.innerHTML = "";

    if (!valori.length) {
      messaggio.textContent = "Scegli almeno una data.";
      messaggio.hidden = false;
      return;
    }

    // Spareggia i doppioni (la stessa data inserita due volte) e
    // mette da parte le date scritte in modo non valido.
    var bersagli = [];
    var etichetteViste = {};
    var nonValide = 0;

    valori.forEach(function (v) {
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

    if (risultati.length === 0) {
      messaggio.textContent =
        bersagli.length > 1
          ? "Nessun giro trovato per le date scelte. Forse quei giorni siete rimasti a casa!"
          : "Nessun giro trovato per il " +
            bersagli[0].etichettaCompleta +
            ". Forse quel giorno siete rimasti a casa!";
      messaggio.hidden = false;
      return;
    }

    if (bersagliSenzaGiri.length) {
      messaggio.textContent =
        "Nessun giro trovato per: " + bersagliSenzaGiri.join(", ") + ".";
      messaggio.hidden = false;
    } else {
      messaggio.hidden = true;
    }

    contenitore.innerHTML = window.DatiGiri.elencoRisultati(risultati);
  }

  function inizializza() {
    var form = document.getElementById("formCercaData");
    var input = document.getElementById("dataGiro");
    var contenitoreDate = document.getElementById("contenitoreDate");
    var bottoneAggiungi = document.getElementById("aggiungiData");
    if (!form || !input) return;

    // Non si puo' cercare prima dell'inizio del diario, ne' dopo oggi.
    input.min = "2020-05-30";
    input.max = new Date().toISOString().slice(0, 10);

    if (bottoneAggiungi && contenitoreDate) {
      bottoneAggiungi.addEventListener("click", function () {
        contenitoreDate.appendChild(nuovaRigaData());
      });
    }

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      cercaGiri(raccogliDate());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inizializza);
  } else {
    inizializza();
  }
})();
