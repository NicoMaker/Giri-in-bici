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
    // La frase "hai pedalato di più/meno" ha senso solo quando
    // l'ordine è per km (desc/asc): con alfabetico o per data il
    // primo della lista non è affatto il record, quindi qui si
    // resta neutri e si mostra solo il primo della lista scelta.
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
