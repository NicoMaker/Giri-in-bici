// ============================================================
// canvas.js — Crea i riquadri dei grafici se mancano nell'HTML
// Richiamato da Statistiche/Js/History/GraficoTotaleMensile.js
// ============================================================

// Crea i canvas solo se non esistono già nell'HTML della pagina
(function () {
  const contenitore = document.getElementById("grafici");
  if (!contenitore) return;
  if (
    document.getElementById("line-chart") &&
    document.getElementById("bar-chart")
  )
    return;
  contenitore.innerHTML = `
    <div class="grafico"><canvas id="line-chart"></canvas></div>
    <div class="grafico"><canvas id="bar-chart"></canvas></div>
  `;
})();
