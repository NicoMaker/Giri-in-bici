document.addEventListener("DOMContentLoaded", () => {
  const mesi = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
  ];

  const formatNumber = (value) => ChartConfigs.formatItalianNumber(value);

  function createDataset(yearData, yearLabel, yearColor) {
    const data = new Array(12).fill(0);
    for (const [month, value] of Object.entries(yearData.data)) {
      const monthIndex = mesi.indexOf(month);
      if (monthIndex !== -1) data[monthIndex] = value;
    }
    return {
      label: yearLabel,
      backgroundColor: yearColor,
      borderColor: yearColor,
      borderWidth: 3,
      data: data,
    };
  }

  const createConfig = (type, datasets) => ({
    type: type,
    data: { labels: mesi, datasets: datasets },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (value) => formatNumber(value) },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || "";
              const value = context.parsed.y;
              return `${label}: ${formatNumber(value)}`;
            },
          },
        },
      },
    },
  });

  function calcVariazione(valoreAttuale, valorePrecedente) {
    if (valorePrecedente === 0) return null;
    return ((valoreAttuale - valorePrecedente) / valorePrecedente) * 100;
  }

function badgeVariazione(perc) {
  if (perc === null) return `<span class="badge badge-neutro">—</span>`;
  const segno = perc > 0 ? "+" : "";
  const cls = perc > 0 ? "badge-su" : perc < 0 ? "badge-giu" : "badge-pari";
  const freccia = perc > 0 ? "▲" : perc < 0 ? "▼" : "●";
  const decimali = perc % 1 === 0 ? "0" : "2";
  const percStr = perc.toFixed(decimali);
  return `<span class="badge ${cls}">${freccia} ${segno}${percStr}%</span>`;
}

  function renderTable(datasets, yearLabels) {
    const wrapper = document.createElement("div");
    wrapper.className = "storico-tabella-wrapper";

    wrapper.insertAdjacentHTML("beforeend", `
      <div class="legenda-variazioni">
        <span class="badge badge-su">▲ aumento</span>
        <span class="badge badge-giu">▼ calo</span>
        <span class="badge badge-pari">● invariato</span>
        <span class="badge badge-neutro">— nessun dato precedente</span>
        <span class="legenda-nota">
          (% calcolata rispetto all'anno precedente per lo stesso mese)
        </span>
      </div>
    `);

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
      thKm.textContent = "km";
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

    mesi.forEach((mese, monthIndex) => {
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
          const prevValue = datasets[yearIndex - 1].data[monthIndex] ?? 0;
          const perc = calcVariazione(value, prevValue);
          const tdVar = document.createElement("td");
          tdVar.className = "valore td-var";
          tdVar.innerHTML = badgeVariazione(perc);
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
        const perc = calcVariazione(total, prevTotal);
        const tdVar = document.createElement("td");
        tdVar.className = "valore td-var totale-valore";
        tdVar.innerHTML = badgeVariazione(perc);
        footRow.appendChild(tdVar);
      }
    });

    tfoot.appendChild(footRow);
    table.appendChild(tfoot);
    wrapper.appendChild(table);
    return wrapper;
  }

  function renderCharts(datasets, yearLabels) {
    const graficiDiv = document.getElementById("Grafici");
    graficiDiv.innerHTML = "";

    graficiDiv.appendChild(renderTable(datasets, yearLabels));

    const canvasWrapper = document.createElement("div");
    canvasWrapper.innerHTML = `
      <canvas id="line-chart" class="grafico"></canvas>
      <br>
      <canvas id="bar-chart" class="grafico"></canvas>
    `;
    graficiDiv.appendChild(canvasWrapper);

    const ctxline = document.getElementById("line-chart").getContext("2d");
    const ctxbar  = document.getElementById("bar-chart").getContext("2d");
    new Chart(ctxline, createConfig("line", datasets));
    new Chart(ctxbar,  createConfig("bar",  datasets));
  }

  fetch("../Js/History/JSON/StoricoMensile.json")
    .then((response) => response.json())
    .then((yearsData) => {
      const yearLabels = Object.values(yearsData).map((y) => y.label);
      const datasetsPromises = Object.values(yearsData).map((yearInfo) =>
        fetch(yearInfo.data)
          .then((r) => r.json())
          .then((yearData) => createDataset(yearData, yearInfo.label, yearInfo.color))
      );
      return Promise.all(datasetsPromises).then((datasets) => ({ datasets, yearLabels }));
    })
    .then(({ datasets, yearLabels }) => renderCharts(datasets, yearLabels))
    .catch((error) => console.error(`Error loading the data:, ${error}`));
});