import { STORAGE_KEY, SUPPORTED_LANGS } from "./i18n.config.js";

/** Lingua scelta a mano dall'utente (localStorage), o null se non c'è. */
export function getSavedLang() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
  } catch (err) {
    /* localStorage non disponibile (es. modalità privata): si ignora */
  }
  return null;
}

/** Salva la scelta dell'utente, valida su tutte le pagine del sito. */
export function saveLang(lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch (err) {
    /* localStorage non disponibile: la scelta vale solo per la sessione */
  }
}
