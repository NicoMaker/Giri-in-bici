// ============================================================
// dati.js — Carica i dati degli utenti dal JSON
// Richiamato da Login/scriptLogin.js
// ============================================================

// Variabile globale temporanea (non salvata)
let appData = null;

// Carica i dati utente
async function loadAppData() {
  try {
    appData = await Json.leggi("../About_US/JS/Users.json");
    return appData;
  } catch (error) {
    console.error("Errore nel caricamento dei dati:", error);
    throw error;
  }
}
