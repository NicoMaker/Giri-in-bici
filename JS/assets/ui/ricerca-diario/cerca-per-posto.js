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

(() => {
  "use strict";
  let ultimiRisultati = null;
  let bottoniOrdine = null;

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

  const raccogliPosti = () => {
    const input = document.querySelectorAll(
      '#contenitorePosti input[type="text"]',
    );
    const valori = [];
    input.forEach((el) => {
      const v = el.value.trim();
      if (v) valori.push(v);
    });
    return valori;
  };

  const mostraOrdinati = () => {
    const contenitore = document.getElementById("risultatiCercaPosto");
    if (!contenitore || !ultimiRisultati) return;
    const criterio = bottoniOrdine ? bottoniOrdine.leggi() : "alfabetico";
    contenitore.innerHTML = window.DatiGiri.elencoRisultati(
      window.DatiGiri.ordina(ultimiRisultati, criterio),
    );
  };

  const cercaPosto = async (valori) => {
    const contenitore = document.getElementById("risultatiCercaPosto");
    const messaggio = document.getElementById("messaggioCercaPosto");
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

    const candidati = await window.DatiGiri.tuttiICandidati();
    const tutteLeUscite = await window.DatiGiri.leggiUscite(candidati);

    const queryNormalizzate = valori.map((v) => window.DatiGiri.normalizza(v));

    const risultati = tutteLeUscite.filter((u) => {
      const postoNormalizzato = window.DatiGiri.normalizza(u.postoTesto);
      return queryNormalizzate.some((q) => postoNormalizzato.indexOf(q) !== -1);
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
  };

  const inizializza = () => {
    const form = document.getElementById("formCercaPosto");
    const input = document.getElementById("postoGiro");
    const contenitorePosti = document.getElementById("contenitorePosti");
    const bottoneAggiungi = document.getElementById("aggiungiPosto");
    if (!form || !input) return;

    if (bottoneAggiungi && contenitorePosti) {
      bottoneAggiungi.addEventListener("click", () => {
        contenitorePosti.appendChild(nuovaRigaPosto());
      });
    }

    bottoniOrdine = window.DatiGiri.inizializzaBottoniOrdine(
      "criterioOrdinamento",
      mostraOrdinati,
    );

    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      cercaPosto(raccogliPosti());
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inizializza);
  } else {
    inizializza();
  }
})();
