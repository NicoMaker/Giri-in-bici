// ============================================================
// riepilogo.js — Riquadro con i totali dell'anno
// Richiamato da Statistiche/Js/anni.js
// ============================================================

function renderSummary(totale, kmMediPerCorsa, kmMediPerMese, totaleCorse) {
  const mesiCount =
    document.getElementById("mesi")?.querySelectorAll("tr").length - 1 || 0;

  let mediaCorsePerMese = "N/A";
  if (mesiCount > 0 && totaleCorse > 0) {
    mediaCorsePerMese = formatNumber(totaleCorse / mesiCount);
  }

  document.getElementById("totale").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km ${formatItalianNumber(totale)} <img src="../../Icons/traguardo.png" alt="traguardo"></p>
      <p class="misuracolore">km medi per corsa ${kmMediPerCorsa}</p>
      <p class="misuracolore">km medi per mese ${kmMediPerMese}</p>
      <p class="misuracolore">Totale corse ${formatItalianNumber(totaleCorse)}</p>
      <p class="misuracolore">Medie corse per mese ${mediaCorsePerMese}</p>
    </div>
  `;
}
