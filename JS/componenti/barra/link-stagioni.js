// link-stagioni.js — Il link "Stagioni" a destra della barra.

export function linkStagioni(attivo) {
  if (!attivo) return "";
  return `<a class="graficostagioni" href="/Statistiche/stagioni.html" title="Confronto tra le stagioni"><img class="Stagioni" src="/img/assets/stagioni.svg" alt="" /><span class="graficostagioni-testo">Stagioni</span></a>`;
}
