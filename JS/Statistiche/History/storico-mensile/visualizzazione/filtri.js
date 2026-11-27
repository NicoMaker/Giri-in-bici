// ============================================================
// filtri.js — Filtri della pagina Storico mensile
// Anni e mesi si scelgono a piacere (anche più di uno), più un intervallo di km
// per mese. Ogni cambio ricalcola tabella, totali, percentuali e grafici.
// Dipendenze: comune/config-mesi.js, utils (formatNumber)
// ============================================================

window.StoricoMensile = window.StoricoMensile || {};

((SM) => {
  "use strict";

  const STILE = `
.storico-filtri{display:grid;gap:.9rem;margin:0 0 1.2rem;padding:1rem 1.1rem;border:1px solid var(--line,#d8dde6);border-radius:var(--r-lg,16px);background:var(--surface-2,var(--surface,#f6f8fb))}
.storico-filtri__gruppo{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .5rem}
.storico-filtri__titolo{flex:0 0 100%;margin:0;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2,inherit);opacity:.8}
.storico-chip{padding:.38rem .85rem;font:inherit;font-size:.88rem;font-weight:600;color:var(--ink,inherit);background:var(--surface,#fff);border:1px solid var(--line,#d8dde6);border-radius:999px;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
.storico-chip:hover{border-color:var(--a1,#0d9488)}
.storico-chip[aria-pressed="true"]{color:#fff;background:var(--a1,#0d9488);border-color:var(--a1,#0d9488)}
.storico-chip--azione{background:transparent;border-style:dashed;font-weight:500}
.storico-filtri label{display:inline-flex;align-items:center;gap:.45rem;font-size:.9rem;font-weight:600}
.storico-filtri input[type=number]{width:7rem;height:40px;padding:0 .8rem;font:inherit;color:var(--ink,inherit);background:var(--surface,#fff);border:1px solid var(--line,#d8dde6);border-radius:999px}
.storico-filtri input[type=number]:focus-visible,.storico-chip:focus-visible{outline:0;border-color:var(--a1,#0d9488);box-shadow:0 0 0 3px var(--a-soft,rgba(13,148,136,.18))}
.storico-sintesi{margin:0;padding:.65rem .9rem;border-radius:12px;background:var(--surface,#fff);border:1px solid var(--line,#d8dde6);font-size:.92rem}
.storico-sintesi strong{font-variant-numeric:tabular-nums}
@media (max-width:560px){.storico-filtri{padding:.8rem}.storico-filtri input[type=number]{width:100%}.storico-filtri label{flex:1 1 100%}}
`;

  const iniettaStile = () => {
    if (document.getElementById("storico-filtri-stile")) return;
    const s = document.createElement("style");
    s.id = "storico-filtri-stile";
    s.textContent = STILE;
    document.head.appendChild(s);
  };

  const chip = (testo, premuto, onClick, extra = "") => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `storico-chip ${extra}`.trim();
    b.textContent = testo;
    if (premuto !== null) b.setAttribute("aria-pressed", String(premuto));
    b.addEventListener("click", onClick);
    return b;
  };

  // Costruisce la barra dei filtri. `stato` e' condiviso con chi disegna: { anni:Set, mesi:Set, min, max }.
  SM.creaFiltri = (yearLabels, onChange) => {
    iniettaStile();
    const nMesi = ConfigMesi.elenco.length;
    const stato = {
      anni: new Set(yearLabels),
      mesi: new Set(ConfigMesi.elenco.map((_, i) => i)),
      min: NaN,
      max: NaN,
    };
    const box = document.createElement("section");
    box.className = "storico-filtri";
    box.setAttribute("aria-label", "Filtri dello storico");

    const gruppo = (titolo) => {
      const g = document.createElement("div");
      g.className = "storico-filtri__gruppo";
      const h = document.createElement("p");
      h.className = "storico-filtri__titolo";
      h.textContent = titolo;
      g.appendChild(h);
      box.appendChild(g);
      return g;
    };

    const gAnni = gruppo("Anni");
    const gMesi = gruppo("Mesi");
    const gKm = gruppo("Distanza per mese");
    const sintesi = document.createElement("p");
    sintesi.className = "storico-sintesi";
    sintesi.setAttribute("aria-live", "polite");
    box.appendChild(sintesi);

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
        onChange();
      });
      l.appendChild(i);
      gKm.appendChild(l);
      return i;
    };
    const inMin = campoKm("Da", "min");
    const inMax = campoKm("A", "max");

    const disegnaChip = () => {
      [...gAnni.querySelectorAll(".storico-chip")].forEach((n) => n.remove());
      [...gMesi.querySelectorAll(".storico-chip")].forEach((n) => n.remove());
      const tutti = (g, quali, tuttiValori) => {
        g.append(
          chip(
            "Tutti",
            null,
            () => {
              tuttiValori.forEach((v) => quali.add(v));
              aggiorna();
            },
            "storico-chip--azione",
          ),
          chip(
            "Nessuno",
            null,
            () => {
              quali.clear();
              aggiorna();
            },
            "storico-chip--azione",
          ),
        );
      };
      yearLabels.forEach((anno) =>
        gAnni.appendChild(
          chip(anno, stato.anni.has(anno), () => {
            if (stato.anni.has(anno)) stato.anni.delete(anno);
            else stato.anni.add(anno);
            aggiorna();
          }),
        ),
      );
      tutti(gAnni, stato.anni, yearLabels);
      ConfigMesi.elenco.forEach((mese, i) =>
        gMesi.appendChild(
          chip(mese.slice(0, 3), stato.mesi.has(i), () => {
            if (stato.mesi.has(i)) stato.mesi.delete(i);
            else stato.mesi.add(i);
            aggiorna();
          }),
        ),
      );
      tutti(
        gMesi,
        stato.mesi,
        ConfigMesi.elenco.map((_, i) => i),
      );
    };

    const reimposta = chip(
      "Reimposta filtri",
      null,
      () => {
        yearLabels.forEach((a) => stato.anni.add(a));
        ConfigMesi.elenco.forEach((_, i) => stato.mesi.add(i));
        stato.min = NaN;
        stato.max = NaN;
        inMin.value = "";
        inMax.value = "";
        aggiorna();
      },
      "storico-chip--azione",
    );
    gKm.appendChild(reimposta);

    const aggiorna = () => {
      disegnaChip();
      onChange();
    };
    disegnaChip();

    box.aggiornaSintesi = ({ anni, mesi, totale, riferimento }) => {
      const quota = riferimento > 0 ? (totale / riferimento) * 100 : 0;
      sintesi.innerHTML = `<strong>${anni}</strong> ${anni === 1 ? "anno" : "anni"} · <strong>${mesi}</strong> ${mesi === 1 ? "mese" : "mesi"} su ${nMesi} · totale <strong>${formatNumber(totale)}</strong> km · <strong>${formatNumber(quota)}%</strong> dei km di quegli anni`;
    };
    return { elemento: box, stato };
  };

  // Applica i filtri ai dati: resta solo quello che si deve vedere.
  SM.applicaFiltri = (datasets, yearLabels, stato) => {
    const min = Number.isFinite(stato.min) ? stato.min : -Infinity;
    const max = Number.isFinite(stato.max) ? stato.max : Infinity;
    const idxAnni = yearLabels
      .map((a, i) => (stato.anni.has(a) ? i : -1))
      .filter((i) => i >= 0);
    const mesi = [...stato.mesi].sort((a, b) => a - b);
    const dsAnni = idxAnni.map((i) => datasets[i]);
    const etichette = idxAnni.map((i) => yearLabels[i]);
    const ok = (v) => v >= min && v <= max;
    // per i grafici: stessi dataset, solo mesi scelti, con un vuoto dove il mese e' fuori dall'intervallo di km
    const perGrafico = dsAnni.map((ds) => ({
      ...ds,
      data: mesi.map((m) => {
        const v = ds.data[m] ?? 0;
        return ok(v) ? v : null;
      }),
    }));
    let totale = 0;
    let riferimento = 0;
    dsAnni.forEach((ds) => {
      ds.data.forEach((v) => (riferimento += v ?? 0));
      mesi.forEach((m) => {
        const v = ds.data[m] ?? 0;
        if (ok(v)) totale += v;
      });
    });
    return {
      datasets: dsAnni,
      yearLabels: etichette,
      mesi,
      etichetteMesi: mesi.map((m) => ConfigMesi.elenco[m]),
      perGrafico,
      min: stato.min,
      max: stato.max,
      totale,
      riferimento,
    };
  };
})(window.StoricoMensile);
