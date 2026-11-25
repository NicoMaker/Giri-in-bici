// ricerca-tabelle.js — Un campo "Cerca" sopra ogni tabella di dati del sito
// (uscite di ogni stagione, statistiche per anno, mensili, totali, storico).
//
// Funziona da solo: le tabelle si riempiono dopo il caricamento dei JSON, quindi
// un MutationObserver aspetta che abbiano le righe, poi aggiunge il campo.
// Il filtro nasconde le righe che non corrispondono (tutte le parole scritte
// devono comparire nella riga, senza distinguere maiuscole e accenti);
// intestazioni e righe "Totale" restano sempre visibili.
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
    let visibili = 0;
    righe.forEach((r) => {
      const testo = norma(r.textContent);
      const ok = parole.every((p) => testo.includes(p));
      r.classList.toggle(CLASSE_NASCOSTA, !ok);
      if (ok) visibili++;
    });
    esito.textContent = parole.length
      ? `${visibili} ${visibili === 1 ? "risultato" : "risultati"} su ${righe.length}`
      : `${righe.length} righe`;
    vuoto.hidden = !(parole.length && righe.length && visibili === 0);
    if (!vuoto.hidden)
      vuoto.textContent = `Nessun risultato per “${campo.value.trim()}”.`;
  };

  campo.addEventListener("input", applica);
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
