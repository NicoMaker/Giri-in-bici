// ============================================================
// schede.js — Le schede delle stagioni e il riquadro riepilogo
//
// Costruisce l'HTML: la scheda di ogni stagione e il riquadro
// "totale" con il dettaglio periodi e corse. Riceve i numeri gia'
// calcolati da dati.js, non fa conti propri.
//
// Dipendenze: JS/utils.js (formatItalianNumber, formatNumber)
//             Statistiche/Js/stagioni/dati.js (SEASONS_CONFIG)
// ============================================================

window.Stagioni = window.Stagioni || {};

(function (S) {
  "use strict";

  S.renderSeasonDiv = (season, data, numPeriods) => {
    // 1. Recupero dinamico dei dati in base alla stagione corrente
    const totalKm = data[season.dataKey] || 0;

    // Prendiamo le corse specifiche di QUESTA stagione usando la chiave dinamica
    const currentSeasonRaces = data[season.raceKey] || 0;

    // Il totale complessivo di tutte le stagioni
    const totalYearRaces = data.corseTotale || 0;

    // 2. Calcolo dinamico della percentuale delle corse per QUESTA stagione
    const racePercentage =
      totalYearRaces > 0 ? (currentSeasonRaces / totalYearRaces) * 100 : 0;

    // Percentuale dei KM della stagione
    const seasonKmPercentage = parseFloat(data[season.avgKey]) || 0;

    // 3. Calcolo delle medie
    const avgKmPerPeriod = numPeriods > 0 ? totalKm / numPeriods : 0;
    const avgKmPerRace =
      currentSeasonRaces > 0 ? totalKm / currentSeasonRaces : 0;

    return `
    <div class="${season.containerClass}">
      <a href="${season.link}">
        <img class="${season.imgClass}" src="../Icons/${season.icon}" alt="" onerror="this.style.display='none'">
        <p class="contornostagione misuracolore"><strong>${season.name}</strong></p>
        
        <p class="misuracolore">
          km totali ${formatItalianNumber(totalKm)}
          <img src="../Icons/traguardo.png" onerror="this.style.display='none'">
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

  S.renderStampa = (data, numPeriodsPerSeason) => {
    return S.SEASONS_CONFIG.map((season) => {
      const numPeriods =
        season.name === "Primavera"
          ? numPeriodsPerSeason.primavera
          : season.name === "Estate"
            ? numPeriodsPerSeason.estate
            : numPeriodsPerSeason.autunno_inverno;
      return S.renderSeasonDiv(season, data, numPeriods);
    }).join("");
  };

  S.createStampat = (data, numPeriodsPerSeason) => {
    const totalePeriodi =
      numPeriodsPerSeason.primavera +
      numPeriodsPerSeason.estate +
      numPeriodsPerSeason.autunno_inverno;

    return `
      <div class="colore">
        <p class="misuracolore">Totale km ${formatItalianNumber(data.totale)} <img src="../Icons/traguardo.png" onerror="this.style.display='none'"></p>
        <p class="misuracolore">Media km per Stagione ${data.avgmediastagione}</p>
        <p class="misuracolore">Media km per Periodo ${data.avgperiod}</p>
        <p class="misuracolore">Totale corse ${formatItalianNumber(data.corseTotale)}</p>
        <p class="misuracolore">Media corse per periodo ${formatNumber(data.corseTotale / totalePeriodi)}</p>
        <p class="misuracolore">Media corse per stagione ${formatNumber(data.corseTotale / 3)}</p>
        <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.3);">
        <p class="misuracolore" style="text-align: center;">📊 DETTAGLIO PERIODI E CORSE PER STAGIONE</p>
        <div style="display: flex; justify-content: space-between; margin-top: 10px; flex-wrap: wrap;">
          <div style="flex: 1; text-align: center; padding: 5px;">
            <p class="misuracolore">🌸 PRIMAVERA</p>
            <p class="misuracolore">${formatItalianNumber(numPeriodsPerSeason.primavera)} periodi</p>
            <p class="misuracolore">
              ${formatItalianNumber(data.corsep)} corse 
              (${formatItalianNumber(data.corseTotale > 0 ? (data.corsep / data.corseTotale) * 100 : 0, true)}%)
            </p>
          </div>
          <div style="flex: 1; text-align: center; padding: 5px;">
            <p class="misuracolore">☀️ ESTATE</p>
            <p class="misuracolore">${formatItalianNumber(numPeriodsPerSeason.estate)} periodi</p>
            <p class="misuracolore">
              ${formatItalianNumber(data.corsee)} corse 
              (${formatItalianNumber(data.corseTotale > 0 ? (data.corsee / data.corseTotale) * 100 : 0, true)}%)
            </p>
          </div>
          <div style="flex: 1; text-align: center; padding: 5px;">
            <p class="misuracolore">🍂 AUTUNNO-INVERNO</p>
            <p class="misuracolore">${formatItalianNumber(numPeriodsPerSeason.autunno_inverno)} periodi</p>
            <p class="misuracolore">
              ${formatItalianNumber(data.corseai)} corse 
              (${formatItalianNumber(data.corseTotale > 0 ? (data.corseai / data.corseTotale) * 100 : 0, true)}%)
            </p>
          </div>
        </div>
        <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.3);">
        <p class="misuracolore">📅 TOTALE PERIODI COMPLESSIVI</p>
        <p class="misuracolore">${formatItalianNumber(totalePeriodi)} periodi</p>
      </div>`;
  };
})(window.Stagioni);
