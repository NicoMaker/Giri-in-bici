// ============================================================
// tabella.js — Tabella dello storico con le variazioni mese su mese
// Dipendenze: JS/utils.js, storico-mensile/variazioni.js
// Richiamato da Statistiche/History/storico-mensile.js
// ============================================================

window.StoricoMensile = window.StoricoMensile || {};

((SM) => {
  "use strict";

  // opz (facoltativo, arriva dai filtri della pagina):
  //   mesi  indici dei mesi da mostrare (default: tutti)
  //   min / max  km minimi e massimi per mese (fuori intervallo il mese non conta)
  // Totali e percentuali si calcolano solo su quello che si vede.
  SM.renderTable = (datasets, yearLabels, opz = {}) => {
    const mesiIdx = opz.mesi || ConfigMesi.elenco.map((_, i) => i);
    const min = Number.isFinite(opz.min) ? opz.min : -Infinity;
    const max = Number.isFinite(opz.max) ? opz.max : Infinity;
    const inIntervallo = (v) => v >= min && v <= max;
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
          (% calcolata rispetto all'anno precedente mostrato per lo stesso mese; se
          l'anno prima quel mese era a 0 km, il riferimento è 0: da 0 a
          qualcosa +100%, da qualcosa a 0 -100%)
        </span>
      </div>
    `,
    );

    const table = document.createElement("table");
    table.className = "storico-tabella";
    table.setAttribute("data-senza-ricerca", ""); // i filtri della pagina sostituiscono il campo Cerca generico

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

    mesiIdx.forEach((monthIndex) => {
      const mese = ConfigMesi.elenco[monthIndex];
      const row = document.createElement("tr");

      const tdMese = document.createElement("td");
      tdMese.textContent = mese;
      tdMese.className = "mese-label";
      row.appendChild(tdMese);

      datasets.forEach((ds, yearIndex) => {
        const raw = ds.data[monthIndex] ?? 0;
        const visibile = inIntervallo(raw);
        if (visibile) totals[yearIndex] += raw;

        const tdVal = document.createElement("td");
        tdVal.textContent = visibile
          ? raw > 0
            ? formatNumber(raw)
            : "0"
          : "—";
        tdVal.className = visibile && raw !== 0 ? "valore" : "valore zero";
        row.appendChild(tdVal);

        if (yearIndex > 0) {
          // Si confronta sempre con l'anno mostrato subito prima, anche se quel
          // mese era a 0 km: lo 0 e' il riferimento. Se uno dei due valori e'
          // fuori dal filtro dei km non c'e' nulla da confrontare.
          const prevRaw = datasets[yearIndex - 1].data[monthIndex] ?? 0;
          const tdVar = document.createElement("td");
          tdVar.className = "valore td-var";
          tdVar.innerHTML =
            visibile && inIntervallo(prevRaw)
              ? SM.badgeVariazione(SM.calcVariazione(raw, prevRaw))
              : '<span class="badge badge-pari">–</span>';
          row.appendChild(tdVar);
        }
      });

      tbody.appendChild(row);
    });
    if (!mesiIdx.length) {
      const vuota = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = Math.max(1, datasets.length * 2);
      td.textContent = "Nessun mese selezionato.";
      td.className = "valore zero";
      vuota.appendChild(td);
      tbody.appendChild(vuota);
    }
    table.appendChild(tbody);

    // ── Piede totali ──────────────────────────────────────────────────
    const tfoot = document.createElement("tfoot");
    const footRow = document.createElement("tr");

    const tdLabel = document.createElement("td");
    tdLabel.textContent =
      mesiIdx.length === ConfigMesi.elenco.length
        ? "Totale anno"
        : "Totale mesi scelti";
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
