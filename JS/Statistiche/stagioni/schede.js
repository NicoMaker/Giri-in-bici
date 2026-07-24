// ============================================================
// schede.js — Le schede delle stagioni e il riquadro riepilogo
//
// Costruisce l'HTML: la scheda di ogni stagione e il riquadro
// "totale" con il dettaglio periodi e corse. Riceve i numeri già
// calcolati da dati.js, non fa conti propri.
//
// Dipendenze: JS/utils.js (formatItalianNumber, formatNumber)
//             Statistiche/Js/stagioni/dati.js (SEASONS_CONFIG)
//
// MODIFICA 2026-07-24: aggiunto setTimeout per forzare il layout
// a griglia 3 colonne via JS, come fallback per garantire
// che le tre card siano sempre in riga.
// ============================================================

window.Stagioni = window.Stagioni || {};

(function (S) {
  "use strict";

  // ------------------------------------------------------------
  // renderSeasonDiv — genera l'HTML di una singola scheda stagione
  // (usato per la sezione "Le tre stagioni" in alto)
  // ------------------------------------------------------------
  S.renderSeasonDiv = function (season, data, numPeriods) {
    const totalKm = data[season.dataKey] || 0;
    const currentSeasonRaces = data[season.raceKey] || 0;
    const totalYearRaces = data.corseTotale || 0;
    const racePercentage =
      totalYearRaces > 0 ? (currentSeasonRaces / totalYearRaces) * 100 : 0;
    const seasonKmPercentage = parseFloat(data[season.avgKey]) || 0;
    const avgKmPerPeriod = numPeriods > 0 ? totalKm / numPeriods : 0;
    const avgKmPerRace =
      currentSeasonRaces > 0 ? totalKm / currentSeasonRaces : 0;

    return `
    <div class="${season.containerClass}">
      <a href="${season.link}">
        <img class="${season.imgClass}" src="/img/Icons/${season.icon}" alt="" onerror="this.style.display='none'">
        <p class="contornostagione misuracolore"><strong>${season.name}</strong></p>
        
        <p class="misuracolore">
          km totali ${formatItalianNumber(totalKm)}
          <img src="/img/Icons/traguardo.png" onerror="this.style.display='none'">
        </p>
        
        <p class="misuracolore">Percentuale km sul totale ${formatNumber(seasonKmPercentage)} %</p>
        
        <p class="misuracolore">
          Totale corse ${formatItalianNumber(currentSeasonRaces)} 
          (${formatItalianNumber(racePercentage, true)}%)
        </p>
        
        <p class="misuracolore">📅 Periodi: ${formatItalianNumber(numPeriods)}</p>
        <p class="misuracolore">km medi per periodo ${formatNumber(avgKmPerPeriod)}</p>
        <p class="misuracolore">km medi per corsa ${formatNumber(avgKmPerRace)}</p>
      </a>
    </div>`;
  };

  // ------------------------------------------------------------
  // renderStampa — genera l'HTML delle tre schede (usato in alto)
  // ------------------------------------------------------------
  S.renderStampa = function (data, numPeriodsPerSeason) {
    return S.SEASONS_CONFIG.map(function (season) {
      var numPeriods =
        season.name === "Primavera"
          ? numPeriodsPerSeason.primavera
          : season.name === "Estate"
            ? numPeriodsPerSeason.estate
            : numPeriodsPerSeason.autunno_inverno;
      return S.renderSeasonDiv(season, data, numPeriods);
    }).join("");
  };

  // ------------------------------------------------------------
  // quotaStagione — genera una singola card per il riepilogo
  // (sezione "Dettaglio periodi e corse")
  // ------------------------------------------------------------
  var quotaStagione = function (chiave, emoji, nome, periodi, corse, totaleCorse) {
    var percentuale = totaleCorse > 0 ? (corse / totaleCorse) * 100 : 0;
    return `
        <article class="quota quota--${chiave}">
          <header class="quota__testa">
            <span class="quota__emoji" aria-hidden="true">${emoji}</span>
            <h4 class="quota__nome">${nome}</h4>
          </header>
          <dl class="quota__dati">
            <div class="quota__voce">
              <dt>Periodi</dt>
              <dd class="anima-numero">${formatItalianNumber(periodi)}</dd>
            </div>
            <div class="quota__voce">
              <dt>Corse</dt>
              <dd class="anima-numero">${formatItalianNumber(corse)}</dd>
            </div>
          </dl>
          <div
            class="quota__barra"
            style="--quota: ${percentuale.toFixed(2)}%"
            role="img"
            aria-label="${formatItalianNumber(percentuale, true)}% delle corse"
          ></div>
          <p class="quota__percentuale">
            ${formatItalianNumber(percentuale, true)}% delle corse
          </p>
        </article>`;
  };

  // ------------------------------------------------------------
  // createStampat — genera tutto il blocco "Totali per stagione"
  // (quello che appare sotto i grafici)
  // ------------------------------------------------------------
  S.createStampat = function (data, numPeriodsPerSeason) {
    var totalePeriodi =
      numPeriodsPerSeason.primavera +
      numPeriodsPerSeason.estate +
      numPeriodsPerSeason.autunno_inverno;

    var html = `
      <div class="colore riepilogo">
        <p class="misuracolore">Totale km ${formatItalianNumber(data.totale)} <img src="/img/Icons/traguardo.png" onerror="this.style.display='none'"></p>
        <p class="misuracolore">Media km per Stagione ${data.avgmediastagione}</p>
        <p class="misuracolore">Media km per Periodo ${data.avgperiod}</p>
        <p class="misuracolore">Totale corse ${formatItalianNumber(data.corseTotale)}</p>
        <p class="misuracolore">Media corse per periodo ${formatNumber(data.corseTotale / totalePeriodi)}</p>
        <p class="misuracolore">Media corse per stagione ${formatNumber(data.corseTotale / 3)}</p>

        <section class="riepilogo__sezione">
          <h3 class="riepilogo__titolo">
            <br>
            <span aria-hidden="true">📊</span> Dettaglio periodi e corse
          </h3>
          <div class="quote">
            ${quotaStagione("primavera", "🌸", "Primavera", numPeriodsPerSeason.primavera, data.corsep, data.corseTotale)}
            ${quotaStagione("estate", "☀️", "Estate", numPeriodsPerSeason.estate, data.corsee, data.corseTotale)}
            ${quotaStagione("autunno-inverno", "🍂", "Autunno-Inverno", numPeriodsPerSeason.autunno_inverno, data.corseai, data.corseTotale)}
          </div>
        </section>

        <section class="riepilogo__sezione">
          <h3 class="riepilogo__titolo">
            <span aria-hidden="true">📅</span> Totale periodi complessivi
          </h3>
          <p class="riepilogo__totale">
            <span class="anima-numero">${formatItalianNumber(totalePeriodi)}</span>
            <span class="riepilogo__unita">periodi</span>
          </p>
        </section>
      </div>`;

    // ----------------------------------------------------------
    // FORZATURA LAYOUT A 3 COLONNE VIA JAVASCRIPT (FALLBACK)
    // Se il CSS non dovesse funzionare (cache, conflitti, ecc.),
    // questo codice imposta lo stile inline sull'elemento .quote
    // per garantire che le tre card siano sempre in riga.
    // ----------------------------------------------------------
    setTimeout(function () {
      var quote = document.querySelector('.quote');
      if (quote) {
        quote.style.display = 'grid';
        quote.style.gridTemplateColumns = 'repeat(3, 1fr)';
        quote.style.gap = '1.2rem';
      }
    }, 50);

    return html;
  };

})(window.Stagioni);