// ============================================================
// cerca-per-posto.js — "Dove sono già stato?"
//
// L'utente scrive (anche solo una parte del) nome di un posto e
// vede tutte le uscite che lo contengono, in tutte le stagioni e
// tutti gli anni del diario. L'ordinamento si sceglie con i
// bottoni "Ordina per" (stessa logica condivisa di dati-giri.js,
// usata anche dalla ricerca per data): un click riordina subito i
// risultati gia' in pagina, senza dover premere di nuovo "Cerca".
//
// Dipende da dati-giri.js (che a sua volta dipende da Json e
// formatNumber): vanno inclusi prima di questo file.
// ============================================================

(function () {
  "use strict";

  var ultimiRisultati = null;
  var bottoniOrdine = null;

  // Confronto senza badare ad accenti/maiuscole, cosi' "citta" trova
  // anche "Città".
  function normalizza(testo) {
    return testo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("it");
  }

  function mostraOrdinati() {
    var contenitore = document.getElementById("risultatiCercaPosto");
    if (!contenitore || !ultimiRisultati) return;
    var criterio = bottoniOrdine ? bottoniOrdine.leggi() : "alfabetico";
    contenitore.innerHTML = window.DatiGiri.elencoRisultati(
      window.DatiGiri.ordina(ultimiRisultati, criterio),
    );
  }

  async function cercaPosto(valoreInput) {
    var contenitore = document.getElementById("risultatiCercaPosto");
    var messaggio = document.getElementById("messaggioCercaPosto");
    if (!contenitore || !messaggio) return;

    contenitore.innerHTML = "";
    ultimiRisultati = null;

    var query = (valoreInput || "").trim();
    if (!query) {
      messaggio.textContent = "Scrivi almeno una parte del nome del posto.";
      messaggio.hidden = false;
      return;
    }

    messaggio.textContent = "Ricerca in corso...";
    messaggio.hidden = false;

    var candidati = await window.DatiGiri.tuttiICandidati();
    var tutteLeUscite = await window.DatiGiri.leggiUscite(candidati);

    var queryNormalizzata = normalizza(query);
    var risultati = tutteLeUscite.filter(function (u) {
      return normalizza(u.postoTesto).indexOf(queryNormalizzata) !== -1;
    });

    if (risultati.length === 0) {
      messaggio.textContent = 'Nessun giro trovato per "' + query + '".';
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
    if (!form || !input) return;

    bottoniOrdine = window.DatiGiri.inizializzaBottoniOrdine(
      "criterioOrdinamento",
      mostraOrdinati,
    );

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      cercaPosto(input.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inizializza);
  } else {
    inizializza();
  }
})();
