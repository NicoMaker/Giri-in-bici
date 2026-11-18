// pannello.js — Il pannello laterale del menu: titolo, ricerca e elenco delle voci.
//
// Il markup è quello storico (.menu, .menu-header, .menu-content, #menuList):
// il CSS del drawer in css/assets/componenti/layout/struttura/drawer/ lo stila già.

import { escapeHtml } from "../comune/escape-html.js";
import { caricaVoci } from "./voci-menu.js";
import { percorsoNormalizzato, indirizzoAttivo } from "./pagina-attiva.js";
import { collegaRicerca } from "./ricerca-menu.js";
import { collegaApertura } from "./apertura.js";

const iconaVoce = (voce) => {
  if (voce.icona) {
    return `<span class="ico-tile" data-icona="${escapeHtml(voce.icona)}"></span>`;
  }
  const classe = voce.nome === "Apertura Account GitHub" ? ' class="logo"' : "";
  return `<span class="ico-tile"><img src="${escapeHtml(voce.immagine)}"${classe} alt="" /></span>`;
};

const htmlVoce = (voce, attivo) => {
  const nome = escapeHtml(voce.nome);
  const marcaPagina = attivo ? ' aria-current="page" class="is-attivo"' : "";

  // "Pagina Precedente" riporta alla pagina vista prima
  if (voce.indietro) {
    return `<li data-nome="${nome}"><a href="javascript:history.back()" class="menu-back">${iconaVoce(voce)}<span>${nome}</span></a></li>`;
  }

  const apertura = voce.fuori ? ' target="_blank" rel="noopener"' : "";
  const classifica = voce.classifica ? " data-classifica" : "";
  return `<li data-nome="${nome}"><a href="${escapeHtml(voce.link)}"${apertura}${classifica}${marcaPagina}>${iconaVoce(voce)}<span>${nome}</span></a></li>`;
};

// "Torna a Estate": la freccia indietro che le pagine di dettaglio avevano nella barra.
const htmlTornaIndietro = (indirizzo, titolo) => {
  if (!indirizzo) return "";
  const testo = escapeHtml(titolo || "Indietro");
  return `<a class="menu-torna" href="${escapeHtml(indirizzo)}">
          <span class="ico-tile" data-icona="indietro"></span><span>${testo}</span>
        </a>`;
};

// Disegna le voci nell'elenco (in ordine alfabetico, come nella home) e accende quella attuale.
const mostraVoci = (pannello, vociMenu) => {
  const voci = [...vociMenu].sort((a, b) => a.nome.localeCompare(b.nome));
  const indirizziVoci = voci
    .filter((v) => !v.indietro && !v.fuori)
    .map((v) => percorsoNormalizzato(v.link));
  const attiva = indirizzoAttivo(indirizziVoci);

  pannello.querySelector("#menuList").innerHTML = voci
    .map((v) =>
      htmlVoce(
        v,
        !v.indietro && !v.fuori && percorsoNormalizzato(v.link) === attiva,
      ),
    )
    .join("");

  // Icone disegnate e indirizzo della Classifica (che dipende dalla pagina)
  if (window.Icone) window.Icone.riempi(pannello);
  window.dispatchEvent(new Event("classifica:url"));
};

export const creaPannello = ({ indietro, indietroTitolo }) => {
  const pannello = document.createElement("nav");
  pannello.className = "menu";
  pannello.id = "menu-sito";
  pannello.setAttribute("aria-label", "Menu del sito");

  pannello.innerHTML = `
    <div class="menu-header">
      <button class="menu-close" type="button" aria-label="Chiudi il menu">
        <span data-icona="chiudi"></span>
      </button>
    </div>
    <div class="menu-content">
      ${htmlTornaIndietro(indietro, indietroTitolo)}
      <h1>Vai a</h1>
      <input id="menuSearch" type="search" placeholder="Cerca nel menu&hellip;" aria-label="Cerca nel menu" />
      <p class="no-results" id="menuNoResults" hidden>Nessun elemento trovato</p>
      <ul id="menuList"></ul>
    </div>`;

  collegaRicerca(
    pannello.querySelector("#menuSearch"),
    pannello.querySelector("#menuList"),
    pannello.querySelector("#menuNoResults"),
  );

  caricaVoci().then((voci) => mostraVoci(pannello, voci));

  return pannello;
};

export const collegaPannello = (pannello, pulsante) => {
  collegaApertura(pannello, pulsante);
};
