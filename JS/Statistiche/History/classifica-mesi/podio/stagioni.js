// ============================================================
// stagioni.js — Markup del podio della scheda "Stagioni".
// Dipendenze: JS/utils.js (formatItalianNumber, formatNumber),
//             podio/comune.js (CM.MEDAGLIE)
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  // Le stagioni sono solo tre, quindi il podio è già "tutte quante":
  // non serve una lista aggiuntiva sotto, come invece per i dodici mesi.
  // Ogni gradino è un link che porta alla pagina di quella stagione
  // (Estate.html, Primavera.html, Autunno_Inverno.html), stesso
  // comportamento già usato per il podio degli anni (creaPodioAnni), con
  // in più un bottone "Vai alla stagione" sempre visibile in fondo alla
  // card (stesso stile di .colore__vai-a, già usato in Statistiche/
  // stagioni.html), così si vede subito che si può aprire, non solo
  // passandoci sopra col mouse.
  CM.creaPodioStagioni = function (righe) {
    return righe
      .map(
        (r, i) => `
      <a
        class="podio__gradino podio__gradino--${i + 1}"
        href="${r.link}"
        aria-label="Vai alla pagina di ${r.stagione}"
      >
        <span class="podio__medaglia" aria-hidden="true">${CM.MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.stagione}</span>
        <span class="podio__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="podio__dettaglio">
          ${formatNumber(r.percentuale)} % del totale &middot;
          ${formatItalianNumber(r.periodi)} ${pluralizza(r.periodi, "anno pedalato", "anni pedalati")} &middot;
          media ${formatItalianNumber(r.kmMedi, true)} km
        </span>
        <span class="podio__vai"
          >Vai alla stagione
          <span class="freccia" aria-hidden="true">&rarr;</span></span
        >
      </a>`,
      )
      .join("");
  };

  CM.creaTitoloStagioni = function (righe, ordine) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const primo = righe[0];
    const superlativo = ordine === "asc" ? "di meno" : "di pi&ugrave;";
    return `
      La stagione in cui pedali ${superlativo} &egrave;
      <strong>${primo.stagione}</strong>, con
      <strong>${formatItalianNumber(primo.km)} km</strong> percorsi
      in totale.`;
  };
})(window.ClassificaMesi);
