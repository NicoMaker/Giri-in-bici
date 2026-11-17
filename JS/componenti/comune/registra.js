// registra.js — Registra un Web Component una volta sola (nessun errore se già definito).

export function registra(nome, classe) {
  if (!customElements.get(nome)) customElements.define(nome, classe);
}
