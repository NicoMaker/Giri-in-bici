// ============================================================
// stagioni.js — Podio della scheda "Stagioni"
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

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
    if (ordine !== "desc" && ordine !== "asc") {
      return `
        Prima nell&rsquo;ordine scelto &egrave;
        <strong>${primo.stagione}</strong>, con
        <strong>${formatItalianNumber(primo.km)} km</strong> percorsi
        in totale.`;
    }
    const superlativo = ordine === "asc" ? "di meno" : "di pi&ugrave;";
    return `
      La stagione in cui pedali ${superlativo} &egrave;
      <strong>${primo.stagione}</strong>, con
      <strong>${formatItalianNumber(primo.km)} km</strong> percorsi
      in totale.`;
  };
})(window.ClassificaMesi);
