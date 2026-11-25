import { NO_TRANSLATE_SELECTORS } from "./i18n.config.js";

/**
 * Marca come "notranslate" i contenuti che non vanno tradotti (marchio,
 * contatti, codici): Google a volte li altera quando sono dentro frasi.
 */
export function protectNonTranslatableContent() {
  NO_TRANSLATE_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => {
      if (node.translate === false) return;
      node.classList.add("notranslate");
      node.setAttribute("translate", "no");
    });
  });
}

/**
 * Barra, piede e tabelle sono generati via JS dopo il caricamento:
 * osserva il DOM e riapplica la protezione quando compare nuovo contenuto.
 */
export function watchDynamicContent() {
  if (!("MutationObserver" in window)) return;
  let atteso = false;
  new MutationObserver(() => {
    if (atteso) return;
    atteso = true;
    requestAnimationFrame(() => {
      atteso = false;
      protectNonTranslatableContent();
    });
  }).observe(document.body, { childList: true, subtree: true });
}
