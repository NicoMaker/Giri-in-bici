import { getSavedLang } from "./i18n.storage.js";

/**
 * Lingua del dispositivo: italiano -> "it", qualsiasi altra lingua -> "en"
 * (la prima volta il sito parte in inglese).
 */
export function detectDeviceLang() {
  const navLang = (
    (navigator.language ||
      (navigator.languages && navigator.languages[0]) ||
      navigator.userLanguage ||
      "") + ""
  ).toLowerCase();

  return navLang.indexOf("it") === 0 ? "it" : "en";
}

/**
 * Lingua attiva per questo caricamento pagina:
 * 1) preferenza salvata dall'utente (ha sempre la priorità)
 * 2) lingua rilevata dal dispositivo/browser
 */
export const resolveActiveLang = () => getSavedLang() || detectDeviceLang();
