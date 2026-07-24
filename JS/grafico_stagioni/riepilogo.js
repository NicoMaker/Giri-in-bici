// ============================================================
// riepilogo.js — Riquadro con i totali della stagione
// Richiamato da JS/grafico_stagioni.js
// ============================================================

function renderSeasonSummary(season, totale, totalePeriodi, totalRaces) {
  const avgseason = formatNumber(totale / totalePeriodi);
  const avgcorsa = formatNumber(totale / totalRaces);
  const formattedTotalRaces = formatItalianNumber(totalRaces);

  document.getElementById("totale").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km percorsi in ${season} ${formatItalianNumber(totale)} <img src="Icons/traguardo.png"></p>
      <p class="misuracolore">km medi per giro in ${season} ${avgcorsa}</p>
      <p class="misuracolore">Media km per periodo ${avgseason}</p>
      <p class="misuracolore">Totale corse ${formattedTotalRaces}</p>
      <p class="misuracolore">Corse medie per periodo ${formatNumber(totalRaces / totalePeriodi)}</p>
      <hr style="margin: 10px 0; border-color: rgba(255,255,255,0.3);">
      <p class="misuracolore">Totale periodi: ${formatItalianNumber(totalePeriodi)}</p>
    </div>
  `;
}
