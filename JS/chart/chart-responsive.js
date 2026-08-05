/* ============================================================
   chart-responsive.js  —  Giri in Bici
   Rende leggibili su mobile TUTTI i grafici Chart.js del sito,
   compresi quelli scritti a mano (stagioni.js, storico-mensile.js).

   Solo la registrazione del plugin: le fasce e il calcolo vero e
   proprio stanno in chart-responsive/fasce-e-applicazione.js.

   Come funziona: scrive le impostazioni nella config GREZZA del
   grafico (chart.config.options) in base alla larghezza reale del
   canvas, non della finestra. Al cambio di fascia il grafico viene
   ricostruito con .update().

   Caricare SUBITO DOPO chart.js e PRIMA di ogni altro script.
   ============================================================ */
(function (CR) {
  "use strict";

  if (typeof Chart === "undefined") {
    console.warn("[chart-responsive] Chart.js non è stato caricato.");
    return;
  }

  var plugin = {
    id: "giriResponsive",

    beforeInit: function (chart) {
      var t = CR.tierFor(
        (chart.canvas && chart.canvas.parentNode
          ? chart.canvas.parentNode.clientWidth
          : 0) ||
          chart.width ||
          window.innerWidth,
      );
      chart.$giriTier = t.name;
      CR.applyTier(chart, t);
    },

    afterResize: function (chart, size) {
      var t = CR.tierFor(size && size.width ? size.width : chart.width);
      if (chart.$giriTier === t.name) return;
      chart.$giriTier = t.name;
      CR.applyTier(chart, t);
      // fuori dal ciclo corrente, per non innescare un resize ricorsivo
      if (chart.$giriPending) return;
      chart.$giriPending = true;
      requestAnimationFrame(function () {
        chart.$giriPending = false;
        try {
          chart.update("none");
        } catch (e) {
          /* grafico distrutto nel frattempo */
        }
      });
    },
  };

  Chart.register(plugin);

  /* ------- Ricalcolo al cambio di orientamento (iOS non fa resize) -------- */
  var timer = null;
  window.addEventListener("orientationchange", function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      document.querySelectorAll("canvas").forEach(function (c) {
        var ch = Chart.getChart ? Chart.getChart(c) : null;
        if (!ch) return;
        try {
          ch.resize();
        } catch (e) {
          /* noop */
        }
      });
    }, 250);
  });
})(window.ChartResponsive);
