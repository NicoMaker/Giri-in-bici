// ============================================================
// record.js — Podio e classifica della scheda "Record"
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

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

  CM.creaRecordMesi = function (righe) {
    const massimo = righe.reduce((m, r) => (r.km > m ? r.km : m), 0);
    return righe
      .map((r, i) => {
        const quota = massimo > 0 ? (r.km / massimo) * 100 : 0;
        return `
      <li class="classifica-riga${i < 3 ? " classifica-riga--podio" : ""}">
        <span class="classifica-riga__posizione">${i + 1}&ordm;</span>
        <span class="classifica-riga__mese"
          >${r.nome}
          <small class="classifica-riga__sotto">${formatNumber(r.percentuale)} % del totale</small>
        </span>
        <span class="classifica-riga__barra"
          ><span style="--percentuale:${quota}%"></span
        ></span>
        <span class="classifica-riga__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="classifica-riga__percentuale"></span>
      </li>`;
      })
      .join("");
  };

  CM.creaTitoloRecordMesi = function (righe, ordine) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const primo = righe[0];
    if (ordine !== "desc" && ordine !== "asc") {
      return `
        Il primo nell&rsquo;ordine scelto &egrave;
        <strong>${primo.nome}</strong>, con
        <strong>${formatItalianNumber(primo.km)} km</strong> percorsi.`;
    }
    const superlativo = ordine === "asc" ? "meno" : "pi&ugrave;";
    return `
      Il singolo mese con ${superlativo} chilometri in assoluto &egrave;
      <strong>${primo.nome}</strong>, con
      <strong>${formatItalianNumber(primo.km)} km</strong> percorsi.`;
  };
})(window.ClassificaMesi);
