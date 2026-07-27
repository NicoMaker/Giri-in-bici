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
// MODIFICA 2026-07-25: la parte alta del riepilogo ("Totale km",
// "Media km per Stagione", ecc.) non è più un elenco piatto di
// righe, ma un hero numerico + una griglia di schede con icona,
// in linea con lo stile "glass" già usato per le tre stagioni
// più sotto.
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
  // rigaStagione — le tre righe di dettaglio di una stagione
  // dentro il riepilogo (sezione "Dettaglio periodi e corse")
  // Stessa identità visiva delle altre righe: <p class="misuracolore">,
  // niente più card "glass" a sé stanti.
  // ------------------------------------------------------------
  var rigaStagione = function (emoji, nome, periodi, corse, totaleCorse) {
    var percentuale = totaleCorse > 0 ? (corse / totaleCorse) * 100 : 0;
    return `
        <p class="misuracolore"><strong>${emoji} ${nome}</strong></p>
        <p class="misuracolore">Periodi ${formatItalianNumber(periodi)}</p>
        <p class="misuracolore">Corse ${formatItalianNumber(corse)} (${formatItalianNumber(percentuale, true)}% delle corse)</p>`;
  };

  // ------------------------------------------------------------
  // createStampat — genera tutto il blocco "Totali per stagione"
  // (quello che appare sotto i grafici)
  //
  // MODIFICA 2026-07-25: stessa estetica delle altre card
  // riepilogative del sito (.colore / .misuracolore — vedi
  // "Tutti i chilometri" in Statistiche_Totali.html): elenco
  // piatto di righe con separatore sottile e valore allineato a
  // destra, niente più hero/griglia/quota in stile "glass".
  // I dati restano identici, cambia solo il markup.
  // ------------------------------------------------------------
  S.createStampat = function (data, numPeriodsPerSeason) {
    var totalePeriodi =
      numPeriodsPerSeason.primavera +
      numPeriodsPerSeason.estate +
      numPeriodsPerSeason.autunno_inverno;

    // Calcolo media km per corsa (evitiamo divisione per zero)
    var mediaKmPerCorsa = data.corseTotale > 0 ? data.totale / data.corseTotale : 0;

    return `
      <div class="colore">
        <p class="misuracolore">
          Totale km percorsi ${formatItalianNumber(data.totale)}
          <img src="/img/Icons/traguardo.png" onerror="this.style.display='none'">
        </p>
        <p class="misuracolore">Media km per stagione ${data.avgmediastagione}</p>
        <p class="misuracolore">Media km per periodo ${data.avgperiod}</p>
        <p class="misuracolore">Totale corse ${formatItalianNumber(data.corseTotale)}</p>
        <p class="misuracolore">Media corse per periodo ${formatNumber(data.corseTotale / totalePeriodi)}</p>
        <p class="misuracolore">Media corse per stagione ${formatNumber(data.corseTotale / 3)}</p>
        <p class="misuracolore">Media km per corsa ${formatNumber(mediaKmPerCorsa)}</p>

        <hr>

        <p class="misuracolore"><strong>📊 Dettaglio periodi e corse</strong></p>
        ${rigaStagione("🌸", "Primavera", numPeriodsPerSeason.primavera, data.corsep, data.corseTotale)}
        ${rigaStagione("☀️", "Estate", numPeriodsPerSeason.estate, data.corsee, data.corseTotale)}
        ${rigaStagione("🍂", "Autunno-Inverno", numPeriodsPerSeason.autunno_inverno, data.corseai, data.corseTotale)}

        <hr>

        <p class="misuracolore">📅 Totale periodi complessivi ${formatItalianNumber(totalePeriodi)}</p>
      </div>`;
  };
})(window.Stagioni);
