// ricerca-tabelle.js — Un campo "Cerca" sopra ogni tabella di dati del sito
// (uscite di ogni stagione, statistiche per anno, mensili, totali, storico).
//
// Funziona da solo: le tabelle si riempiono dopo il caricamento dei JSON, quindi
// un MutationObserver aspetta che abbiano le righe, poi aggiunge il campo.
// Il filtro nasconde le righe che non corrispondono (tutte le parole scritte
// devono comparire nella riga, senza distinguere maiuscole e accenti);
// intestazioni e righe "Totale" restano sempre visibili.
//
// Se la tabella ha una colonna di distanza (intestazione con "km" o "distanza") compaiono
// anche i campi "Da / A km": le righe fuori intervallo si nascondono. In ogni caso le righe
// "Totale" si ricalcolano su quello che si vede (solo le colonne che sono davvero somme).
//
// Per escludere una tabella: <table data-senza-ricerca>.

const MIN_RIGHE = 3; // sotto questa soglia il campo non serve
const CLASSE_NASCOSTA = "ricerca-tabella__nascosta";
let contatore = 0;

const norma = (t) =>
  String(t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const STILE = `
.ricerca-tabella{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .9rem;margin:0 0 .8rem}
.ricerca-tabella__campo{position:relative;flex:1 1 240px;max-width:420px}
.ricerca-tabella__campo input{width:100%;height:44px;padding:0 1rem 0 2.5rem;font:inherit;color:var(--ink,inherit);background:var(--surface-2,var(--surface,#fff));border:1px solid var(--line,#d8dde6);border-radius:var(--r-full,999px);box-sizing:border-box}
.ricerca-tabella__campo input:focus-visible{outline:0;border-color:var(--a1,#0d9488);box-shadow:0 0 0 3px var(--a-soft,rgba(13,148,136,.18))}
.ricerca-tabella__campo svg{position:absolute;left:.9rem;top:50%;width:18px;height:18px;transform:translateY(-50%);pointer-events:none;opacity:.55}
.ricerca-tabella__km{display:inline-flex;align-items:center;gap:.4rem;font-size:.88rem;font-weight:600}
.ricerca-tabella__km input{width:6.2rem;height:44px;padding:0 .8rem;font:inherit;color:var(--ink,inherit);background:var(--surface-2,var(--surface,#fff));border:1px solid var(--line,#d8dde6);border-radius:var(--r-full,999px);box-sizing:border-box}
.ricerca-tabella__km input:focus-visible{outline:0;border-color:var(--a1,#0d9488);box-shadow:0 0 0 3px var(--a-soft,rgba(13,148,136,.18))}
.ricerca-tabella__esito{font-size:.85rem;color:var(--ink-2,inherit);opacity:.85}
.ricerca-tabella__vuoto{margin:.8rem 0 0;padding:1rem;text-align:center;border:2px dashed var(--line,#d8dde6);border-radius:var(--r-lg,16px);color:var(--ink-2,inherit)}
.${CLASSE_NASCOSTA}{display:none !important}
`;
const iniettaStile = () => {
  if (document.getElementById("gib-ricerca-tabelle-stile")) return;
  const s = document.createElement("style");
  s.id = "gib-ricerca-tabelle-stile";
  s.textContent = STILE;
  document.head.appendChild(s);
};

// Le righe di dati: hanno almeno una cella <td>, non sono in thead/tfoot e non sono totali.
const righeDati = (tabella) =>
  [...tabella.querySelectorAll("tr")].filter(
    (r) =>
      r.querySelector("td") &&
      !r.closest("thead, tfoot") &&
      !/total/i.test(r.className) &&
      !/^totale\b/i.test(r.cells[0]?.textContent.trim() || ""),
  );

// "1.234,5" → 1234.5 (numero italiano); NaN se la cella non è un numero semplice
const numero = (t) => {
  const v = String(t || "").trim();
  if (!/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$/.test(v)) return NaN;
  return parseFloat(v.replace(/\./g, "").replace(",", "."));
};
// Colonna con i km: tabelle a una sola riga di intestazione (le tabelle a doppia intestazione, come
// lo storico mensile, hanno i loro filtri nella pagina).
const colonnaKm = (tabella) => {
  const righeTesta = tabella.querySelectorAll("thead tr");
  if (righeTesta.length !== 1) return -1;
  return [...righeTesta[0].cells].findIndex((c) =>
    /\bkm\b|distanza/i.test(c.textContent),
  );
};
const testoNumero = (v, modello) => {
  const dec = (String(modello).split(",")[1] || "").length;
  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: Math.min(dec, 2),
    maximumFractionDigits: Math.min(dec, 2),
    useGrouping: "always",
  }).format(v);
};
// Le righe "Totale" seguono i filtri: si ricalcolano solo le colonne che nella tabella intera sono
// una somma esatta delle righe (percentuali e medie restano come sono).
const aggiornaTotali = (tabella, righe, visibili) => {
  tabella.querySelectorAll("tfoot tr, tr[class*='total']").forEach((t) => {
    [...t.cells].slice(1).forEach((cella) => {
      const j = cella.cellIndex;
      if (cella.dataset.totOrig === undefined)
        cella.dataset.totOrig = cella.textContent.trim();
      const orig = numero(cella.dataset.totOrig);
      if (Number.isNaN(orig)) return;
      const valori = righe.map((r) => numero(r.cells[j]?.textContent));
      if (!valori.length || valori.some(Number.isNaN)) return;
      const somma = valori.reduce((a, b) => a + b, 0);
      if (Math.abs(somma - orig) > 0.5 + Math.abs(orig) * 0.01) return; // non è una somma
      const nuova = righe.reduce(
        (a, r, i) => (visibili.has(r) ? a + valori[i] : a),
        0,
      );
      const testo =
        visibili.size === righe.length
          ? cella.dataset.totOrig
          : testoNumero(nuova, cella.dataset.totOrig);
      if (cella.textContent !== testo) cella.textContent = testo;
    });
  });
};

const installa = (tabella) => {
  iniettaStile();
  const id = `ricerca-tabella-${++contatore}`;
  const contenitore =
    tabella.closest(".table-wrap, .storico-tabella-wrapper") || tabella;

  const barra = document.createElement("div");
  barra.className = "ricerca-tabella";
  barra.setAttribute("role", "search");
  barra.innerHTML = `<label class="ricerca-tabella__campo" for="${id}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input type="search" id="${id}" placeholder="Cerca nella tabella…" aria-label="Cerca nella tabella" autocomplete="off" />
    </label>
    <span class="ricerca-tabella__esito" aria-live="polite"></span>`;
  const colKm = colonnaKm(tabella);
  if (colKm >= 0) {
    const km = document.createElement("span");
    km.className = "ricerca-tabella__km";
    km.innerHTML = `Distanza
      <input type="number" min="0" step="any" inputmode="decimal" placeholder="Da km" aria-label="Distanza minima in km" data-km="min" />
      <input type="number" min="0" step="any" inputmode="decimal" placeholder="A km" aria-label="Distanza massima in km" data-km="max" />`;
    barra.querySelector(".ricerca-tabella__campo").after(km);
  }
  const vuoto = document.createElement("p");
  vuoto.className = "ricerca-tabella__vuoto";
  vuoto.hidden = true;
  contenitore.before(barra);
  contenitore.after(vuoto);

  const campo = barra.querySelector("input");
  const esito = barra.querySelector(".ricerca-tabella__esito");

  const applica = () => {
    const parole = norma(campo.value).split(" ").filter(Boolean);
    const righe = righeDati(tabella);
    const minimo = parseFloat(
      barra.querySelector('[data-km="min"]')?.value.replace(",", "."),
    );
    const massimo = parseFloat(
      barra.querySelector('[data-km="max"]')?.value.replace(",", "."),
    );
    const filtroKm = Number.isFinite(minimo) || Number.isFinite(massimo);
    const insieme = new Set();
    righe.forEach((r) => {
      const testo = norma(r.textContent);
      let ok = parole.every((p) => testo.includes(p));
      if (ok && filtroKm && colKm >= 0) {
        const v = numero(r.cells[colKm]?.textContent);
        ok =
          !Number.isNaN(v) &&
          v >= (Number.isFinite(minimo) ? minimo : -Infinity) &&
          v <= (Number.isFinite(massimo) ? massimo : Infinity);
      }
      r.classList.toggle(CLASSE_NASCOSTA, !ok);
      if (ok) insieme.add(r);
    });
    const visibili = insieme.size;
    const filtrato = parole.length > 0 || filtroKm;
    esito.textContent = filtrato
      ? `${visibili} ${visibili === 1 ? "risultato" : "risultati"} su ${righe.length}`
      : `${righe.length} righe`;
    vuoto.hidden = !(filtrato && righe.length && visibili === 0);
    if (!vuoto.hidden)
      vuoto.textContent = parole.length
        ? `Nessun risultato per “${campo.value.trim()}”.`
        : "Nessuna riga nell'intervallo di distanza scelto.";
    aggiornaTotali(tabella, righe, insieme);
  };

  campo.addEventListener("input", applica);
  barra
    .querySelectorAll("[data-km]")
    .forEach((i) => i.addEventListener("input", applica));
  // se la tabella viene ridisegnata (nuovi dati, cambio vista) il filtro resta attivo
  new MutationObserver(applica).observe(tabella, {
    childList: true,
    subtree: true,
  });
  applica();
};

const scansiona = () => {
  document.querySelectorAll("table:not([data-ricerca-pronta])").forEach((t) => {
    if (
      t.closest("dialog, [data-senza-ricerca]") ||
      t.hasAttribute("data-senza-ricerca")
    )
      return;
    if (righeDati(t).length < MIN_RIGHE) return; // ancora vuota o troppo piccola: riprova al prossimo cambio
    t.dataset.ricercaPronta = "1";
    installa(t);
  });
};

let atteso = false;
const programma = () => {
  if (atteso) return;
  atteso = true;
  requestAnimationFrame(() => {
    atteso = false;
    scansiona();
  });
};
new MutationObserver(programma).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
document.addEventListener("DOMContentLoaded", programma);
programma();
