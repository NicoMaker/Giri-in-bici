/* Configurazione del sistema di traduzione IT/EN (stesso schema del Portfolio) */

export const STORAGE_KEY = "giriinbici_lang";
export const SUPPORTED_LANGS = ["it", "en"];
/** Lingua in cui è scritto il sito */
export const SITE_SOURCE_LANG = "it";

export const GOOGLE_SCRIPT_URL =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
/** Margine (ms) dopo il load, per far trovare a Google anche i contenuti caricati da JSON/JS */
export const GOOGLE_LOAD_DELAY = 900;

export const FLAG_CDN = "https://flagcdn.com";
export const CSS_URL = "/css/assets/componenti/traduzione/selettore-lingua.css";

/* Bandiere come immagini reali (non emoji): su molti PC/Windows le
   emoji-bandiera non vengono renderizzate e mostrano solo "IT"/"GB". */
export const LANGUAGES = [
  { code: "it", flagCountry: "it", label: "Italiano" },
  { code: "en", flagCountry: "gb", label: "English" },
];

/* Contenuti che NON si traducono: marchio, contatti, codici, percorsi dei file,
   immagini-bandiera. I testi in italiano normali (titoli, tabelle, menu) sì. */
export const NO_TRANSLATE_SELECTORS = [
  'a[href^="tel:"]',
  'a[href^="mailto:"]',
  'a[href^="sms:"]',
  ".brand-text .riga-giri",
  ".footer-copy a",
  "code",
  "pre",
  "kbd",
  "canvas",
  ".lang-switcher",
  ".mappa-cerca-esito",
];
