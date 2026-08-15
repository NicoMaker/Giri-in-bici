// ============================================================
// cerca-per-data.js — "Che giro ho fatto il...?"
//
// L'utente sceglie una data col selettore nativo del browser; la
// logica di dove cercarla (quale file, quale stagione) vive in
// dati-giri.js, che va incluso prima di questo file insieme a
// Json (JS/json.js) e formatNumber (JS/utils.js).
// ============================================================

(function () {
  "use strict";

  async function cercaGiro(valoreInput) {
    var contenitore = document.getElementById("risultatiCercaData");
    var messaggio = document.getElementById("messaggioCercaData");
    if (!contenitore || !messaggio) return;

    contenitore.innerHTML = "";

    if (!valoreInput) {
      messaggio.textContent = "Scegli prima una data.";
      messaggio.hidden = false;
      return;
    }

    var parti = valoreInput.split("-");
    var anno = parseInt(parti[0], 10);
    var meseIndice = parseInt(parti[1], 10) - 1;
    var giorno = parseInt(parti[2], 10);

    if (!anno || meseIndice < 0 || meseIndice > 11 || !giorno) {
      messaggio.textContent = "Data non valida.";
      messaggio.hidden = false;
      return;
    }

    var etichettaGiorno =
      String(giorno).padStart(2, "0") + " " + window.DatiGiri.MESI[meseIndice];
    var etichettaCompleta = etichettaGiorno + " " + anno;

    messaggio.textContent = "Ricerca in corso...";
    messaggio.hidden = false;

    var candidati = window.DatiGiri.candidatiPerData(meseIndice, anno);
    var tutteLeUscite = await window.DatiGiri.leggiUscite(candidati);
    var risultati = tutteLeUscite.filter(function (u) {
      return u.data === etichettaGiorno && u.anno === anno;
    });

    if (risultati.length === 0) {
      messaggio.textContent =
        "Nessun giro trovato per il " +
        etichettaCompleta +
        ". Forse quel giorno siete rimasti a casa!";
      messaggio.hidden = false;
      return;
    }

    messaggio.hidden = true;
    contenitore.innerHTML = window.DatiGiri.elencoRisultati(risultati);
  }

  function inizializza() {
    var form = document.getElementById("formCercaData");
    var input = document.getElementById("dataGiro");
    if (!form || !input) return;

    // Non si puo' cercare prima dell'inizio del diario, ne' dopo oggi.
    input.min = "2020-05-30";
    input.max = new Date().toISOString().slice(0, 10);

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      cercaGiro(input.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inizializza);
  } else {
    inizializza();
  }
})();
