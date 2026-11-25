import { SUPPORTED_LANGS } from "./i18n.config.js";
import { saveLang } from "./i18n.storage.js";
import { resolveActiveLang } from "./i18n.detect.js";
import { setGoogTransCookie } from "./i18n.cookie.js";

/** Lingua attiva per questo caricamento pagina. */
export const activeLang = resolveActiveLang();

/** Applica la lingua attiva: attributo lang dell'<html> + cookie di Google. */
export function initLanguage() {
  document.documentElement.setAttribute("lang", activeLang);
  setGoogTransCookie(activeLang);
}

/** Cambia lingua: salva la scelta, aggiorna il cookie e ricarica la pagina. */
export function setLanguage(lang) {
  if (SUPPORTED_LANGS.indexOf(lang) === -1 || lang === activeLang) return;
  saveLang(lang);
  setGoogTransCookie(lang);
  window.location.reload();
}

/** Espone l'API globale usata da altre pagine/script del sito. */
export function exposeApi() {
  window.GiriInBiciI18n = {
    getLang: () => activeLang,
    setLang: setLanguage,
    supportedLangs: SUPPORTED_LANGS,
  };
}
