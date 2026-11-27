// ============================================================
// filtri-statistiche.js — Barra di filtri condivisa dalle pagine delle statistiche
// (Anni, Statistiche totali, Statistiche mensili).
//
// Si scelgono uno o più anni, uno o più mesi e un intervallo di km; ogni cambio chiama
// onChange(stato) e la pagina ricalcola tabella, totali, percentuali e grafici
// solo su ciò che si vede.
//
//   const f = FiltriStatistiche.crea({ anni: ["2024","2025"] | null, mesi: ["Gennaio", ...], onChange });
//   host.before(f.elemento);
//   f.stato      → { anni:Set, mesi:Set (indici), min, max }
//   f.sintesi(html)   scrive la riga riassuntiva sotto i filtri
//   f.passa(km)       true se km sta nell'intervallo scelto
// ============================================================
window.FiltriStatistiche = (() => {
  "use strict";

  const STILE = `
.fs-filtri{display:grid;gap:.9rem;margin:0 0 1.2rem;padding:1rem 1.1rem;border:1px solid var(--line,#d8dde6);border-radius:var(--r-lg,16px);background:var(--surface-2,var(--surface,#f6f8fb))}
.fs-gruppo{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .5rem}
.fs-titolo{flex:0 0 100%;margin:0;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.8}
.fs-chip{padding:.38rem .85rem;font:inherit;font-size:.88rem;font-weight:600;color:var(--ink,inherit);background:var(--surface,#fff);border:1px solid var(--line,#d8dde6);border-radius:999px;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
.fs-chip:hover{border-color:var(--a1,#0d9488)}
.fs-chip[aria-pressed="true"]{color:#fff;background:var(--a1,#0d9488);border-color:var(--a1,#0d9488)}
.fs-chip--azione{background:transparent;border-style:dashed;font-weight:500}
.fs-filtri label{display:inline-flex;align-items:center;gap:.45rem;font-size:.9rem;font-weight:600}
.fs-filtri input[type=number]{width:7rem;height:40px;padding:0 .8rem;font:inherit;color:var(--ink,inherit);background:var(--surface,#fff);border:1px solid var(--line,#d8dde6);border-radius:999px}
.fs-filtri input[type=number]:focus-visible,.fs-chip:focus-visible{outline:0;border-color:var(--a1,#0d9488);box-shadow:0 0 0 3px var(--a-soft,rgba(13,148,136,.18))}
.fs-sintesi{margin:0;padding:.65rem .9rem;border-radius:12px;background:var(--surface,#fff);border:1px solid var(--line,#d8dde6);font-size:.92rem}
.fs-sintesi strong{font-variant-numeric:tabular-nums}
@media (max-width:560px){.fs-filtri{padding:.8rem}.fs-filtri input[type=number]{width:100%}.fs-filtri label{flex:1 1 100%}}
`;

  const chip = (testo, premuto, onClick, extra = "") => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `fs-chip ${extra}`.trim();
    b.textContent = testo;
    if (premuto !== null) b.setAttribute("aria-pressed", String(premuto));
    b.addEventListener("click", onClick);
    return b;
  };

  const crea = ({
    anni = null,
    titoloAnni = "Anni",
    stagioni = null,
    mesi,
    titoloKm = "Distanza per mese",
    onChange,
  }) => {
    if (!document.getElementById("fs-stile")) {
      const s = document.createElement("style");
      s.id = "fs-stile";
      s.textContent = STILE;
      document.head.appendChild(s);
    }
    const stato = {
      anni: new Set(anni || []),
      stagioni: new Set(stagioni || []),
      mesi: new Set(mesi.map((_, i) => i)),
      min: NaN,
      max: NaN,
    };
    const box = document.createElement("section");
    box.className = "fs-filtri";
    box.setAttribute("aria-label", "Filtri delle statistiche");

    const gruppo = (titolo) => {
      const g = document.createElement("div");
      g.className = "fs-gruppo";
      const h = document.createElement("p");
      h.className = "fs-titolo";
      h.textContent = titolo;
      g.appendChild(h);
      box.appendChild(g);
      return g;
    };
    const gStagioni =
      stagioni && stagioni.length > 1 ? gruppo("Stagioni") : null;
    const gAnni = anni && anni.length > 1 ? gruppo(titoloAnni) : null;
    const gMesi = mesi.length > 1 ? gruppo("Mesi") : null;
    const gKm = gruppo(titoloKm);
    const riga = document.createElement("p");
    riga.className = "fs-sintesi";
    riga.setAttribute("aria-live", "polite");
    box.appendChild(riga);

    const campoKm = (etichetta, chiave) => {
      const l = document.createElement("label");
      l.append(etichetta + " ");
      const i = document.createElement("input");
      i.type = "number";
      i.min = "0";
      i.step = "any";
      i.inputMode = "decimal";
      i.placeholder = "km";
      i.setAttribute("aria-label", `${etichetta} km`);
      i.addEventListener("input", () => {
        const v = parseFloat(String(i.value).replace(",", "."));
        stato[chiave] = Number.isFinite(v) ? v : NaN;
        onChange(stato);
      });
      l.appendChild(i);
      gKm.appendChild(l);
      return i;
    };
    const inMin = campoKm("Da", "min");
    const inMax = campoKm("A", "max");

    const disegna = () => {
      for (const g of [gStagioni, gAnni, gMesi])
        g && g.querySelectorAll(".fs-chip").forEach((n) => n.remove());
      const azioni = (g, insieme, tutti) =>
        g.append(
          chip(
            "Tutti",
            null,
            () => {
              tutti.forEach((v) => insieme.add(v));
              cambia();
            },
            "fs-chip--azione",
          ),
          chip(
            "Nessuno",
            null,
            () => {
              insieme.clear();
              cambia();
            },
            "fs-chip--azione",
          ),
        );
      if (gStagioni) {
        stagioni.forEach((a) =>
          gStagioni.appendChild(
            chip(a, stato.stagioni.has(a), () => {
              stato.stagioni.has(a)
                ? stato.stagioni.delete(a)
                : stato.stagioni.add(a);
              cambia();
            }),
          ),
        );
        azioni(gStagioni, stato.stagioni, stagioni);
      }
      if (gAnni) {
        anni.forEach((a) =>
          gAnni.appendChild(
            chip(a, stato.anni.has(a), () => {
              stato.anni.has(a) ? stato.anni.delete(a) : stato.anni.add(a);
              cambia();
            }),
          ),
        );
        azioni(gAnni, stato.anni, anni);
      }
      if (gMesi) {
        mesi.forEach((m, i) =>
          gMesi.appendChild(
            chip(String(m).slice(0, 3), stato.mesi.has(i), () => {
              stato.mesi.has(i) ? stato.mesi.delete(i) : stato.mesi.add(i);
              cambia();
            }),
          ),
        );
        azioni(
          gMesi,
          stato.mesi,
          mesi.map((_, i) => i),
        );
      }
    };
    const cambia = () => {
      disegna();
      onChange(stato);
    };
    gKm.appendChild(
      chip(
        "Reimposta filtri",
        null,
        () => {
          (anni || []).forEach((a) => stato.anni.add(a));
          (stagioni || []).forEach((a) => stato.stagioni.add(a));
          mesi.forEach((_, i) => stato.mesi.add(i));
          stato.min = stato.max = NaN;
          inMin.value = inMax.value = "";
          cambia();
        },
        "fs-chip--azione",
      ),
    );
    disegna();

    return {
      elemento: box,
      stato,
      sintesi: (html) => (riga.innerHTML = html),
      passa: (km) =>
        km >= (Number.isFinite(stato.min) ? stato.min : -Infinity) &&
        km <= (Number.isFinite(stato.max) ? stato.max : Infinity),
      filtrato: () =>
        stato.mesi.size < mesi.length ||
        (anni ? stato.anni.size < anni.length : false) ||
        (stagioni ? stato.stagioni.size < stagioni.length : false) ||
        Number.isFinite(stato.min) ||
        Number.isFinite(stato.max),
    };
  };

  return { crea };
})();
