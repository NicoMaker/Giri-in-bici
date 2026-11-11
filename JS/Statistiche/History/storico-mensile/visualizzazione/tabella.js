// ============================================================
// tabella.js — Tabella dello storico con le variazioni mese su mese
// Dipendenze: JS/utils.js, storico-mensile/variazioni.js
// Richiamato da Statistiche/History/storico-mensile.js
// ============================================================

window.StoricoMensile = window.StoricoMensile || {};

(function (SM) {
  "use strict";

  SM.renderTable = function (datasets, yearLabels) {
    const wrapper = document.createElement("div");
    wrapper.className = "storico-tabella-wrapper";

    wrapper.insertAdjacentHTML(
      "beforeend",
      `
      <div class="legenda-variazioni">
        <span class="badge badge-su">▲ aumento</span>
        <span class="badge badge-giu">▼ calo</span>
        <span class="badge badge-pari">● invariato</span>
        <span class="legenda-nota">
          (% calcolata rispetto all'anno precedente per lo stesso mese; se
          l'anno prima quel mese era a 0 km, si confronta con l'ultimo anno
          che aveva km, indicato come "vs anno"; se non ce n'è nessuno: +100%)
        </span>
      </div>
    `,
    );

    const table = document.createElement("table");
    table.className = "storico-tabella";

    // ── Intestazione riga 1: anni ──────────────────────────────────────
    const thead = document.createElement("thead");
    const row1 = document.createElement("tr");

    const thMese1 = document.createElement("th");
    thMese1.textContent = "Mese";
    thMese1.rowSpan = 2;
    thMese1.className = "th-mese";
    row1.appendChild(thMese1);

    yearLabels.forEach((label, i) => {
      const th = document.createElement("th");
      th.textContent = label;
      th.colSpan = i === 0 ? 1 : 2;
      th.className = "th-anno";
      row1.appendChild(th);
    });
    thead.appendChild(row1);

    // ── Intestazione riga 2: km / vs anno prec. ───────────────────────
    const row2 = document.createElement("tr");
    yearLabels.forEach((_, i) => {
      const thKm = document.createElement("th");
      thKm.textContent = "Distanza (km)";
      thKm.className = "th-sub";
      row2.appendChild(thKm);
      if (i > 0) {
        const thVar = document.createElement("th");
        thVar.textContent = "vs anno prec.";
        thVar.className = "th-sub th-var";
        row2.appendChild(thVar);
      }
    });
    thead.appendChild(row2);
    table.appendChild(thead);

    // ── Corpo ─────────────────────────────────────────────────────────
    const tbody = document.createElement("tbody");
    const totals = new Array(datasets.length).fill(0);

    ConfigMesi.elenco.forEach((mese, monthIndex) => {
      const row = document.createElement("tr");

      const tdMese = document.createElement("td");
      tdMese.textContent = mese;
      tdMese.className = "mese-label";
      row.appendChild(tdMese);

      datasets.forEach((ds, yearIndex) => {
        const value = ds.data[monthIndex] ?? 0;
        totals[yearIndex] += value;

        const tdVal = document.createElement("td");
        tdVal.textContent = value > 0 ? formatNumber(value) : "0";
        tdVal.className = value === 0 ? "valore zero" : "valore";
        row.appendChild(tdVal);

        if (yearIndex > 0) {
          // Anno prima a 0 km (mese non pedalato): si confronta con
          // l'ultimo anno precedente in cui quel mese aveva km (es.
          // Febbraio 2026 contro Febbraio 2024 se il 2025 e' a 0).
          // Se nessun anno prima ha km, si parte da 0 (+100%).
          let rifIndex = yearIndex - 1;
          while (rifIndex > 0 && (datasets[rifIndex].data[monthIndex] ?? 0) === 0) {
            rifIndex--;
          }
          let prevValue = datasets[rifIndex].data[monthIndex] ?? 0;
          if (prevValue === 0) rifIndex = yearIndex - 1;
          const perc = SM.calcVariazione(value, prevValue);
          const tdVar = document.createElement("td");
          tdVar.className = "valore td-var";
          tdVar.innerHTML = SM.badgeVariazione(perc);
          if (rifIndex !== yearIndex - 1) {
            const annoRif = yearLabels[rifIndex];
            tdVar.title = `Confronto con ${annoRif} (${formatNumber(prevValue)} km): l'anno prima era a 0`;
            tdVar.insertAdjacentHTML(
              "beforeend",
              ` <small class="var-rif">vs ${annoRif}</small>`,
            );
          }
          row.appendChild(tdVar);
        }
      });

      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // ── Piede totali ──────────────────────────────────────────────────
    const tfoot = document.createElement("tfoot");
    const footRow = document.createElement("tr");

    const tdLabel = document.createElement("td");
    tdLabel.textContent = "Totale anno";
    tdLabel.className = "mese-label totale-label";
    footRow.appendChild(tdLabel);

    totals.forEach((total, yearIndex) => {
      const tdTot = document.createElement("td");
      tdTot.textContent = formatNumber(total);
      tdTot.className = "valore totale-valore";
      footRow.appendChild(tdTot);

      if (yearIndex > 0) {
        const prevTotal = totals[yearIndex - 1];
        const perc = SM.calcVariazione(total, prevTotal);
        const tdVar = document.createElement("td");
        tdVar.className = "valore td-var totale-valore";
        tdVar.innerHTML = SM.badgeVariazione(perc);
        footRow.appendChild(tdVar);
      }
    });

    tfoot.appendChild(footRow);
    table.appendChild(tfoot);
    wrapper.appendChild(table);
    return wrapper;
  };
})(window.StoricoMensile);
