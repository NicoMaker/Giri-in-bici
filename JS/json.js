// ============================================================
// json.js — L'unico posto in cui il sito legge un file JSON
//
// Prima ogni script si scriveva il suo fetch: dodici copie della
// stessa cosa, ognuna con un messaggio d'errore diverso. Ora c'e'
// solo questo file e tutti lo richiamano.
//
// Due modi di leggere, a seconda di cosa deve succedere se il file
// non arriva:
//
//   await Json.leggi(percorso)
//     Solleva un errore. Da usare quando senza quel file la pagina
//     non ha senso: chi chiama lo intercetta con try/catch.
//
//   await Json.leggiOppureNull(percorso)
//     Scrive l'errore in console e torna null, senza fermare nulla.
//     Da usare quando un pezzo puo' mancare e il resto va avanti.
//
//   await Json.leggiTutti([percorsi])
//     Legge piu' file insieme, non uno dopo l'altro.
//
// Nessuna dipendenza. Va caricato prima degli altri script.
// ============================================================

window.Json = window.Json || {};

(function (J) {
  "use strict";

  J.leggi = async function (percorso) {
    const risposta = await fetch(percorso);
    if (!risposta.ok) {
      throw new Error(`HTTP ${risposta.status} nel leggere ${percorso}`);
    }
    return risposta.json();
  };

  J.leggiOppureNull = async function (percorso) {
    try {
      return await J.leggi(percorso);
    } catch (errore) {
      console.error(`Errore nel caricamento di ${percorso}:`, errore);
      return null;
    }
  };

  J.leggiTutti = function (percorsi) {
    return Promise.all(percorsi.map((p) => J.leggi(p)));
  };

  // Il nome vecchio resta valido: era usato in mezzo sito e continua
  // a funzionare senza cambiare le chiamate una per una.
  window.fetchJSON = J.leggi;
})(window.Json);
