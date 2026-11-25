import { SITE_SOURCE_LANG } from "./i18n.config.js";

const EXPIRED = "expires=Thu, 01 Jan 1970 00:00:00 UTC;";

/**
 * Imposta il cookie "googtrans" che dice a Google in che lingua tradurre.
 * Va impostato PRIMA di caricare lo script di Google, così la traduzione
 * viene applicata automaticamente a ogni pagina.
 */
export function setGoogTransCookie(lang) {
  const value =
    lang === SITE_SOURCE_LANG ? "" : "/" + SITE_SOURCE_LANG + "/" + lang;
  const host = window.location.hostname;

  /* Rimuove eventuali cookie precedenti su tutte le varianti di path/dominio */
  document.cookie = "googtrans=; " + EXPIRED + " path=/;";
  if (host) {
    document.cookie =
      "googtrans=; " + EXPIRED + " path=/; domain=" + host + ";";
    document.cookie =
      "googtrans=; " + EXPIRED + " path=/; domain=." + host + ";";
  }

  if (!value) return;

  document.cookie = "googtrans=" + value + "; path=/;";
  if (host) {
    document.cookie = "googtrans=" + value + "; path=/; domain=" + host + ";";
    document.cookie = "googtrans=" + value + "; path=/; domain=." + host + ";";
  }
}
