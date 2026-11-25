/**
 * Giri in Bici — traduzione automatica IT/EN (stesso sistema del Portfolio)
 * -------------------------------------------------------------------------
 * - Al primo accesso rileva la lingua del dispositivo (navigator.language):
 *   italiano → italiano, qualsiasi altra lingua → inglese.
 * - Se l'utente sceglie una lingua col selettore (in basso a sinistra), la
 *   scelta resta salvata in localStorage su TUTTE le pagine.
 * - Traduce con "Google Website Translator", pilotato in automatico: la sua
 *   interfaccia è nascosta e sostituita dal selettore IT/EN.
 * - Non traduce marchio, contatti, codici e percorsi (vedi i18n.config.js).
 *
 * Caricato da componenti/index.js, quindi presente in ogni pagina.
 *
 *   i18n.config.js    costanti e liste
 *   i18n.storage.js   preferenza (localStorage)
 *   i18n.detect.js    lingua del dispositivo
 *   i18n.cookie.js    cookie "googtrans"
 *   i18n.language.js  lingua attiva, cambio lingua, API globale
 *   i18n.google.js    caricamento del traduttore (solo se non italiano)
 *   i18n.switcher.js  selettore IT / EN
 *   i18n.protect.js   contenuti da non tradurre
 */
import { CSS_URL } from "./i18n.config.js";
import { initLanguage, exposeApi } from "./i18n.language.js";
import { buildLanguageSwitcher } from "./i18n.switcher.js";
import {
  protectNonTranslatableContent,
  watchDynamicContent,
} from "./i18n.protect.js";
import { scheduleGoogleTranslate } from "./i18n.google.js";

/* Lingua e cookie subito, prima che lo script di Google venga caricato */
initLanguage();
exposeApi();

const caricaStile = () => {
  if (document.querySelector("link[data-traduzione]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = CSS_URL;
  link.dataset.traduzione = "1";
  document.head.appendChild(link);
};

function init() {
  caricaStile();
  protectNonTranslatableContent();
  buildLanguageSwitcher();
  watchDynamicContent();
  scheduleGoogleTranslate();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
