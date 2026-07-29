// ============================================================
// podio.js — Markup del podio dei primi tre mesi e della
// classifica completa
// Dipendenze: JS/utils.js (formatItalianNumber, formatNumber)
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  const MEDAGLIE = ["🥇", "🥈", "🥉"];

  // Solo i tre gradini: vanno dentro #podio, che nell'HTML è già la
  // griglia (classe .podio), così ogni gradino resta figlio diretto e
  // l'entrata scaglionata di contenuti-animati.js li anima uno a uno.
  CM.creaPodio = function (righe, totaleAnni) {
    return righe
      .slice(0, 3)
      .map(
        (r, i) => `
      <div class="podio__gradino podio__gradino--${i + 1}">
        <span class="podio__medaglia" aria-hidden="true">${MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.mese}</span>
        <span class="podio__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="podio__dettaglio">
          ${formatNumber(r.percentuale)} % del totale &middot;
          pedalato in ${formatItalianNumber(r.occorrenze)} su ${formatItalianNumber(totaleAnni)} anni &middot;
          media ${formatItalianNumber(r.kmMedi, true)} km
        </span>
      </div>`,
      )
      .join("");
  };

  // Solo le righe <li>: vanno dentro #classifica, che nell'HTML è già
  // la lista (<ol class="classifica-lista">), stesso motivo di sopra.
  CM.creaClassifica = function (righe) {
    const massimo = righe.length ? righe[0].km : 0;
    return righe
      .map((r, i) => {
        const quota = massimo > 0 ? (r.km / massimo) * 100 : 0;
        return `
      <li class="classifica-riga${i < 3 ? " classifica-riga--podio" : ""}">
        <span class="classifica-riga__posizione">${i + 1}&ordm;</span>
        <span class="classifica-riga__mese">${r.mese}</span>
        <span class="classifica-riga__barra"
          ><span style="--percentuale:${quota}%"></span
        ></span>
        <span class="classifica-riga__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="classifica-riga__percentuale">${formatNumber(r.percentuale)} %</span>
      </li>`;
      })
      .join("");
  };

  // Frase di apertura sopra il podio
  CM.creaTitolo = function (righe) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const migliore = righe[0];
    return `
      Il mese in cui hai pedalato di pi&ugrave; in assoluto &egrave;
      <strong>${migliore.mese}</strong>, con
      <strong>${formatItalianNumber(migliore.km)} km</strong> percorsi
      in ${formatItalianNumber(migliore.occorrenze)} anni diversi.`;
  };

  // ---------- Stagioni: stesso podio, dati e frase per le stagioni ----------
  // Le stagioni sono solo tre, quindi il podio è già "tutte quante":
  // non serve una lista aggiuntiva sotto, come invece per i dodici mesi.
  CM.creaPodioStagioni = function (righe) {
    return righe
      .map(
        (r, i) => `
      <div class="podio__gradino podio__gradino--${i + 1}">
        <span class="podio__medaglia" aria-hidden="true">${MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.stagione}</span>
        <span class="podio__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="podio__dettaglio">
          ${formatNumber(r.percentuale)} % del totale &middot;
          ${formatItalianNumber(r.periodi)} anni pedalati &middot;
          media ${formatItalianNumber(r.kmMedi, true)} km
        </span>
      </div>`,
      )
      .join("");
  };

  CM.creaTitoloStagioni = function (righe) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const migliore = righe[0];
    return `
      La stagione in cui pedali di pi&ugrave; &egrave;
      <strong>${migliore.stagione}</strong>, con
      <strong>${formatItalianNumber(migliore.km)} km</strong> percorsi
      in totale.`;
  };
})(window.ClassificaMesi);
