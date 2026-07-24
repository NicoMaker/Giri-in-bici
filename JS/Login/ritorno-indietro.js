// ============================================================
// ritorno-indietro.js — Ricarica la pagina se si torna col tasto Indietro
// Richiamato da Login/scriptLogin.js
// ============================================================

// 🔁 Rileva ritorno tramite tasto "Indietro" e forza un reload completo
window.addEventListener("pageshow", function (event) {
  if (
    event.persisted ||
    performance.getEntriesByType("navigation")[0].type === "back_forward"
  ) {
    location.reload();
  }
});
