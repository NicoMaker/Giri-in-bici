// ============================================================
// variazioni.js — Calcola la variazione percentuale fra due valori
// e disegna il distintivo (badge) corrispondente: ▲ aumento,
// ▼ calo, ● invariato, — nessun dato precedente.
//
// Nato dentro Statistiche/History/storico-mensile (la tabella dei
// mesi a confronto), qui e' reso riutilizzabile per le altre
// pagine con "precedente / successivo": le schede dei periodi
// (periodi-stagione), le schede degli anni (statistiche-generali)
// e le schede delle stagioni (Statistiche/stagioni).
//
// Dipendenze: JS/core/formattazione-numeri.js (formatNumber)
// ============================================================

window.Variazioni = window.Variazioni || {};

(function (V) {
  "use strict";

  // calcVariazione — percentuale fra valoreAttuale e valorePrecedente.
  // Torna null se manca un valore precedente su cui confrontarsi
  // (dato assente o zero): in quel caso il distintivo mostra "—".
  V.calcVariazione = function (valoreAttuale, valorePrecedente) {
    if (!valorePrecedente) return null;
    return ((valoreAttuale - valorePrecedente) / valorePrecedente) * 100;
  };

  // badgeVariazione — HTML del distintivo. "etichetta" e' il testo
  // facoltativo aggiunto in coda (es. "vs periodo prec.").
  V.badgeVariazione = function (perc, etichetta) {
    const suffisso = etichetta ? ` ${etichetta}` : "";
    if (perc === null) {
      return `<span class="badge badge-neutro">—${suffisso}</span>`;
    }
    const segno = perc > 0 ? "+" : "";
    const cls = perc > 0 ? "badge-su" : perc < 0 ? "badge-giu" : "badge-pari";
    const freccia = perc > 0 ? "▲" : perc < 0 ? "▼" : "●";
    const percStr = formatNumber(Math.abs(perc));
    const meno = perc < 0 ? "-" : "";
    return `<span class="badge ${cls}">${freccia} ${meno}${segno}${percStr}%${suffisso}</span>`;
  };

  // legenda — la stessa fascia di legenda usata nello storico
  // mensile, cosi' il significato dei colori e' chiaro ovunque
  // compaiano i distintivi. "nota" e' il testo fra parentesi.
  V.legenda = function (nota) {
    return `
      <div class="legenda-variazioni">
        <span class="badge badge-su">▲ aumento</span>
        <span class="badge badge-giu">▼ calo</span>
        <span class="badge badge-pari">● invariato</span>
        <span class="badge badge-neutro">— nessun dato precedente</span>
        <span class="legenda-nota">${nota}</span>
      </div>`;
  };
})(window.Variazioni);
