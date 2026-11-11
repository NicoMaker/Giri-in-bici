// ============================================================
// comune.js — Medaglie e riga totale
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  CM.MEDAGLIE = ["🥇", "🥈", "🥉"];

  // Chiave di una stagione, uguale comunque sia scritta: "Autunno - Inverno",
  // "Autunno · Inverno", "Autunno-Inverno", "Autunno_Inverno", "autunno%20inverno"...
  // Serve perché gli indirizzi (?stagione=...) e i file JSON non scrivono
  // sempre il nome allo stesso modo.
  CM.chiaveStagione = function (testo) {
    const t = String(testo || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    if (t.includes("autunno") || t.includes("inverno"))
      return "autunno-inverno";
    if (t.includes("primavera")) return "primavera";
    if (t.includes("estate")) return "estate";
    return "";
  };

  // Dall'elenco "stagioniDisponibili" (i nomi come li usa la pagina) tiene
  // solo quelle citate nel parametro ?stagione= (anche più, separate da
  // virgola). Se il parametro manca o non cita nessuna stagione valida,
  // restituisce tutte le stagioni.
  CM.stagioniDaParametro = function (parametro, stagioniDisponibili) {
    if (!parametro) return stagioniDisponibili.slice();
    const chiavi = parametro
      .split(",")
      .map((s) => CM.chiaveStagione(s))
      .filter(Boolean);
    const scelte = stagioniDisponibili.filter((nome) =>
      chiavi.includes(CM.chiaveStagione(nome)),
    );
    return scelte.length ? scelte : stagioniDisponibili.slice();
  };

  CM.creaRigaTotale = function (totaleKm, etichetta) {
    return `
      <li class="classifica-riga classifica-riga--totale">
        <span class="classifica-riga__posizione" aria-hidden="true">&sum;</span>
        <span class="classifica-riga__mese">Totale ${etichetta}</span>
        <span class="classifica-riga__barra"></span>
        <span class="classifica-riga__km">${formatItalianNumber(totaleKm)} km</span>
        <span class="classifica-riga__percentuale">100 %</span>
      </li>`;
  };
})(window.ClassificaMesi);
