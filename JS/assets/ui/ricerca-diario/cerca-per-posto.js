// ============================================================
// cerca-per-posto.js — "Dove sono già stato?"
//
// L'utente scrive (anche solo una parte del) nome di un posto, e
// puo' aggiungerne quanti altri vuole col bottone "+ Aggiungi un
// altro posto": alla ricerca, i giri che corrispondono a uno
// qualsiasi dei posti scritti (ricerca "o questo o quello") vengono
// raccolti tutti nello stesso elenco.
//
// L'ordinamento si sceglie con i bottoni "Ordina per" (logica
// condivisa di dati-giri.js, usata anche dalla ricerca per data): un
// click riordina subito i risultati gia' in pagina, senza dover
// premere di nuovo "Cerca".
//
// Dipende da dati-giri.js (che a sua volta dipende da Json e
// formatNumber): vanno inclusi prima di questo file.
// ============================================================

(function () {
  "use strict";

  var ultimiRisultati = null;
  var bottoniOrdine = null;

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

  function raccogliPosti() {
    var input = document.querySelectorAll(
      '#contenitorePosti input[type="text"]',
    );
    var valori = [];
    input.forEach(function (el) {
      var v = el.value.trim();
      if (v) valori.push(v);
    });
    return valori;
  }

  function mostraOrdinati() {
    var contenitore = document.getElementById("risultatiCercaPosto");
    if (!contenitore || !ultimiRisultati) return;
    var criterio = bottoniOrdine ? bottoniOrdine.leggi() : "alfabetico";
    contenitore.innerHTML = window.DatiGiri.elencoRisultati(
      window.DatiGiri.ordina(ultimiRisultati, criterio),
    );
  }

  async function cercaPosto(valori) {
    var contenitore = document.getElementById("risultatiCercaPosto");
    var messaggio = document.getElementById("messaggioCercaPosto");
    if (!contenitore || !messaggio) return;

    contenitore.innerHTML = "";
    ultimiRisultati = null;

    if (!valori.length) {
      messaggio.textContent = "Scrivi almeno una parte del nome di un posto.";
      messaggio.hidden = false;
      return;
    }

    messaggio.textContent = "Ricerca in corso...";
    messaggio.hidden = false;

    var candidati = await window.DatiGiri.tuttiICandidati();
    var tutteLeUscite = await window.DatiGiri.leggiUscite(candidati);

    var queryNormalizzate = valori.map(function (v) {
      return window.DatiGiri.normalizza(v);
    });

    var risultati = tutteLeUscite.filter(function (u) {
      var postoNormalizzato = window.DatiGiri.normalizza(u.postoTesto);
      return queryNormalizzate.some(function (q) {
        return postoNormalizzato.indexOf(q) !== -1;
      });
    });

    if (risultati.length === 0) {
      messaggio.textContent =
        valori.length > 1
          ? "Nessun giro trovato per: " + valori.join(", ") + "."
          : 'Nessun giro trovato per "' + valori[0] + '".';
      messaggio.hidden = false;
      return;
    }

    messaggio.hidden = true;
    ultimiRisultati = risultati;
    mostraOrdinati();
  }

  function inizializza() {
    var form = document.getElementById("formCercaPosto");
    var input = document.getElementById("postoGiro");
    var contenitorePosti = document.getElementById("contenitorePosti");
    var bottoneAggiungi = document.getElementById("aggiungiPosto");
    if (!form || !input) return;

    if (bottoneAggiungi && contenitorePosti) {
      bottoneAggiungi.addEventListener("click", function () {
        contenitorePosti.appendChild(nuovaRigaPosto());
      });
    }

    bottoniOrdine = window.DatiGiri.inizializzaBottoniOrdine(
      "criterioOrdinamento",
      mostraOrdinati,
    );

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      cercaPosto(raccogliPosti());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inizializza);
  } else {
    inizializza();
  }
})();
