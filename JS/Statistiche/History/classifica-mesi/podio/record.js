// ============================================================
// record.js — Markup del podio e della classifica della scheda
// "Record" (mese per mese, ogni anno separato).
// Dipendenze: JS/utils.js (formatItalianNumber, formatNumber),
//             podio/comune.js (CM.MEDAGLIE)
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  // Podio "semplice": solo nome, km e percentuale — usato per elenchi di
  // singole voci (un mese di un anno) dove non ha senso una media o un
  // conteggio di occorrenze.
  CM.creaPodioSemplice = function (righe) {
    return righe
      .slice(0, 3)
      .map(
        (r, i) => `
      <div class="podio__gradino podio__gradino--${i + 1}">
        <span class="podio__medaglia" aria-hidden="true">${CM.MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.nome}</span>
        <span class="podio__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="podio__dettaglio">${formatNumber(r.percentuale)} % del totale</span>
      </div>`,
      )
      .join("");
  };

  // Stessa riga della classifica completa, ma qui il "nome" è già
  // "Mese + anno" (es. "Settembre 2024"), così un mese di un anno si
  // confronta alla pari con lo stesso mese di un altro anno.
  CM.creaRecordMesi = function (righe) {
    // Stesso motivo di creaClassifica in podio/mesi.js: massimo vero,
    // non il primo elemento, per restare corretto anche con l'ordine
    // invertito dal controllo "Ordine".
    const massimo = righe.reduce((m, r) => (r.km > m ? r.km : m), 0);
    return righe
      .map((r, i) => {
        const quota = massimo > 0 ? (r.km / massimo) * 100 : 0;
        return `
      <li class="classifica-riga${i < 3 ? " classifica-riga--podio" : ""}">
        <span class="classifica-riga__posizione">${i + 1}&ordm;</span>
        <span class="classifica-riga__mese">${r.nome}</span>
        <span class="classifica-riga__barra"
          ><span style="--percentuale:${quota}%"></span
        ></span>
        <span class="classifica-riga__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="classifica-riga__percentuale">${formatNumber(r.percentuale)} %</span>
      </li>`;
      })
      .join("");
  };

  CM.creaTitoloRecordMesi = function (righe, ordine) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const primo = righe[0];
    const superlativo = ordine === "asc" ? "meno" : "pi&ugrave;";
    return `
      Il singolo mese con ${superlativo} chilometri in assoluto &egrave;
      <strong>${primo.nome}</strong>, con
      <strong>${formatItalianNumber(primo.km)} km</strong> percorsi.`;
  };
})(window.ClassificaMesi);
