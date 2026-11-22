// pannello.js — Il pannello laterale del menu: ricerca, mappa e pagine divise per gruppi.
//
// Le pagine arrivano dall'indice del sito (../sito/indice.js): una pagina nuova
// compare da sola nel gruppo giusto. Prima si vede l'elenco, poi (a lettura finita)
// anche le sezioni di ogni pagina, che portano a pagina#ancora.
//
// Il markup mantiene le classi storiche (.menu, .menu-header, .menu-content):
// il CSS del drawer in css/assets/componenti/layout/struttura/drawer/ lo stila già.

import { ottieniIndice, completaIndice } from "../sito/indice.js";
import { chiave } from "../sito/percorsi.js";
import { htmlMenu } from "./albero.js";
import { collegaRicerca } from "./ricerca-menu.js";
import { collegaApertura } from "./apertura.js";
import { creaCondividi } from "../condividi/condividi.js";

const AZIONI = `<div class="menu-azioni">
  <button class="menu-mappa" type="button" data-apri-mappa><span class="ico-tile" data-icona="mappa"></span><span>Mappa del sito</span></button>
</div>`;

// Ridisegna i gruppi senza perdere ciò che la persona aveva aperto
const disegna = (pannello, indice) => {
  const lista = pannello.querySelector("#menuList");
  const apertiGruppi = new Set(
    [...lista.querySelectorAll("details[open]")].map((d) => d.dataset.gruppo),
  );
  const apertePagine = new Set(
    [...lista.querySelectorAll(".menu-espandi[aria-expanded=true]")].map(
      (b) => b.closest("li").dataset.nome,
    ),
  );

  const html = htmlMenu(indice, {
    corrente: chiave(window.location.href),
    live: window.GibSezioni || [],
  });
  lista.innerHTML = html;

  apertiGruppi.forEach((g) => {
    const d = lista.querySelector(`details[data-gruppo="${g}"]`);
    if (d) d.open = true;
  });
  lista.querySelectorAll(".menu-pagina").forEach((li) => {
    if (!apertePagine.has(li.dataset.nome)) return;
    li.querySelector(":scope > .menu-riga .menu-espandi")?.setAttribute(
      "aria-expanded",
      "true",
    );
    li.querySelector(":scope > .menu-sotto")?.removeAttribute("hidden");
  });

  if (window.Icone) window.Icone.riempi(pannello);
  window.dispatchEvent(new Event("classifica:url"));
  segnaSezione(pannello, window.GibSezioneAttiva);
};

// Accende nel menu la sezione che stai leggendo
const segnaSezione = (pannello, attiva) => {
  pannello
    .querySelectorAll(".menu-sezione.sezione-attiva")
    .forEach((a) => a.classList.remove("sezione-attiva"));
  if (!attiva) return;
  const qui = pannello.querySelector(".is-attivo");
  const li = qui && qui.closest(".menu-pagina");
  const link =
    li &&
    li.querySelector(
      `:scope > .menu-sotto > li > .menu-sezione[data-sezione="${attiva.id}"]`,
    );
  if (link) link.classList.add("sezione-attiva");
};

export const creaPannello = () => {
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
      ${AZIONI}
      <h1>Vai a</h1>
      <input id="menuSearch" type="search" placeholder="Cerca pagine e sezioni&hellip;" aria-label="Cerca nel menu" />
      <p class="no-results" id="menuNoResults" hidden>Nessun elemento trovato</p>
      <div id="menuList"></div>
    </div>`;

  // Subito sotto "Mappa del sito": condividere i dati della pagina
  pannello.querySelector(".menu-azioni").after(creaCondividi());

  const lista = pannello.querySelector("#menuList");
  collegaRicerca(
    pannello.querySelector("#menuSearch"),
    lista,
    pannello.querySelector("#menuNoResults"),
  );

  // Freccia: apre e chiude l'elenco di una pagina
  lista.addEventListener("click", (ev) => {
    const freccia = ev.target.closest(".menu-espandi");
    if (!freccia) return;
    const aperto = freccia.getAttribute("aria-expanded") === "true";
    freccia.setAttribute("aria-expanded", String(!aperto));
    freccia.closest("li").querySelector(":scope > .menu-sotto").hidden = aperto;
  });

  if (window.Icone) window.Icone.riempi(pannello);

  const ridisegna = () => ottieniIndice().then((i) => disegna(pannello, i));
  ridisegna();
  // Quando le pagine sono state lette arrivano anche le sezioni: si aggiorna da solo
  const lettura = () => completaIndice().then((i) => disegna(pannello, i));
  (window.requestIdleCallback || setTimeout)(lettura);
  window.addEventListener("sito:sezioni", ridisegna);
  window.addEventListener("sito:sezione", (ev) =>
    segnaSezione(pannello, ev.detail),
  );

  return pannello;
};

export const collegaPannello = (pannello, pulsante) => {
  collegaApertura(pannello, pulsante);
};
