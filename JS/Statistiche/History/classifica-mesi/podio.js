// ============================================================
// podio.js — Markup del podio dei primi tre mesi e della
// classifica completa
// Dipendenze: JS/utils.js (formatItalianNumber, formatNumber)
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  const MEDAGLIE = ["🥇", "🥈", "🥉"];

  // Podio "semplice": solo nome, km e percentuale — usato per elenchi di
  // singole voci (un mese di un anno, un periodo di una stagione) dove
  // non ha senso una media o un conteggio di occorrenze.
  CM.creaPodioSemplice = function (righe) {
    return righe
      .slice(0, 3)
      .map(
        (r, i) => `
      <div class="podio__gradino podio__gradino--${i + 1}">
        <span class="podio__medaglia" aria-hidden="true">${MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.nome}</span>
        <span class="podio__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="podio__dettaglio">${formatNumber(r.percentuale)} % del totale</span>
      </div>`,
      )
      .join("");
  };

  // Come sopra, ma ogni gradino è un link che porta alla pagina di
  // quell'anno (Statistiche/Anni/2020.html ecc.): usato solo nella
  // scheda "Anni", dove ogni voce è già un anno intero e selezionarlo
  // ha un posto preciso dove andare.
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
        <span class="podio__medaglia" aria-hidden="true">${MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.nome}</span>
        <span class="podio__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="podio__dettaglio">${formatNumber(r.percentuale)} % del totale</span>
      </a>`,
      )
      .join("");
  };

  // Solo i tre gradini: vanno dentro #podio, che nell'HTML è già la
  // griglia (classe .podio), così ogni gradino resta figlio diretto e
  // l'entrata scaglionata di contenuti-animati.js li anima uno a uno.
  CM.creaPodio = function (righe, totaleAnni) {
    return righe
      .slice(0, 3)
      .map(
        (r, i) => `
      <div class="podio__gradino podio__gradino--${i + 1}">
        <span class="podio__medaglia" aria-hidden="true">${MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.mese}</span>
        <span class="podio__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="podio__dettaglio">
          ${formatNumber(r.percentuale)} % del totale &middot;
          pedalato in ${formatItalianNumber(r.occorrenze)} su ${formatItalianNumber(totaleAnni)} anni &middot;
          media ${formatItalianNumber(r.kmMedi, true)} km
        </span>
      </div>`,
      )
      .join("");
  };

  // Solo le righe <li>: vanno dentro #classifica, che nell'HTML è già
  // la lista (<ol class="classifica-lista">), stesso motivo di sopra.
  // La "media" (km medi negli anni in cui quel mese è stato pedalato)
  // era già nel podio dei primi tre, qui sotto in fondo alla lista
  // completa mancava: stessa dicitura, cosi' si vede per tutti e 12.
  CM.creaClassifica = function (righe) {
    const massimo = righe.length ? righe[0].km : 0;
    return righe
      .map((r, i) => {
        const quota = massimo > 0 ? (r.km / massimo) * 100 : 0;
        return `
      <li class="classifica-riga${i < 3 ? " classifica-riga--podio" : ""}">
        <span class="classifica-riga__posizione">${i + 1}&ordm;</span>
        <span class="classifica-riga__mese"
          >${r.mese}<small class="classifica-riga__sotto">${formatItalianNumber(r.occorrenze)} anni pedalati &middot; media ${formatItalianNumber(r.kmMedi, true)} km</small></span
        >
        <span class="classifica-riga__barra"
          ><span style="--percentuale:${quota}%"></span
        ></span>
        <span class="classifica-riga__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="classifica-riga__percentuale">${formatNumber(r.percentuale)} %</span>
      </li>`;
      })
      .join("");
  };

  // Riga di chiusura con il totale: uguale nell'aspetto alle righe
  // normali, ma senza numero di posizione né barra, cosi' si legge
  // subito come somma finale e non come un'altra voce in classifica.
  CM.creaRigaTotale = function (totaleKm, etichetta) {
    return `
      <li class="classifica-riga classifica-riga--totale">
        <span class="classifica-riga__posizione" aria-hidden="true">&sum;</span>
        <span class="classifica-riga__mese">Totale ${etichetta}</span>
        <span class="classifica-riga__barra"></span>
        <span class="classifica-riga__km">${formatItalianNumber(totaleKm)} km</span>
        <span class="classifica-riga__percentuale">100 %</span>
      </li>`;
  };

  // Frase di apertura sopra il podio
  CM.creaTitolo = function (righe) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const migliore = righe[0];
    return `
      Il mese in cui hai pedalato di pi&ugrave; in assoluto &egrave;
      <strong>${migliore.mese}</strong>, con
      <strong>${formatItalianNumber(migliore.km)} km</strong> percorsi
      in ${formatItalianNumber(migliore.occorrenze)} anni diversi.`;
  };

  // ---------- Record mese per mese (ogni anno separato) ----------
  // Stessa riga della classifica completa, ma qui il "nome" è già
  // "Mese + anno" (es. "Settembre 2024"), così un mese di un anno si
  // confronta alla pari con lo stesso mese di un altro anno.
  CM.creaRecordMesi = function (righe) {
    const massimo = righe.length ? righe[0].km : 0;
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

  CM.creaTitoloRecordMesi = function (righe) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const migliore = righe[0];
    return `
      Il singolo mese con pi&ugrave; chilometri in assoluto &egrave;
      <strong>${migliore.nome}</strong>, con
      <strong>${formatItalianNumber(migliore.km)} km</strong> percorsi.`;
  };

  // ---------- Stagioni: stesso podio, dati e frase per le stagioni ----------
  // Le stagioni sono solo tre, quindi il podio è già "tutte quante":
  // non serve una lista aggiuntiva sotto, come invece per i dodici mesi.
  // Ogni gradino è un link che porta alla pagina di quella stagione
  // (Estate.html, Primavera.html, Autunno_Inverno.html), stesso
  // comportamento già usato per il podio degli anni (creaPodioAnni).
  CM.creaPodioStagioni = function (righe) {
    return righe
      .map(
        (r, i) => `
      <a
        class="podio__gradino podio__gradino--${i + 1}"
        href="${r.link}"
        aria-label="Vai alla pagina di ${r.stagione}"
      >
        <span class="podio__medaglia" aria-hidden="true">${MEDAGLIE[i]}</span>
        <span class="podio__mese">${r.stagione}</span>
        <span class="podio__km anima-numero">${formatItalianNumber(r.km)} km</span>
        <span class="podio__dettaglio">
          ${formatNumber(r.percentuale)} % del totale &middot;
          ${formatItalianNumber(r.periodi)} anni pedalati &middot;
          media ${formatItalianNumber(r.kmMedi, true)} km
        </span>
      </a>`,
      )
      .join("");
  };

  CM.creaTitoloStagioni = function (righe) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const migliore = righe[0];
    return `
      La stagione in cui pedali di pi&ugrave; &egrave;
      <strong>${migliore.stagione}</strong>, con
      <strong>${formatItalianNumber(migliore.km)} km</strong> percorsi
      in totale.`;
  };

  // ---------- Confronto fra ogni singolo periodo ----------
  // Stessa identica riga della classifica dei mesi, ma qui il "nome"
  // è già "Stagione + anno" (es. "Estate 2020"), così un periodo di
  // una stagione si confronta alla pari con un periodo di un'altra
  // (es. Estate 2020 contro Autunno · Inverno 2020-2021).
  CM.creaClassificaPeriodi = function (righe) {
    const massimo = righe.length ? righe[0].km : 0;
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

  CM.creaTitoloPeriodi = function (righe) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const migliore = righe[0];
    return `
      Il singolo periodo con pi&ugrave; chilometri in assoluto &egrave;
      <strong>${migliore.nome}</strong>, con
      <strong>${formatItalianNumber(migliore.km)} km</strong> percorsi.`;
  };

  // ---------- Anni interi a confronto (non mesi: l'anno intero) ----------
  // Stessa riga di classifica-riga già usata per periodi e record mesi,
  // ma qui ogni voce è un anno intero (es. "2024") e ha un posto preciso
  // dove andare: l'intera riga è un link a quella pagina-anno.
  CM.creaClassificaAnni = function (righe) {
    const massimo = righe.length ? righe[0].km : 0;
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

  CM.creaTitoloAnni = function (righe) {
    if (!righe.length || righe[0].km <= 0) {
      return "Non ci sono ancora dati a sufficienza per una classifica.";
    }
    const migliore = righe[0];
    return `
      L'anno in cui hai pedalato di pi&ugrave; in assoluto &egrave;
      <strong>${migliore.nome}</strong>, con
      <strong>${formatItalianNumber(migliore.km)} km</strong> percorsi.`;
  };
})(window.ClassificaMesi);
