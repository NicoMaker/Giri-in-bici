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
          ${formatItalianNumber(r.periodi)} ${pluralizza(r.periodi, "anno pedalato", "anni pedalati")}
        </span>
        <span class="podio__dettaglio">
          ${formatItalianNumber(r.corse)} ${pluralizza(r.corse, "corsa", "corse")} in stagione &middot;
          ${formatNumber(r.kmMedi)} km medi/corsa
        </span>
        <span class="podio__dettaglio">
          ${formatItalianNumber(r.kmMediAnno, true)} km medi/stagione &middot;
          ${formatItalianNumber(r.corsePerAnno, true)} corse/stagione
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
    if (ordine === "media-desc" || ordine === "media-asc") {
      const superlativoMedia = ordine === "media-asc" ? "bassa" : "alta";
      return `
        La stagione con la media chilometrica pi&ugrave; ${superlativoMedia} per corsa &egrave;
        <strong>${primo.stagione}</strong>, con
        <strong>${formatNumber(primo.kmMedi)} km</strong> di media
        su ${formatItalianNumber(primo.corse)} ${pluralizza(primo.corse, "corsa", "corse")}.`;
    }
    if (ordine === "corse-desc" || ordine === "corse-asc") {
      const quantita = ordine === "corse-asc" ? "meno" : "pi&ugrave;";
      return `
        La stagione con ${quantita} corse &egrave;
        <strong>${primo.stagione}</strong>, con
        <strong>${formatItalianNumber(primo.corse)} ${pluralizza(primo.corse, "corsa", "corse")}</strong>
        e ${formatItalianNumber(primo.km)} km percorsi.`;
    }
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

  CM.creaClassificaStagioni = function (righe) {
    const massimo = righe.reduce((m, r) => (r.km > m ? r.km : m), 0);
    return righe
      .map((r, i) => {
        const quota = massimo > 0 ? (r.km / massimo) * 100 : 0;
        return `
      <li class="classifica-riga classifica-riga--cliccabile${i < 3 ? " classifica-riga--podio" : ""}">
        <a
          class="classifica-riga__link"
          href="${r.link}"
          aria-label="Vai alla pagina di ${r.stagione}"
        >
          <span class="classifica-riga__posizione">${i + 1}&ordm;</span>
          <span class="classifica-riga__mese"
            >${r.stagione}
            <small class="classifica-riga__sotto"
              >${formatNumber(r.percentuale)} % del totale &middot;
              ${formatItalianNumber(r.periodi)} ${pluralizza(r.periodi, "anno pedalato", "anni pedalati")}</small
            >
            <small class="classifica-riga__sotto"
              >${formatItalianNumber(r.corse)} ${pluralizza(r.corse, "corsa", "corse")} in stagione &middot;
              ${formatNumber(r.kmMedi)} km medi/corsa &middot;
              ${formatItalianNumber(r.kmMediAnno, true)} km medi/stagione</small
            >
          </span>
          <span class="classifica-riga__barra"
            ><span style="--percentuale:${quota}%"></span
          ></span>
          <span class="classifica-riga__km anima-numero">${formatItalianNumber(r.km)} km</span>
          <span class="classifica-riga__percentuale"></span>
        </a>
      </li>`;
      })
      .join("");
  };
})(window.ClassificaMesi);
