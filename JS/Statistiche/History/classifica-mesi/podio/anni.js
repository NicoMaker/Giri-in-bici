// ============================================================
// anni.js — Markup del podio e della classifica della scheda "Anni".
// Dipendenze: JS/utils.js (formatItalianNumber, formatNumber),
//             podio/comune.js (CM.MEDAGLIE)
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  // Come sopra per gli altri podi, ma ogni gradino è un link che porta
  // alla pagina di quell'anno (Statistiche/Anni/2020.html ecc.): usato
  // solo nella scheda "Anni", dove ogni voce è già un anno intero e
  // selezionarla ha un posto preciso dove andare.
  CM.creaPodioAnni = function (righe) {
    return righe
      .slice(0, 3)
      .map(
        (r, i) => `
      <a
        class="podio__gradino podio__gradino--${i + 1}"
        href="../Anni/${r.anno}.html"
        aria-label="Vai alle statistiche del ${r.nome}"
      >
        <span class="podio__medaglia" aria-hidden="true">${CM.MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.nome}</span>
        <span class="podio__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="podio__dettaglio">${formatNumber(r.percentuale)} % del totale</span>
      </a>`,
      )
      .join("");
  };

  // Stessa riga di classifica-riga già usata per periodi e record mesi,
  // ma qui ogni voce è un anno intero (es. "2024") e ha un posto preciso
  // dove andare: l'intera riga è un link a quella pagina-anno.
  CM.creaClassificaAnni = function (righe) {
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
          href="../Anni/${r.anno}.html"
          aria-label="Vai alle statistiche del ${r.nome}"
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

  CM.creaTitoloAnni = function (righe, ordine) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const primo = righe[0];
    const superlativo = ordine === "asc" ? "di meno" : "di pi&ugrave;";
    return `
      L'anno in cui hai pedalato ${superlativo} in assoluto &egrave;
      <strong>${primo.nome}</strong>, con
      <strong>${formatItalianNumber(primo.km)} km</strong> percorsi.`;
  };
})(window.ClassificaMesi);
