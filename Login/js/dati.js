// ============================================================
// dati.js — Carica i dati degli utenti dal JSON
// Richiamato da Login/scriptLogin.js
// ============================================================

// Variabile globale temporanea (non salvata)
let appData = null;

// Carica i dati utente
async function loadAppData() {
  try {
    const response = await fetch("../About_US/JS/Users.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    appData = await response.json();
    return appData;
  } catch (error) {
    console.error("Errore nel caricamento dei dati:", error);
    throw error;
  }
}
