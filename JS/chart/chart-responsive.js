/* ============================================================
   chart-responsive.js  —  Giri in Bici
   Rende leggibili su mobile TUTTI i grafici Chart.js del sito,
   compresi quelli scritti a mano (stagioni.js, StoricoMensile.js).

   Come funziona: scrive le impostazioni nella config GREZZA del
   grafico (chart.config.options) in base alla larghezza reale del
   canvas, non della finestra. Al cambio di fascia il grafico viene
   ricostruito con .update().

   Caricare SUBITO DOPO chart.js e PRIMA di ogni altro script.
   ============================================================ */
(function () {
  "use strict";

  if (typeof Chart === "undefined") {
    console.warn("[chart-responsive] Chart.js non è stato caricato.");
    return;
  }

  /* ---------------- Fasce, in base alla larghezza del canvas -------------- */
  var TIERS = [
    {
      name: "xs",
      max: 380,
      font: 10,
      legendPos: "bottom",
      legendBox: 8,
      legendPad: 6,
      axisTitle: false,
      maxRotation: 60,
      minRotation: 45,
      maxTicksX: 7,
      maxTicksY: 5,
      shortLabels: true,
      point: 2.5,
      pointHover: 6,
      lineWidth: 2,
      pad: 2,
    },
    {
      name: "sm",
      max: 560,
      font: 11,
      legendPos: "bottom",
      legendBox: 12,
      legendPad: 8,
      axisTitle: false,
      maxRotation: 50,
      minRotation: 40,
      maxTicksX: 9,
      maxTicksY: 6,
      shortLabels: true,
      point: 3.5,
      pointHover: 7,
      lineWidth: 2,
      pad: 4,
    },
    {
      name: "md",
      max: 820,
      font: 12,
      legendPos: "top",
      legendBox: 16,
      legendPad: 12,
      axisTitle: true,
      maxRotation: 45,
      minRotation: 0,
      maxTicksX: 14,
      maxTicksY: 8,
      shortLabels: false,
      point: 5,
      pointHover: 8,
      lineWidth: 3,
      pad: 6,
    },
    {
      name: "lg",
      max: Infinity,
      font: 13,
      legendPos: "top",
      legendBox: 20,
      legendPad: 15,
      axisTitle: true,
      maxRotation: 0,
      minRotation: 0,
      maxTicksX: 24,
      maxTicksY: 10,
      shortLabels: false,
      point: 6,
      pointHover: 9,
      lineWidth: 3,
      pad: 8,
    },
  ];

  function tierFor(width) {
    var w = width || window.innerWidth || 1024;
    for (var i = 0; i < TIERS.length; i++) {
      if (w <= TIERS[i].max) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }

  /* --------- Accorcia le etichette lunghe: "Gennaio (2024)" -> "Gen 24" ---- */
  function shorten(value) {
    if (typeof value !== "string" || value.length <= 5) return value;
    var m = value.match(/^([^\s(]+)\s*\(\d{0,2}(\d{2})\)$/);
    if (m) return m[1].slice(0, 3) + " " + m[2];
    return value.slice(0, 3) + ".";
  }

  function obj(parent, key) {
    if (!parent[key] || typeof parent[key] !== "object") parent[key] = {};
    return parent[key];
  }

  /* ------------------------- Applica una fascia --------------------------- */
  function applyTier(chart, t) {
    var cfg = chart.config;
    var opts = cfg.options || (cfg.options = {});
    var type = cfg.type || (cfg._config && cfg._config.type);
    var isPie = type === "doughnut" || type === "pie" || type === "polarArea";

    opts.responsive = true;
    opts.maintainAspectRatio = false; // l'altezza la decide il CSS

    obj(opts, "font").size = t.font;
    obj(opts, "layout").padding = t.pad;

    /* --- Legenda --- */
    var legend = obj(obj(opts, "plugins"), "legend");
    legend.display = legend.display !== false;
    legend.position = t.legendPos;
    var lbl = obj(legend, "labels");
    lbl.boxWidth = t.legendBox;
    lbl.padding = t.legendPad;
    obj(lbl, "font").size = t.font;
    lbl.font.weight = "bold";

    /* --- Tooltip: leggibile e comodo da toccare col dito --- */
    var tip = obj(obj(opts, "plugins"), "tooltip");
    obj(tip, "titleFont").size = t.font + 1;
    obj(tip, "bodyFont").size = t.font + 1;
    tip.padding = t.name === "lg" ? 10 : 8;
    tip.boxPadding = 4;
    tip.position = "nearest";

    if (!isPie) {
      var it = obj(opts, "interaction");
      it.mode = "index";
      it.intersect = false;
    }

    /* --- Punti e linee --- */
    var el = obj(opts, "elements");
    obj(el, "point").radius = t.point;
    el.point.hoverRadius = t.pointHover;
    el.point.hitRadius = 14;
    obj(el, "line").borderWidth = t.lineWidth;

    // le opzioni del dataset battono elements.point: le riallineo
    var ds = (chart.data && chart.data.datasets) || [];
    ds.forEach(function (d) {
      if (d.pointRadius !== undefined) {
        if (d.__origPointRadius === undefined)
          d.__origPointRadius = d.pointRadius;
        d.pointRadius = Math.min(d.__origPointRadius, t.point);
      }
      if (d.pointHoverRadius !== undefined) {
        if (d.__origPointHover === undefined)
          d.__origPointHover = d.pointHoverRadius;
        d.pointHoverRadius = Math.min(d.__origPointHover, t.pointHover);
      }
      if (d.borderWidth !== undefined && typeof d.borderWidth === "number") {
        if (d.__origBorderWidth === undefined)
          d.__origBorderWidth = d.borderWidth;
        d.borderWidth = Math.min(d.__origBorderWidth, t.lineWidth);
      }
    });

    /* --- Assi --- */
    if (isPie) return;

    var scales = obj(opts, "scales");
    obj(scales, "x");
    obj(scales, "y");

    Object.keys(scales).forEach(function (key) {
      var sc = scales[key];
      if (!sc || typeof sc !== "object") return;
      var isX = key.charAt(0) === "x" || sc.axis === "x";

      var ticks = obj(sc, "ticks");
      obj(ticks, "font").size = t.font;
      ticks.autoSkip = true;
      ticks.autoSkipPadding = 6;
      ticks.padding = 4;

      // Titolo dell'asse: sotto i 560px ruba troppo spazio, lo nascondo
      if (sc.title) {
        if (sc.title.__origDisplay === undefined)
          sc.title.__origDisplay = sc.title.display;
        sc.title.display = t.axisTitle ? sc.title.__origDisplay : false;
        obj(sc.title, "font").size = t.font;
      }

      var grid = obj(sc, "grid");
      grid.tickLength = t.name === "lg" ? 8 : 4;

      if (isX) {
        ticks.maxRotation = t.maxRotation;
        ticks.minRotation = t.minRotation;
        ticks.maxTicksLimit = t.maxTicksX;

        // conservo l'eventuale callback originale e accorcio il risultato
        if (ticks.__origCallback === undefined)
          ticks.__origCallback = ticks.callback || null;
        var orig = ticks.__origCallback;
        var doShort = t.shortLabels;
        ticks.callback = function (value, index, all) {
          var out = orig
            ? orig.call(this, value, index, all)
            : this.getLabelForValue
              ? this.getLabelForValue(value)
              : value;
          return doShort ? shorten(out) : out;
        };
      } else {
        ticks.maxTicksLimit = t.maxTicksY;
      }
    });
  }

  /* ------------------------------ Plugin ---------------------------------- */
  var plugin = {
    id: "giriResponsive",

    beforeInit: function (chart) {
      var t = tierFor(
        (chart.canvas && chart.canvas.parentNode
          ? chart.canvas.parentNode.clientWidth
          : 0) ||
          chart.width ||
          window.innerWidth,
      );
      chart.$giriTier = t.name;
      applyTier(chart, t);
    },

    afterResize: function (chart, size) {
      var t = tierFor(size && size.width ? size.width : chart.width);
      if (chart.$giriTier === t.name) return;
      chart.$giriTier = t.name;
      applyTier(chart, t);
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
})();
