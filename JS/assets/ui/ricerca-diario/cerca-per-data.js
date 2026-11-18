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

(() => {
  "use strict";
  let ultimiRisultati = null;
  let bottoniOrdine = null;
  let postiRicerca = [];

  const nuovaRigaData = () => {
    const riga = document.createElement("div");
    riga.className = "riga-data-input";

    const input = document.createElement("input");
    input.type = "date";
    input.setAttribute("aria-label", "Data aggiuntiva");
    input.min = "2020-05-30";
    input.max = new Date().toISOString().slice(0, 10);

    const rimuovi = document.createElement("button");
    rimuovi.type = "button";
    rimuovi.className = "rimuovi-data";
    rimuovi.setAttribute("aria-label", "Rimuovi questa data");
    rimuovi.textContent = "×";
    rimuovi.addEventListener("click", () => {
      riga.remove();
    });

    riga.appendChild(input);
    riga.appendChild(rimuovi);
    return riga;
  };

  const nuovaRigaPosto = () => {
    const riga = document.createElement("div");
    riga.className = "riga-data-input";

    const input = document.createElement("input");
    input.type = "text";
    input.setAttribute("aria-label", "Posto aggiuntivo");
    input.placeholder = "Es. Gemona, Lignano\u2026";

    const rimuovi = document.createElement("button");
    rimuovi.type = "button";
    rimuovi.className = "rimuovi-data";
    rimuovi.setAttribute("aria-label", "Rimuovi questo posto");
    rimuovi.textContent = "×";
    rimuovi.addEventListener("click", () => {
      riga.remove();
    });

    riga.appendChild(input);
    riga.appendChild(rimuovi);
    return riga;
  };

  const raccogliDate = () => {
    const input = document.querySelectorAll(
      '#contenitoreDate input[type="date"]',
    );
    const valori = [];
    input.forEach((el) => {
      if (el.value) valori.push(el.value);
    });
    return valori;
  };

  const raccogliPosti = () => {
    const input = document.querySelectorAll(
      '#contenitorePostiData input[type="text"]',
    );
    const valori = [];
    input.forEach((el) => {
      const v = el.value.trim();
      if (v) valori.push(v);
    });
    return valori;
  };

  const analizzaData = (valoreInput) => {
    const parti = valoreInput.split("-");
    const anno = parseInt(parti[0], 10);
    const meseIndice = parseInt(parti[1], 10) - 1;
    const giorno = parseInt(parti[2], 10);
    if (!anno || meseIndice < 0 || meseIndice > 11 || !giorno) return null;

    const etichettaGiorno =
      String(giorno).padStart(2, "0") + " " + window.DatiGiri.MESI[meseIndice];
    return {
      anno: anno,
      meseIndice: meseIndice,
      etichettaGiorno: etichettaGiorno,
      etichettaCompleta: etichettaGiorno + " " + anno,
    };
  };

  const filtraPerPosti = (risultati, posti) => {
    if (!posti.length) return risultati;

    const queryNormalizzate = posti.map((v) => window.DatiGiri.normalizza(v));

    return risultati.filter((u) => {
      const postoNormalizzato = window.DatiGiri.normalizza(u.postoTesto);
      return queryNormalizzate.some((q) => postoNormalizzato.indexOf(q) !== -1);
    });
  };

  const cercaGiri = async (valoriDate, valoriPosti) => {
    const contenitore = document.getElementById("risultatiCercaData");
    const messaggio = document.getElementById("messaggioCercaData");
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
    const bersagli = [];
    const etichetteViste = {};
    let nonValide = 0;

    valoriDate.forEach((v) => {
      const b = analizzaData(v);
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
    const candidatiPerUrl = {};
    bersagli.forEach((b) => {
      window.DatiGiri.candidatiPerData(b.meseIndice, b.anno).forEach((c) => {
        candidatiPerUrl[c.url] = c;
      });
    });
    const candidati = Object.keys(candidatiPerUrl).map(
      (url) => candidatiPerUrl[url],
    );

    const tutteLeUscite = await window.DatiGiri.leggiUscite(candidati);

    let risultati = [];
    const bersagliSenzaGiri = [];
    bersagli.forEach((b) => {
      const trovati = tutteLeUscite.filter(
        (u) => u.data === b.etichettaGiorno && u.anno === b.anno,
      );
      if (trovati.length) {
        risultati = risultati.concat(trovati);
      } else {
        bersagliSenzaGiri.push(b.etichettaCompleta);
      }
    });

    risultati.sort((a, b) => a.chiaveData - b.chiaveData);

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
  };

  const mostraOrdinati = () => {
    const contenitore = document.getElementById("risultatiCercaData");
    const messaggio = document.getElementById("messaggioCercaData");
    if (!contenitore || !ultimiRisultati) return;

    const criterio = bottoniOrdine ? bottoniOrdine.leggi() : "data-recente";
    contenitore.innerHTML = window.DatiGiri.elencoRisultati(
      window.DatiGiri.ordina(ultimiRisultati, criterio),
    );
  };

  const inizializza = () => {
    const form = document.getElementById("formCercaData");
    const input = document.getElementById("dataGiro");
    const contenitoreDate = document.getElementById("contenitoreDate");
    const bottoneAggiungiData = document.getElementById("aggiungiData");
    const contenitorePosti = document.getElementById("contenitorePostiData");
    const bottoneAggiungiPosto = document.getElementById("aggiungiPostoData");
    if (!form || !input) return;

    // Non si puo' cercare prima dell'inizio del diario, ne' dopo oggi.
    input.min = "2020-05-30";
    input.max = new Date().toISOString().slice(0, 10);

    if (bottoneAggiungiData && contenitoreDate) {
      bottoneAggiungiData.addEventListener("click", () => {
        contenitoreDate.appendChild(nuovaRigaData());
      });
    }

    if (bottoneAggiungiPosto && contenitorePosti) {
      bottoneAggiungiPosto.addEventListener("click", () => {
        contenitorePosti.appendChild(nuovaRigaPosto());
      });
    }

    bottoniOrdine = window.DatiGiri.inizializzaBottoniOrdine(
      "criterioOrdinamentoData",
      mostraOrdinati,
    );

    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      cercaGiri(raccogliDate(), raccogliPosti());
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inizializza);
  } else {
    inizializza();
  }
})();
