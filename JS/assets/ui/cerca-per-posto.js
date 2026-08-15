// ============================================================
// cerca-per-posto.js — "Dove sono già stato?"
//
// L'utente scrive (anche solo una parte del) nome di un posto e
// vede tutte le uscite che lo contengono, in tutte le stagioni e
// tutti gli anni del diario. L'ordinamento si sceglie con dei
// bottoni (stesso concetto della pagina Storico > Classifica dei
// mesi: un gruppo di pulsanti, uno solo attivo alla volta — non un
// menu a tendina), non appena si clicca un bottone i risultati gia'
// in pagina si riordinano subito, senza dover premere di nuovo
// "Cerca". I criteri sono:
//   - Alfabetico per posto (predefinito, se non si sceglie nulla)
//   - Per data (dal piu' recente o dal piu' vecchio)
//   - Per distanza (dal piu' lungo o dal piu' corto)
// A parita' di chilometri, tra due uscite viene mostrata prima
// quella con la data piu' vecchia.
//
// Dipende da dati-giri.js (che a sua volta dipende da Json e
// formatNumber): vanno inclusi prima di questo file.
// ============================================================

(function () {
  "use strict";

  var ultimiRisultati = null;
  var criterioAttuale = "alfabetico";

  function perData(a, b) {
    return a.chiaveData - b.chiaveData;
  }

  function perAlfabeto(a, b) {
    return a.postoTesto.localeCompare(b.postoTesto, "it", {
      sensitivity: "base",
    });
  }

  function ordina(uscite, criterio) {
    var copia = uscite.slice();

    switch (criterio) {
      case "data-vecchio":
        copia.sort(function (a, b) {
          return perData(a, b) || perAlfabeto(a, b);
        });
        break;
      case "data-recente":
        copia.sort(function (a, b) {
          return perData(b, a) || perAlfabeto(a, b);
        });
        break;
      case "distanza-lungo":
        copia.sort(function (a, b) {
          return b.distanza - a.distanza || perData(a, b);
        });
        break;
      case "distanza-corto":
        copia.sort(function (a, b) {
          return a.distanza - b.distanza || perData(a, b);
        });
        break;
      case "alfabetico":
      default:
        copia.sort(function (a, b) {
          return perAlfabeto(a, b) || perData(a, b);
        });
        break;
    }

    return copia;
  }

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
    var ordinati = ordina(ultimiRisultati, criterioAttuale);
    contenitore.innerHTML = window.DatiGiri.elencoRisultati(ordinati);
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

  function inizializzaBottoniOrdine() {
    var gruppo = document.getElementById("criterioOrdinamento");
    if (!gruppo) return;
    var bottoni = gruppo.querySelectorAll(".criterio-ordine__pulsante");

    bottoni.forEach(function (bottone) {
      bottone.addEventListener("click", function () {
        bottoni.forEach(function (b) {
          b.classList.remove("attivo");
          b.setAttribute("aria-pressed", "false");
        });
        bottone.classList.add("attivo");
        bottone.setAttribute("aria-pressed", "true");
        criterioAttuale = bottone.getAttribute("data-criterio") || "alfabetico";
        mostraOrdinati();
      });
    });
  }

  function inizializza() {
    var form = document.getElementById("formCercaPosto");
    var input = document.getElementById("postoGiro");
    if (!form || !input) return;

    inizializzaBottoniOrdine();

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
