// ============================================================
// tabella.js — Tabella dei mesi
// Richiamato da Statistiche/Js/anni.js
// ============================================================

function renderDataTable(mesi, chilometri, percentuali) {
  document.getElementById("mesi").innerHTML = `
    <tr class="grassetto">
      <th>Mese</th>
      <th>km <img src="/img/Icons/traguardo.png" alt="traguardo"></th>
      <th>Percentuale sull'anno</th>
    </tr>
    ${mesi
      .map(
        (mese, index) => `
      <tr>
        <td>${mese}</td>
        <td>${formatItalianNumber(chilometri[index])}</td>
        <td>${percentuali[index]} %</td>
      </tr>`,
      )
      .join("")}
  `;
}
