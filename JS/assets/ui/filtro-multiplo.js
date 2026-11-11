// ============================================================
// filtro-multiplo.js — Filtro a scelta multipla (pulsante + pannello
// a checkbox) con RICERCA integrata, al posto di un <select> che
// permette una scelta sola.
//
// Usato nella pagina Classifica (Statistiche/History/ClassificaMesi.html)
// per tutti i filtri a tendina:
//   - "Km mensili": Anno e Mese
//   - "Periodi": Stagione
//   - "Giri": Stagione e Anno
//
// Chi chiama non deve sapere nulla dell'HTML del pannello: passa un
// contenitore vuoto già presente in pagina (un <div> con un id, non
// serve altro dentro) e riceve indietro poche funzioni:
//
//   const filtro = FiltroMultiplo.crea(document.getElementById("..."), {
//     etichetta: "Stagione",       // testo del pulsante
//     tutte: "Tutte",              // testo quando nulla è selezionato
//     onCambia: (valori) => { ... },  // richiamata a ogni cambio
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
//
// ------------------------------------------------------------
// RICERCA DENTRO LA TENDINA (regola: "quello che vedi è quello che
// è selezionato")
//
// In cima al pannello c'è un campo di ricerca. Si scrive e la lista
// si restringe (senza distinguere maiuscole/minuscole né accenti, e
// ignorando la punteggiatura: "autunno inverno" trova "Autunno·Inverno").
// Mentre si scrive la selezione si adegua DA SOLA ai risultati:
//
//   - 1 solo risultato     -> resta selezionato SOLO quello;
//   - più risultati        -> si selezionano tutti e soli i risultati
//                             visibili (il resto si deseleziona);
//   - nessun risultato     -> la selezione non cambia (e la lista
//                             dice "Nessun risultato");
//   - campo svuotato       -> la selezione resta com'è: la ricerca è
//                             solo un modo veloce di sceglierla.
//
// Con la ricerca attiva, cliccare un risultato seleziona SOLO quello
// (cliccandolo di nuovo, se è l'unico selezionato, si torna a
// "nessun filtro"); con Ctrl/Cmd/Maiusc + clic invece si aggiunge o
// si toglie senza toccare gli altri.
//
// "Seleziona tutte" e "Deseleziona tutto" agiscono sempre su ciò che
// si vede (sui risultati se c'è una ricerca, su tutta la lista
// altrimenti) e si attivano/disattivano da soli: "Seleziona tutte"
// è spento quando tutto il visibile è già selezionato, "Deseleziona
// tutto" è spento quando nel visibile non c'è nulla di selezionato.
//
// Invio chiude la tendina; Esc svuota prima la ricerca e, se è già
// vuota, chiude. Chiudendo la tendina la ricerca si svuota, così la
// volta dopo si riapre la lista completa con le scelte fatte.
// ============================================================

window.FiltroMultiplo = window.FiltroMultiplo || {};

(function (FM) {
  "use strict";

  var contatoreId = 0;

  // Toglie accenti e maiuscole e trasforma ogni sequenza di caratteri
  // che non sono lettere/numeri in uno spazio: "Autunno·Inverno",
  // "autunno inverno" e "AUTUNNO-INVERNO" diventano tutti uguali.
  function normalizza(testo) {
    return String(testo == null ? "" : testo)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  }

  function escapeHtml(testo) {
    return String(testo)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Su telefono/tablet NON si porta subito il cursore nel campo di
  // ricerca all'apertura: farebbe saltare fuori la tastiera e
  // coprirebbe la lista. Su computer sì, si scrive subito.
  function puntatorePreciso() {
    return !!(
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    );
  }

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
        selezionaTutte: function () {},
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
    var testoRicerca = "";
    var aperto = false;

    contenitore.classList.add("filtro-multiplo");
    contenitore.innerHTML =
      '<button type="button" class="filtro-multiplo__pulsante" aria-haspopup="true" aria-expanded="false" aria-controls="' +
      idPannello +
      '">' +
      (etichetta
        ? '<span class="filtro-multiplo__etichetta">' +
          escapeHtml(etichetta) +
          "</span>"
        : "") +
      '<span class="filtro-multiplo__valore"></span>' +
      '<span class="filtro-multiplo__freccia" aria-hidden="true">▾</span>' +
      "</button>" +
      '<div class="filtro-multiplo__pannello" id="' +
      idPannello +
      '" role="group" hidden>' +
      '<div class="filtro-multiplo__ricerca">' +
      '<input type="search" class="filtro-multiplo__cerca" autocomplete="off" spellcheck="false" placeholder="Cerca' +
      (etichetta ? " " + escapeHtml(etichetta.toLowerCase()) : "") +
      '…" aria-label="Cerca' +
      (etichetta
        ? " " + escapeHtml(etichetta.toLowerCase())
        : " nell\'elenco") +
      '" />' +
      "</div>" +
      '<div class="filtro-multiplo__azioni">' +
      '<button type="button" class="filtro-multiplo__azione" data-azione="tutte">Seleziona tutte</button>' +
      '<button type="button" class="filtro-multiplo__azione" data-azione="nessuna">Deseleziona tutto</button>' +
      "</div>" +
      '<p class="filtro-multiplo__suggerimento" hidden></p>' +
      '<ul class="filtro-multiplo__lista"></ul>' +
      "</div>";

    var bottone = contenitore.querySelector(".filtro-multiplo__pulsante");
    var valoreEl = contenitore.querySelector(".filtro-multiplo__valore");
    var pannello = contenitore.querySelector(".filtro-multiplo__pannello");
    var campoCerca = contenitore.querySelector(".filtro-multiplo__cerca");
    var bottoneTutte = contenitore.querySelector('[data-azione="tutte"]');
    var bottoneNessuna = contenitore.querySelector('[data-azione="nessuna"]');
    var suggerimentoEl = contenitore.querySelector(
      ".filtro-multiplo__suggerimento",
    );
    var listaEl = contenitore.querySelector(".filtro-multiplo__lista");

    // Chiama onCambia tenendo ferma la pagina: se podio/classifica
    // cambiano altezza, il filtro resta nello stesso punto dello
    // schermo (nessun salto). Vale per OGNI menu a tendina del sito.
    function notificaCambio() {
      var prima = contenitore.getBoundingClientRect().top;
      onCambia(selezionati());
      var differenza = contenitore.getBoundingClientRect().top - prima;
      if (differenza) window.scrollBy(0, differenza);
    }

    function selezionati() {
      return voci
        .filter(function (v) {
          return v.checked;
        })
        .map(function (v) {
          return v.value;
        });
    }

    function ricercaAttiva() {
      return normalizza(testoRicerca) !== "";
    }

    // Indici (dentro "voci") delle voci che corrispondono alla ricerca:
    // tutte se il campo è vuoto. Ogni parola scritta deve comparire
    // nella voce, in qualunque ordine.
    function indiciVisibili() {
      var parole = normalizza(testoRicerca).split(" ").filter(Boolean);
      var risultato = [];
      voci.forEach(function (v, i) {
        if (!parole.length) {
          risultato.push(i);
          return;
        }
        var testoVoce = normalizza(v.label);
        var tutteTrovate = parole.every(function (parola) {
          return testoVoce.indexOf(parola) !== -1;
        });
        if (tutteTrovate) risultato.push(i);
      });
      return risultato;
    }

    // Lascia selezionate SOLO le voci indicate. Restituisce true se
    // la selezione è davvero cambiata (per non ridisegnare la pagina
    // a vuoto a ogni lettera digitata).
    function selezionaSoloQueste(indici) {
      var scelti = {};
      indici.forEach(function (i) {
        scelti[i] = true;
      });
      var cambiato = false;
      voci.forEach(function (v, i) {
        var nuovo = !!scelti[i];
        if (v.checked !== nuovo) {
          v.checked = nuovo;
          cambiato = true;
        }
      });
      return cambiato;
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

    // "Seleziona tutte"/"Deseleziona tutto" si accendono e si
    // spengono da soli in base a ciò che si vede in lista.
    function aggiornaAzioni() {
      var visibili = indiciVisibili();
      var tuttiSelezionati =
        visibili.length > 0 &&
        visibili.every(function (i) {
          return voci[i].checked;
        });
      var qualcunoSelezionato = visibili.some(function (i) {
        return voci[i].checked;
      });
      bottoneTutte.disabled = visibili.length === 0 || tuttiSelezionati;
      bottoneNessuna.disabled = !qualcunoSelezionato;

      var mostraSuggerimento = ricercaAttiva() && visibili.length > 1;
      suggerimentoEl.hidden = !mostraSuggerimento;
      if (mostraSuggerimento) {
        suggerimentoEl.textContent = puntatorePreciso()
          ? "Clic su una voce = solo quella · Ctrl/⌘ + clic per aggiungerne altre."
          : "Tocca una voce per sceglierne solo quella.";
      }
    }

    // Ridisegna SOLO l'elenco (il campo di ricerca sta fuori e non si
    // tocca, così non perde il cursore mentre si scrive).
    function disegnaLista() {
      var visibili = indiciVisibili();
      if (!visibili.length) {
        listaEl.innerHTML =
          '<li class="filtro-multiplo__vuoto">' +
          (ricercaAttiva()
            ? "Nessun risultato per «" + escapeHtml(testoRicerca.trim()) + "»."
            : "Nessuna opzione disponibile.") +
          "</li>";
      } else {
        listaEl.innerHTML = visibili
          .map(function (i) {
            var v = voci[i];
            return (
              '<li><label class="filtro-multiplo__voce">' +
              '<input type="checkbox" data-indice="' +
              i +
              '"' +
              (v.checked ? " checked" : "") +
              " />" +
              "<span>" +
              escapeHtml(v.label) +
              "</span>" +
              "</label></li>"
            );
          })
          .join("");
      }
      aggiornaAzioni();
    }

    // Riallinea le caselle già in lista a "voci" senza ridisegnare
    // (mantiene scorrimento e focus della lista).
    function sincronizzaCaselle() {
      Array.prototype.forEach.call(
        listaEl.querySelectorAll('input[type="checkbox"]'),
        function (input) {
          input.checked = voci[Number(input.dataset.indice)].checked;
        },
      );
    }

    function dopoCambioSelezione() {
      sincronizzaCaselle();
      aggiornaTesto();
      aggiornaAzioni();
      notificaCambio();
    }

    function svuotaRicerca() {
      testoRicerca = "";
      campoCerca.value = "";
    }

    function apri() {
      if (bottone.disabled) return;
      aperto = true;
      disegnaLista();
      pannello.hidden = false;
      bottone.setAttribute("aria-expanded", "true");
      contenitore.classList.add("filtro-multiplo--aperto");
      if (puntatorePreciso()) campoCerca.focus({ preventScroll: true });
    }

    function chiudi() {
      aperto = false;
      pannello.hidden = true;
      bottone.setAttribute("aria-expanded", "false");
      contenitore.classList.remove("filtro-multiplo--aperto");
      // La ricerca serve solo a scegliere: alla prossima apertura si
      // rivede la lista intera, con le scelte già fatte.
      svuotaRicerca();
      disegnaLista();
    }

    bottone.addEventListener("click", function (evento) {
      evento.stopPropagation();
      if (aperto) chiudi();
      else apri();
    });

    // --- Ricerca: la selezione segue i risultati ---
    campoCerca.addEventListener("input", function () {
      testoRicerca = campoCerca.value;
      var cambiato = false;
      if (ricercaAttiva()) {
        var visibili = indiciVisibili();
        // Nessun risultato: la selezione resta com'è (un elenco
        // vuoto significherebbe "tutte", cioè l'opposto di ciò che
        // si sta cercando).
        if (visibili.length) cambiato = selezionaSoloQueste(visibili);
      }
      disegnaLista();
      aggiornaTesto();
      if (cambiato) notificaCambio();
    });

    campoCerca.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && campoCerca.value) {
        // Primo Esc: svuota la ricerca. Il secondo (campo già vuoto)
        // arriva al gestore globale e chiude la tendina.
        evento.preventDefault();
        evento.stopPropagation();
        svuotaRicerca();
        disegnaLista();
      } else if (evento.key === "Enter") {
        evento.preventDefault();
        chiudi();
        bottone.focus();
      }
    });

    // --- Click su una voce ---
    listaEl.addEventListener("click", function (evento) {
      var input = evento.target;
      if (!input || input.type !== "checkbox") return;
      var indice = Number(input.dataset.indice);
      var voce = voci[indice];
      if (!voce) return;
      var aggiungi = evento.ctrlKey || evento.metaKey || evento.shiftKey;

      if (ricercaAttiva() && !aggiungi) {
        // Con la ricerca attiva un clic sceglie SOLO quella voce; se
        // era già l'unica selezionata, torna a "nessun filtro".
        var eraSoltanto = voce.checked && selezionati().length === 1;
        selezionaSoloQueste(eraSoltanto ? [] : [indice]);
      } else {
        voce.checked = input.checked;
      }
      dopoCambioSelezione();
    });

    // --- Seleziona tutte / Deseleziona tutto: solo sul visibile ---
    bottoneTutte.addEventListener("click", function (evento) {
      evento.stopPropagation();
      indiciVisibili().forEach(function (i) {
        voci[i].checked = true;
      });
      dopoCambioSelezione();
    });
    bottoneNessuna.addEventListener("click", function (evento) {
      evento.stopPropagation();
      indiciVisibili().forEach(function (i) {
        voci[i].checked = false;
      });
      dopoCambioSelezione();
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
    disegnaLista();

    return {
      // Sostituisce l'elenco di opzioni disponibili. "opzioni.mantieni"
      // (bool) tiene selezionati i valori di prima che esistono ancora
      // nella nuova lista; "opzioni.preselezionati" (array di value)
      // sceglie da capo cosa segnare — usato per la prima selezione
      // letta dall'URL. Se non si passa nessuno dei due, la nuova
      // lista parte senza nulla selezionato (equivale a "tutte").
      // La ricerca si svuota: l'elenco è cambiato, un testo scritto
      // sulla lista precedente non avrebbe più senso.
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
        svuotaRicerca();
        aggiornaTesto();
        disegnaLista();
      },
      selezionati: selezionati,
      // Seleziona tutte le voci, una per una (lo stato iniziale delle
      // schede Km mensili, Periodi e Giri). Non richiama onCambia.
      selezionaTutte: function () {
        voci.forEach(function (v) {
          v.checked = true;
        });
        svuotaRicerca();
        aggiornaTesto();
        disegnaLista();
      },
      // Svuota la selezione (equivale a "tutte / nessun filtro").
      azzera: function () {
        voci.forEach(function (v) {
          v.checked = false;
        });
        svuotaRicerca();
        aggiornaTesto();
        disegnaLista();
      },
    };
  };
})(window.FiltroMultiplo);
