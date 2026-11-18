/* ============================================================
   fasce-e-applicazione.js — Giri in Bici
   Le fasce responsive (in base alla larghezza del canvas, non della
   finestra) e la funzione che le applica alla config GREZZA di un
   grafico Chart.js (chart.config.options).

   Richiamato da chart-responsive.js, che registra il plugin e
   ricostruisce il grafico al cambio di fascia.
   ============================================================ */
window.ChartResponsive = window.ChartResponsive || {};

((CR) => {
  "use strict";
  /* ---------------- Fasce, in base alla larghezza del canvas -------------- */
  const TIERS = [
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

  CR.tierFor = (width) => {
    const w = width || window.innerWidth || 1024;
    for (let i = 0; i < TIERS.length; i++) {
      if (w <= TIERS[i].max) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  };

  /* --------- Accorcia le etichette lunghe: "Gennaio (2024)" -> "Gen 24" ---- */
  const shorten = (value) => {
    if (typeof value !== "string" || value.length <= 5) return value;
    const m = value.match(/^([^\s(]+)\s*\(\d{0,2}(\d{2})\)$/);
    if (m) return m[1].slice(0, 3) + " " + m[2];
    return value.slice(0, 3) + ".";
  };

  const obj = (parent, key) => {
    if (!parent[key] || typeof parent[key] !== "object") parent[key] = {};
    return parent[key];
  };

  /* ------------------------- Applica una fascia --------------------------- */
  CR.applyTier = (chart, t) => {
    const cfg = chart.config;
    const opts = cfg.options || (cfg.options = {});
    const type = cfg.type || (cfg._config && cfg._config.type);
    const isPie = type === "doughnut" || type === "pie" || type === "polarArea";

    opts.responsive = true;
    opts.maintainAspectRatio = false; // l'altezza la decide il CSS

    obj(opts, "font").size = t.font;
    obj(opts, "layout").padding = t.pad;

    /* --- Legenda --- */
    const legend = obj(obj(opts, "plugins"), "legend");
    legend.display = legend.display !== false;
    legend.position = t.legendPos;
    const lbl = obj(legend, "labels");
    lbl.boxWidth = t.legendBox;
    lbl.padding = t.legendPad;
    obj(lbl, "font").size = t.font;
    lbl.font.weight = "bold";

    /* --- Tooltip: leggibile e comodo da toccare col dito --- */
    const tip = obj(obj(opts, "plugins"), "tooltip");
    obj(tip, "titleFont").size = t.font + 1;
    obj(tip, "bodyFont").size = t.font + 1;
    tip.padding = t.name === "lg" ? 10 : 8;
    tip.boxPadding = 4;
    tip.position = "nearest";

    if (!isPie) {
      // "nearest" invece di "index": tocchi un punto e vedi SOLO quel
      // punto (es. solo "2024: 386"), non tutte le linee sovrapposte
      // alla stessa posizione (es. tutti gli anni di quel mese insieme).
      const it = obj(opts, "interaction");
      it.mode = "nearest";
      it.intersect = false;
    }

    /* --- Punti e linee --- */
    const el = obj(opts, "elements");
    obj(el, "point").radius = t.point;
    el.point.hoverRadius = t.pointHover;
    el.point.hitRadius = 14;
    obj(el, "line").borderWidth = t.lineWidth;

    // le opzioni del dataset battono elements.point: le riallineo
    const ds = (chart.data && chart.data.datasets) || [];
    ds.forEach((d) => {
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

    const scales = obj(opts, "scales");
    obj(scales, "x");
    obj(scales, "y");

    Object.keys(scales).forEach((key) => {
      const sc = scales[key];
      if (!sc || typeof sc !== "object") return;
      const isX = key.charAt(0) === "x" || sc.axis === "x";

      const ticks = obj(sc, "ticks");
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

      const grid = obj(sc, "grid");
      grid.tickLength = t.name === "lg" ? 8 : 4;

      // Grafici dentro .grafico-tutti-mesi (es. Statistiche Totali):
      // il contenitore scorre in orizzontale apposta per non dover mai
      // nascondere un'etichetta. Qui si spegne autoSkip e si scrive in
      // verticale, così anche col mouse fermo si legge ogni mese.
      const tuttiIMesi =
        isX &&
        chart.canvas &&
        chart.canvas.closest &&
        chart.canvas.closest(".grafico-tutti-mesi");

      if (tuttiIMesi) {
        ticks.autoSkip = false;
        ticks.maxTicksLimit = undefined;
        ticks.maxRotation = 90;
        ticks.minRotation = 90;
        obj(ticks, "font").size = Math.max(t.font - 2, 9);

        if (ticks.__origCallback === undefined)
          ticks.__origCallback = ticks.callback || null;
        const origTM = ticks.__origCallback;
        ticks.callback = function (value, index, all) {
          const out = origTM
            ? origTM.call(this, value, index, all)
            : this.getLabelForValue
              ? this.getLabelForValue(value)
              : value;
          return shorten(out);
        };
      } else if (isX) {
        ticks.maxRotation = t.maxRotation;
        ticks.minRotation = t.minRotation;

        // Mostra SEMPRE tutte le etichette dell'asse X (stagioni, anni,
        // mesi): niente più "una sì una no" su schermi stretti. Su xs/sm
        // ruoto di più per farcele stare, ma non ne nascondo nessuna.
        ticks.autoSkip = false;
        ticks.maxTicksLimit = undefined;
        if (t.name === "xs" || t.name === "sm") {
          ticks.maxRotation = 90;
          ticks.minRotation = 90;
        }

        // conservo l'eventuale callback originale e accorcio il risultato
        if (ticks.__origCallback === undefined)
          ticks.__origCallback = ticks.callback || null;
        const orig = ticks.__origCallback;
        const doShort = t.shortLabels;
        ticks.callback = function (value, index, all) {
          const out = orig
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
  };
})(window.ChartResponsive);
