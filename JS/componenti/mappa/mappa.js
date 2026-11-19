// mappa.js — Il modale "Mappa del sito": tutte le pagine, i collegamenti e le sezioni.
//
// Si apre dal pulsante nella barra o dal menu (qualsiasi [data-apri-mappa]).
// Usa l'indice del sito (../sito/indice.js): le pagine nuove compaiono da sole.

import { completaIndice } from "../sito/indice.js";
import { chiave } from "../sito/percorsi.js";
import { costruisciModello } from "./modello.js";
import { htmlTela } from "./schede.js";
import { disegnaFili } from "./fili.js";
import { htmlLegenda, aggiornaDove } from "./legenda.js";

const ZOOM = { min: 0.35, max: 1.6, passo: 0.15 };

export const creaMappa = () => {
  const dialogo = document.createElement("dialog");
  dialogo.className = "mappa-modale";
  dialogo.setAttribute("aria-label", "Mappa del sito");
  dialogo.innerHTML = `
    <div class="mappa-testa">
      <h2>Mappa del sito</h2>
      <div class="mappa-strumenti">
        <button type="button" data-zoom="-" aria-label="Riduci">−</button>
        <button type="button" data-zoom="0" aria-label="Adatta alla finestra">Adatta</button>
        <button type="button" data-zoom="+" aria-label="Ingrandisci">+</button>
        <button type="button" data-qui>Dove sono</button>
        <button type="button" class="mappa-chiudi" data-chiudi aria-label="Chiudi la mappa">✕</button>
      </div>
    </div>
    <div class="mappa-legenda">${htmlLegenda()}</div>
    <div class="mappa-vista"><div class="mappa-ruota"><div class="mappa-tela"><p class="mappa-attesa">Sto leggendo le pagine del sito…</p></div></div></div>`;

  // Su telefono la legenda parte chiusa: resta visibile solo "Sei in ..."
  if (matchMedia("(max-width: 700px)").matches)
    dialogo.querySelector(".mappa-leg").open = false;
  const vista = dialogo.querySelector(".mappa-vista");
  const ruota = dialogo.querySelector(".mappa-ruota");
  const tela = dialogo.querySelector(".mappa-tela");
  let stato = {
    indice: null,
    modello: null,
    zoom: 1,
    scelta: null,
    pinnata: null,
  };

  const applicaZoom = (z) => {
    stato.zoom = Math.min(ZOOM.max, Math.max(ZOOM.min, z));
    tela.style.transform = `scale(${stato.zoom})`;
    ruota.style.width = `${tela.offsetWidth * stato.zoom}px`;
    ruota.style.height = `${tela.offsetHeight * stato.zoom}px`;
  };
  const adatta = () =>
    applicaZoom(
      Math.min(
        1,
        Math.max(ZOOM.min, (vista.clientWidth - 24) / tela.offsetWidth),
      ),
    );

  const fili = () =>
    disegnaFili(
      tela,
      stato.modello,
      stato.indice.collegamenti || [],
      stato.scelta,
    );

  const vaiAQui = () => {
    const k = chiave(window.location.href);
    const scheda = [...tela.querySelectorAll(".mappa-scheda")].find(
      (s) => s.dataset.k === k,
    );
    if (!scheda) return;
    const r = scheda.getBoundingClientRect(),
      v = vista.getBoundingClientRect();
    vista.scrollBy({
      left: r.left - v.left - v.width / 2 + r.width / 2,
      top: r.top - v.top - v.height / 2 + r.height / 2,
      behavior: "smooth",
    });
  };

  const disegna = (indice, primaVolta) => {
    stato.indice = indice;
    stato.modello = costruisciModello(indice);
    tela.style.transform = "none";
    tela.innerHTML = htmlTela(stato.modello, chiave(window.location.href));
    if (window.Icone) window.Icone.riempi(tela);
    if (!primaVolta) applicaZoom(stato.zoom);
    else if (matchMedia("(max-width: 700px)").matches)
      applicaZoom(0.6); // telefono: leggibile, poi si scorre
    else adatta();
    aggiornaDove(dialogo, indice);
    fili();
    if (primaVolta) vaiAQui();
  };

  const scegli = (k) => {
    stato.scelta = k || stato.pinnata;
    fili();
  };

  tela.addEventListener("mouseover", (ev) => {
    const s = ev.target.closest(".mappa-scheda");
    if (s && !stato.pinnata) scegli(s.dataset.k);
  });
  tela.addEventListener("mouseleave", () => !stato.pinnata && scegli(null));
  tela.addEventListener("focusin", (ev) => {
    const s = ev.target.closest(".mappa-scheda");
    if (s && !stato.pinnata) scegli(s.dataset.k);
  });
  tela.addEventListener("click", (ev) => {
    const pulsante = ev.target.closest(".mappa-coll");
    if (pulsante) {
      const k = pulsante.closest(".mappa-scheda").dataset.k;
      stato.pinnata = stato.pinnata === k ? null : k;
      tela
        .querySelectorAll(".mappa-coll")
        .forEach((b) =>
          b.setAttribute(
            "aria-pressed",
            String(b === pulsante && stato.pinnata === k),
          ),
        );
      scegli(stato.pinnata);
      return;
    }
    if (ev.target.closest("a")) dialogo.close(); // si va alla pagina (o alla sezione) scelta
  });

  dialogo.addEventListener("click", (ev) => {
    if (ev.target === dialogo || ev.target.closest("[data-chiudi]"))
      return dialogo.close();
    const z = ev.target.closest("[data-zoom]");
    if (z) {
      const m = z.dataset.zoom;
      if (m === "0") adatta();
      else applicaZoom(stato.zoom + (m === "+" ? ZOOM.passo : -ZOOM.passo));
      fili();
    }
    if (ev.target.closest("[data-qui]")) vaiAQui();
  });

  window.addEventListener(
    "sito:sezione",
    () => dialogo.open && stato.indice && aggiornaDove(dialogo, stato.indice),
  );
  window.addEventListener(
    "sito:indice",
    (ev) => dialogo.open && disegna(ev.detail, false),
  );

  const apri = () => {
    if (!dialogo.open) dialogo.showModal();
    completaIndice().then((indice) => dialogo.open && disegna(indice, true));
  };
  document.addEventListener("click", (ev) => {
    if (ev.target.closest("[data-apri-mappa]")) apri();
  });
  window.addEventListener("mappa:apri", apri);

  return dialogo;
};
