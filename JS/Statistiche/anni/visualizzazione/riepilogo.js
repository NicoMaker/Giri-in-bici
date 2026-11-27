// ============================================================
// riepilogo.js — Riquadro con i totali dell'anno
// Richiamato da Statistiche/Js/anni.js
// ============================================================

const renderSummary = (totale, kmMediPerCorsa, kmMediPerMese, totaleCorse) => {
  const mesiCount =
    document.getElementById("mesi")?.querySelectorAll("tr").length - 1 || 0;

  // totaleCorse è null quando i filtri nascondono dei mesi: le corse non si dividono per mese
  const nd = totaleCorse == null;
  let mediaCorsePerMese = "N/A";
  if (nd) mediaCorsePerMese = "n/d";
  else if (mesiCount > 0 && totaleCorse > 0) {
    mediaCorsePerMese = formatNumber(totaleCorse / mesiCount);
  }

  document.getElementById("totale").innerHTML = `
    <div class="colore">
      <p class="misuracolore">Totale km ${formatItalianNumber(totale)} <img src="/img/Icons/traguardo.png" alt="traguardo"></p>
      <p class="misuracolore">km medi per corsa ${kmMediPerCorsa}</p>
      <p class="misuracolore">km medi per mese ${kmMediPerMese}</p>
      <p class="misuracolore">Totale corse ${nd ? "n/d" : formatItalianNumber(totaleCorse)}</p>
      <p class="misuracolore">Medie corse per mese ${mediaCorsePerMese}</p>
    </div>
  `;
};
