// ============================================================
// filtro-multiplo.js — Filtro a scelta multipla (pulsante + pannello
// a checkbox), al posto di un <select> che permette una scelta sola.
//
// Usato nella pagina Classifica (Statistiche/History/ClassificaMesi.html)
// per i tre filtri che prima erano <select> semplici:
//   - "Km mensili": Anno (uno solo prima, ora anche più anni insieme)
//   - "Periodi": Stagione (una sola prima, ora anche più stagioni
//     insieme, es. Autunno·Inverno + Primavera)
//   - "Giri": Stagione e Anno (prima una coppia sola, ora ognuno dei
//     due può avere più scelte: si può restringere a una sola coppia
//     precisa, es. solo Primavera 2021, cambiare idea e restringere a
//     solo Estate 2025, oppure tenerne aperte diverse insieme)
//
// Chi chiama non deve sapere nulla dell'HTML del pannello: passa un
// contenitore vuoto già presente in pagina (un <div> con un id, non
// serve altro dentro) e riceve indietro poche funzioni:
//
//   const filtro = FiltroMultiplo.crea(document.getElementById("..."), {
//     etichetta: "Stagione",       // testo del pulsante
//     tutte: "Tutte",              // testo quando nulla è selezionato
//     onCambia: (valori) => { ... },  // richiamata a ogni click
//   });
//   filtro.imposta(
//     [{ value: "Estate", label: "Estate" }, ...],
//     { preselezionati: ["Estate"] },  // opzionale
//   );
//   filtro.selezionati();  // -> ["Estate", ...]
//
// "imposta" si può richiamare più volte (es. l'elenco degli anni che
// cambia quando cambia la stagione scelta): con { mantieni: true }
// prova a tenere selezionati i valori di prima che esistono ancora
// nella nuova lista, così una scelta già fatta non si perde per
// niente se resta valida.
//
// Nessuna scelta selezionata equivale a "tutte / nessun filtro" —
// stesso comportamento del vecchio <select> con l'opzione vuota,
// così le pagine che leggono l'array restituito non devono cambiare
// logica quando l'utente non ha ancora scelto nulla.
// ============================================================

window.FiltroMultiplo = window.FiltroMultiplo || {};

(function (FM) {
  "use strict";

  var contatoreId = 0;

  FM.crea = function (contenitore, opzioni) {
    opzioni = opzioni || {};

    if (!contenitore) {
      // Stesso comportamento "neutro" degli altri controlli condivisi
      // del sito (vedi ClassificaControlli.crea): chi chiama non deve
      // controllare ogni volta se il contenitore esiste davvero.
      return {
        imposta: function () {},
        selezionati: function () {
          return [];
        },
        azzera: function () {},
      };
    }

    var etichetta = opzioni.etichetta || "";
    var testoVuoto = opzioni.tutte || "Tutte";
    var onCambia =
      typeof opzioni.onCambia === "function"
        ? opzioni.onCambia
        : function () {};

    var idPannello = "filtro-multiplo-pannello-" + ++contatoreId;
    var voci = []; // [{ value, label, checked }]
    var aperto = false;

    contenitore.classList.add("filtro-multiplo");
    contenitore.innerHTML =
      '<button type="button" class="filtro-multiplo__pulsante" aria-haspopup="true" aria-expanded="false" aria-controls="' +
      idPannello +
      '">' +
      (etichetta
        ? '<span class="filtro-multiplo__etichetta">' + etichetta + "</span>"
        : "") +
      '<span class="filtro-multiplo__valore"></span>' +
      '<span class="filtro-multiplo__freccia" aria-hidden="true">▾</span>' +
      "</button>" +
      '<div class="filtro-multiplo__pannello" id="' +
      idPannello +
      '" role="group" hidden></div>';

    var bottone = contenitore.querySelector(".filtro-multiplo__pulsante");
    var valoreEl = contenitore.querySelector(".filtro-multiplo__valore");
    var pannello = contenitore.querySelector(".filtro-multiplo__pannello");

    function selezionati() {
      return voci
        .filter(function (v) {
          return v.checked;
        })
        .map(function (v) {
          return v.value;
        });
    }

    function aggiornaTesto() {
      var attivi = voci.filter(function (v) {
        return v.checked;
      });
      if (!attivi.length) {
        valoreEl.textContent = testoVuoto;
      } else if (attivi.length === 1) {
        valoreEl.textContent = attivi[0].label;
      } else {
        valoreEl.textContent = attivi.length + " selezionate";
      }
      contenitore.classList.toggle(
        "filtro-multiplo--attivo",
        attivi.length > 0,
      );
      bottone.disabled = voci.length === 0;
    }

    function disegnaPannello() {
      if (!voci.length) {
        pannello.innerHTML =
          '<p class="filtro-multiplo__vuoto">Nessuna opzione disponibile.</p>';
        return;
      }
      var haSelezione = voci.some(function (v) {
        return v.checked;
      });
      pannello.innerHTML =
        '<div class="filtro-multiplo__azioni">' +
        '<button type="button" class="filtro-multiplo__azione" data-azione="tutte">Seleziona tutte</button>' +
        '<button type="button" class="filtro-multiplo__azione" data-azione="nessuna"' +
        (haSelezione ? "" : " disabled") +
        ">" +
        testoVuoto +
        "</button>" +
        "</div>" +
        '<ul class="filtro-multiplo__lista">' +
        voci
          .map(function (v, i) {
            return (
              '<li><label class="filtro-multiplo__voce">' +
              '<input type="checkbox" data-indice="' +
              i +
              '"' +
              (v.checked ? " checked" : "") +
              " />" +
              "<span>" +
              v.label +
              "</span>" +
              "</label></li>"
            );
          })
          .join("") +
        "</ul>";

      Array.prototype.forEach.call(
        pannello.querySelectorAll('input[type="checkbox"]'),
        function (input) {
          input.addEventListener("change", function () {
            voci[Number(input.dataset.indice)].checked = input.checked;
            aggiornaTesto();
            disegnaPannello();
            onCambia(selezionati());
          });
        },
      );

      var bottoneTutte = pannello.querySelector('[data-azione="tutte"]');
      var bottoneNessuna = pannello.querySelector('[data-azione="nessuna"]');
      if (bottoneTutte) {
        bottoneTutte.addEventListener("click", function () {
          voci.forEach(function (v) {
            v.checked = true;
          });
          aggiornaTesto();
          disegnaPannello();
          onCambia(selezionati());
        });
      }
      if (bottoneNessuna) {
        bottoneNessuna.addEventListener("click", function () {
          voci.forEach(function (v) {
            v.checked = false;
          });
          aggiornaTesto();
          disegnaPannello();
          onCambia(selezionati());
        });
      }
    }

    function apri() {
      if (bottone.disabled) return;
      aperto = true;
      disegnaPannello();
      pannello.hidden = false;
      bottone.setAttribute("aria-expanded", "true");
      contenitore.classList.add("filtro-multiplo--aperto");
    }

    function chiudi() {
      aperto = false;
      pannello.hidden = true;
      bottone.setAttribute("aria-expanded", "false");
      contenitore.classList.remove("filtro-multiplo--aperto");
    }

    bottone.addEventListener("click", function (evento) {
      evento.stopPropagation();
      if (aperto) chiudi();
      else apri();
    });

    // Chiude cliccando fuori o premendo Esc, stesso comportamento
    // atteso di qualunque tendina — un solo listener condiviso su
    // "document" per istanza, coerente con come il resto del sito
    // gestisce menu/tendine (vedi assets/ui/navigazione-barra).
    document.addEventListener("click", function (evento) {
      if (aperto && !contenitore.contains(evento.target)) chiudi();
    });
    document.addEventListener("keydown", function (evento) {
      if (aperto && evento.key === "Escape") {
        chiudi();
        bottone.focus();
      }
    });

    aggiornaTesto();

    return {
      // Sostituisce l'elenco di opzioni disponibili. "opzioni.mantieni"
      // (bool) tiene selezionati i valori di prima che esistono ancora
      // nella nuova lista; "opzioni.preselezionati" (array di value)
      // sceglie da capo cosa segnare — usato per la prima selezione
      // letta dall'URL. Se non si passa nessuno dei due, la nuova
      // lista parte senza nulla selezionato (equivale a "tutte").
      imposta: function (nuoveVoci, opzioniImposta) {
        opzioniImposta = opzioniImposta || {};
        var daTenere = opzioniImposta.mantieni
          ? selezionati()
          : opzioniImposta.preselezionati || [];
        voci = (nuoveVoci || []).map(function (v) {
          return {
            value: v.value,
            label: v.label,
            checked: daTenere.indexOf(v.value) !== -1,
          };
        });
        aggiornaTesto();
        if (aperto) disegnaPannello();
      },
      selezionati: selezionati,
      // Svuota la selezione (equivale a "tutte / nessun filtro").
      azzera: function () {
        voci.forEach(function (v) {
          v.checked = false;
        });
        aggiornaTesto();
        if (aperto) disegnaPannello();
      },
    };
  };
})(window.FiltroMultiplo);
