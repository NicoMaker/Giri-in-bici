import { LANGUAGES, FLAG_CDN } from "./i18n.config.js";
import { activeLang, setLanguage } from "./i18n.language.js";

/** Immagine della bandiera (1x e 2x), sempre uguale su ogni dispositivo. */
function createFlag(country) {
  const img = document.createElement("img");
  img.className = "lang-flag notranslate";
  img.setAttribute("translate", "no");
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.width = 20;
  img.height = 15;
  img.loading = "lazy";
  img.src = `${FLAG_CDN}/w40/${country}.png`;
  img.srcset = `${FLAG_CDN}/w40/${country}.png 1x, ${FLAG_CDN}/w80/${country}.png 2x`;
  return img;
}

/** Pulsante di una lingua (bandiera + codice). */
function createButton(lang) {
  const isActive = activeLang === lang.code;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "lang-switcher-btn" + (isActive ? " is-active" : "");
  button.setAttribute("aria-pressed", isActive ? "true" : "false");
  button.setAttribute("aria-label", lang.label);
  button.title = lang.label;

  const code = document.createElement("span");
  code.className = "lang-code";
  code.textContent = lang.code.toUpperCase();

  button.appendChild(createFlag(lang.flagCountry));
  button.appendChild(code);
  button.addEventListener("click", () => setLanguage(lang.code));
  return button;
}

/** Selettore lingua fluttuante (IT / EN) in basso a sinistra, su ogni pagina. */
export function buildLanguageSwitcher() {
  if (document.querySelector(".lang-switcher")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "lang-switcher notranslate";
  wrapper.setAttribute("translate", "no");
  wrapper.setAttribute("role", "group");
  wrapper.setAttribute("aria-label", "Selettore lingua / Language selector");

  LANGUAGES.forEach((lang) => wrapper.appendChild(createButton(lang)));
  document.body.appendChild(wrapper);
}
