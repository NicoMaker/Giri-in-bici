// ============================================================
// json.js — L'unico posto in cui il sito legge un file JSON
//
// Prima ogni script si scriveva il suo fetch: dodici copie della
// stessa cosa, ognuna con un messaggio d'errore diverso. Ora c'e'
// solo questo file e tutti lo richiamano.
//
// Tutti i dati vivono in un'unica cartella "json/" alla radice del
// sito. Per farla funzionare da qualsiasi pagina, a qualunque
// profondita', sia online che aprendo i file in locale, questo file
// calcola da solo dove si trova la radice del sito partendo dalla
// propria posizione (vive sempre in "js/json.js"). Cosi' i percorsi
// che gli si passano si scrivono sempre allo stesso modo, a partire
// dalla radice: "json/Bici/bici.json", non "../../Js/bici.json".
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

  // document.currentScript e' valido solo durante l'esecuzione
  // sincrona di questo file, quindi il valore va catturato subito qui
  // in cima e non dentro le funzioni async piu' sotto.
  const percorsoScript = document.currentScript && document.currentScript.src;
  const RADICE_SITO = percorsoScript
    ? percorsoScript.replace(/js\/json\.js(?:[?#].*)?$/, "")
    : "";

  function risolvi(percorso) {
    // Lascia stare i percorsi gia' assoluti (http://, https://, //, /...)
    if (
      /^([a-z][a-z0-9+.-]*:)?\/\//i.test(percorso) ||
      percorso.startsWith("/")
    ) {
      return percorso;
    }
    return RADICE_SITO ? RADICE_SITO + percorso : percorso;
  }

  J.leggi = async function (percorso) {
    const url = risolvi(percorso);
    const risposta = await fetch(url);
    if (!risposta.ok) {
      throw new Error(`HTTP ${risposta.status} nel leggere ${url}`);
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
