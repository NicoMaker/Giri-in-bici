// ============================================================
// podio.js — Podio e classifica dei 12 mesi, in base al dato scelto
// dal selettore in cima alla pagina.
//
// Riusa le stesse classi CSS (.podio, .classifica-lista) già scritte
// per History/classifica-mesi/podio.js: stesso aspetto, dati diversi
// e in più un selettore che decide con quale numero ordinare.
//
// Dipendenze: JS/utils.js (formatItalianNumber, formatNumber)
// Richiamato da Statistiche/History/statistiche-mensili.js
// ============================================================

window.GraficoTotaleMensile = window.GraficoTotaleMensile || {};

(function (GTM) {
  "use strict";

  const MEDAGLIE = ["🥇", "🥈", "🥉"];

  const ETICHETTE_METRICA = {
    km: "chilometri totali",
    mesiPercorsi: "anni pedalati",
    kmMedio: "km medi mensili",
  };

  function formattaValore(metrica, riga) {
    if (metrica === "mesiPercorsi") {
      return `${formatItalianNumber(riga.mesiPercorsi)} anni`;
    }
    if (metrica === "kmMedio") {
      return `${formatItalianNumber(riga.kmMedio, true)} km`;
    }
    return `${formatItalianNumber(riga.km)} km`;
  }

  // Una copia ordinata: non tocca mai l'array originale, cosi' si puo'
  // sempre ripartire dallo stesso elenco cambiando metrica.
  GTM.ordinaPer = function (righe, metrica) {
    return [...righe].sort((a, b) => (b[metrica] || 0) - (a[metrica] || 0));
  };

  GTM.creaPodio = function (righeOrdinate, metrica) {
    return righeOrdinate
      .slice(0, 3)
      .map(
        (r, i) => `
      <div class="podio__gradino podio__gradino--${i + 1}">
        <span class="podio__medaglia" aria-hidden="true">${MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.mese}</span>
        <span class="podio__km anima-numero">${formattaValore(metrica, r)}</span>
        <span class="podio__dettaglio">
          ${formatItalianNumber(r.km)} km totali &middot;
          ${formatItalianNumber(r.mesiPercorsi)} anni pedalati &middot;
          media ${formatItalianNumber(r.kmMedio, true)} km
        </span>
      </div>`,
      )
      .join("");
  };

  // La lista sotto al podio non aveva ne' "anni pedalati" ne' "media":
  // il podio qui sopra li mostra gia' per i primi tre, qui in fondo
  // mancavano per tutti gli altri nove mesi. Stessa dicitura del
  // podio, cosi' si vede per tutti e 12, qualunque metrica sia scelta
  // per ordinare (km totali, anni pedalati o media).
  GTM.creaClassifica = function (righeOrdinate, metrica) {
    const massimo = righeOrdinate.length ? righeOrdinate[0][metrica] || 0 : 0;
    return righeOrdinate
      .map((r, i) => {
        const valore = r[metrica] || 0;
        const quota = massimo > 0 ? (valore / massimo) * 100 : 0;
        return `
      <li class="classifica-riga${i < 3 ? " classifica-riga--podio" : ""}">
        <span class="classifica-riga__posizione">${i + 1}&ordm;</span>
        <span class="classifica-riga__mese"
          >${r.mese}<small class="classifica-riga__sotto">${formatItalianNumber(r.mesiPercorsi)} anni pedalati &middot; media ${formatItalianNumber(r.kmMedio, true)} km</small></span
        >
        <span class="classifica-riga__barra"
          ><span style="--percentuale:${quota}%"></span
        ></span>
        <span class="classifica-riga__km anima-numero">${formattaValore(metrica, r)}</span>
        <span class="classifica-riga__percentuale">${formatNumber(r.percentuale)} %</span>
      </li>`;
      })
      .join("");
  };

  GTM.creaTitoloPodio = function (righeOrdinate, metrica) {
    if (!righeOrdinate.length || (righeOrdinate[0][metrica] || 0) <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const migliore = righeOrdinate[0];
    const etichetta = ETICHETTE_METRICA[metrica] || "";
    return `
      In base a <strong>${etichetta}</strong>, il mese migliore
      &egrave; <strong>${migliore.mese}</strong>, con
      <strong>${formattaValore(metrica, migliore)}</strong>.`;
  };
})(window.GraficoTotaleMensile);
