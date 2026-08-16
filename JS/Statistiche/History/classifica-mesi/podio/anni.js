// ============================================================
// anni.js — Podio e classifica della scheda "Anni"
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

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

  CM.creaClassificaAnni = function (righe) {
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
          <span class="classifica-riga__mese"
            >${r.nome}
            <small class="classifica-riga__sotto">${formatNumber(r.percentuale)} % del totale</small>
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

  CM.creaTitoloAnni = function (righe, ordine) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const primo = righe[0];
    if (ordine !== "desc" && ordine !== "asc") {
      return `
        Primo nell&rsquo;ordine scelto &egrave;
        <strong>${primo.nome}</strong>, con
        <strong>${formatItalianNumber(primo.km)} km</strong> percorsi.`;
    }
    const superlativo = ordine === "asc" ? "di meno" : "di pi&ugrave;";
    return `
      L'anno in cui hai pedalato ${superlativo} in assoluto &egrave;
      <strong>${primo.nome}</strong>, con
      <strong>${formatItalianNumber(primo.km)} km</strong> percorsi.`;
  };
})(window.ClassificaMesi);
