// ============================================================
// mesi.js — Podio e classifica della scheda "Mesi"
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  CM.creaPodio = function (righe, totaleAnni) {
    return righe
      .slice(0, 3)
      .map(
        (r, i) => `
      <div class="podio__gradino podio__gradino--${i + 1}">
        <span class="podio__medaglia" aria-hidden="true">${CM.MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.mese}</span>
        <span class="podio__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="podio__dettaglio">
          ${formatNumber(r.percentuale)} % del totale &middot;
          pedalato in ${formatItalianNumber(r.occorrenze)} su ${formatItalianNumber(totaleAnni)} ${pluralizza(totaleAnni, "anno", "anni")} &middot;
          media ${formatItalianNumber(r.kmMedi, true)} km
        </span>
      </div>`,
      )
      .join("");
  };

  CM.creaClassifica = function (righe) {
    const massimo = righe.reduce((m, r) => (r.km > m ? r.km : m), 0);
    return righe
      .map((r, i) => {
        const quota = massimo > 0 ? (r.km / massimo) * 100 : 0;
        return `
      <li class="classifica-riga${i < 3 ? " classifica-riga--podio" : ""}">
        <span class="classifica-riga__posizione">${i + 1}&ordm;</span>
        <span class="classifica-riga__mese"
          >${r.mese}
          <small class="classifica-riga__sotto">
            ${formatNumber(r.percentuale)} % del totale &middot;
            ${formatItalianNumber(r.occorrenze)} ${pluralizza(r.occorrenze, "anno pedalato", "anni pedalati")} &middot;
            media ${formatItalianNumber(r.kmMedi, true)} km
          </small>
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

  CM.creaTitolo = function (righe, ordine) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const primo = righe[0];
    // Gestione dei nuovi ordinamenti per media
    if (ordine === "media-desc") {
      return `
        Il mese con la media chilometrica più alta è
        <strong>${primo.mese}</strong>, con
        <strong>${formatItalianNumber(primo.kmMedi, true)} km</strong> di media
        su ${formatItalianNumber(primo.occorrenze)} ${pluralizza(primo.occorrenze, "anno", "anni")} pedalati.`;
    }
    if (ordine === "media-asc") {
      return `
        Il mese con la media chilometrica più bassa è
        <strong>${primo.mese}</strong>, con
        <strong>${formatItalianNumber(primo.kmMedi, true)} km</strong> di media
        su ${formatItalianNumber(primo.occorrenze)} ${pluralizza(primo.occorrenze, "anno", "anni")} pedalati.`;
    }
    // Per gli altri ordinamenti (km, alfabetico, data) si comporta come prima
    if (ordine !== "desc" && ordine !== "asc") {
      return `
        Primo nell&rsquo;ordine scelto &egrave;
        <strong>${primo.mese}</strong>, con
        <strong>${formatItalianNumber(primo.km)} km</strong> percorsi
        in ${formatItalianNumber(primo.occorrenze)} ${pluralizza(primo.occorrenze, "anno diverso", "anni diversi")}.`;
    }
    const superlativo = ordine === "asc" ? "di meno" : "di pi&ugrave;";
    return `
      Il mese in cui hai pedalato ${superlativo} in assoluto &egrave;
      <strong>${primo.mese}</strong>, con
      <strong>${formatItalianNumber(primo.km)} km</strong> percorsi
      in ${formatItalianNumber(primo.occorrenze)} ${pluralizza(primo.occorrenze, "anno diverso", "anni diversi")}.`;
  };
})(window.ClassificaMesi);