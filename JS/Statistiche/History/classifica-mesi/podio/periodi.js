// ============================================================
// periodi.js — Markup del podio e della classifica della scheda
// "Periodi" (confronto fra ogni singolo periodo).
// Dipendenze: JS/utils.js (formatItalianNumber, formatNumber),
//             podio/comune.js (CM.MEDAGLIE)
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  // Come il podio delle stagioni: ogni gradino è un link che porta alla
  // pagina di quel periodo esatto (es. ../../Estate/2022.html,
  // ../../Primavera/2024.html), con lo stesso bottone "Vai al periodo"
  // sempre visibile in fondo.
  CM.creaPodioPeriodi = function (righe) {
    return righe
      .slice(0, 3)
      .map(
        (r, i) => `
      <a
        class="podio__gradino podio__gradino--${i + 1}"
        href="${r.link}"
        aria-label="Vai alla pagina di ${r.nome}"
      >
        <span class="podio__medaglia" aria-hidden="true">${CM.MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.nome}</span>
        <span class="podio__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="podio__dettaglio">${formatNumber(r.percentuale)} % del totale</span>
        <span class="podio__vai"
          >Vai al periodo
          <span class="freccia" aria-hidden="true">&rarr;</span></span
        >
      </a>`,
      )
      .join("");
  };

  // Stessa identica riga della classifica dei mesi, ma qui il "nome"
  // è già "Stagione + anno" (es. "Estate 2020"), così un periodo di
  // una stagione si confronta alla pari con un periodo di un'altra
  // (es. Estate 2020 contro Autunno · Inverno 2020-2021). Ogni riga è
  // già un link verso la pagina di quel periodo (stesso comportamento
  // di creaClassificaAnni, qui applicato ai periodi).
  CM.creaClassificaPeriodi = function (righe) {
    // Stesso motivo di creaClassifica: massimo vero, non il primo
    // elemento (che con l'ordine invertito sarebbe il più basso).
    const massimo = righe.reduce((m, r) => (r.km > m ? r.km : m), 0);
    return righe
      .map((r, i) => {
        const quota = massimo > 0 ? (r.km / massimo) * 100 : 0;
        return `
      <li class="classifica-riga classifica-riga--cliccabile${i < 3 ? " classifica-riga--podio" : ""}">
        <a
          class="classifica-riga__link"
          href="${r.link}"
          aria-label="Vai alla pagina di ${r.nome}"
        >
          <span class="classifica-riga__posizione">${i + 1}&ordm;</span>
          <span class="classifica-riga__mese">${r.nome}</span>
          <span class="classifica-riga__barra"
            ><span style="--percentuale:${quota}%"></span
          ></span>
          <span class="classifica-riga__km anima-numero">${formatItalianNumber(r.km)} km</span>
          <span class="classifica-riga__percentuale">${formatNumber(r.percentuale)} %</span>
        </a>
      </li>`;
      })
      .join("");
  };

  CM.creaTitoloPeriodi = function (righe, ordine) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const primo = righe[0];
    const superlativo = ordine === "asc" ? "meno" : "pi&ugrave;";
    return `
      Il singolo periodo con ${superlativo} chilometri in assoluto &egrave;
      <strong>${primo.nome}</strong>, con
      <strong>${formatItalianNumber(primo.km)} km</strong> percorsi.`;
  };
})(window.ClassificaMesi);
