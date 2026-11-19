// ancore.js — Dà un'ancora a ogni sezione della pagina e sa portarti lì.
//
//  - assegna un id a ogni sezione (dal titolo, vedi sito/slug.js), così #le-uscite funziona
//  - se l'indirizzo ha già un #ancora, scorre fino alla sezione e la evidenzia un attimo
//  - segue lo scroll e dice in che sezione sei: evento window "sito:sezione" {id, titolo}
//    (lo usano la mappa e il menu per segnare "sei qui")

import { trovaSezioni } from "../sito/slug.js";

const evidenzia = (el) => {
  el.classList.remove("sezione-evidenziata");
  void el.offsetWidth; // riavvia l'animazione
  el.classList.add("sezione-evidenziata");
  setTimeout(() => el.classList.remove("sezione-evidenziata"), 2200);
};

const vaiA = (id) => {
  const el = id && document.getElementById(decodeURIComponent(id));
  if (!el) return;
  const ridotto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: ridotto ? "auto" : "smooth", block: "start" });
  evidenzia(el);
};

const seguiScroll = (sezioni) => {
  if (!sezioni.length || !("IntersectionObserver" in window)) return;
  const visibili = new Map();
  const annuncia = () => {
    const attive = sezioni.filter((s) => visibili.get(s.el));
    const scelta = attive[0] || null;
    window.GibSezioneAttiva = scelta ? { id: scelta.id, titolo: scelta.titolo } : null;
    window.dispatchEvent(new CustomEvent("sito:sezione", { detail: window.GibSezioneAttiva }));
  };
  const osservatore = new IntersectionObserver(
    (voci) => {
      voci.forEach((v) => visibili.set(v.target, v.isIntersecting));
      annuncia();
    },
    { rootMargin: "-20% 0px -55% 0px" },
  );
  sezioni.forEach((s) => osservatore.observe(s.el));
};

const avvia = () => {
  const sezioni = trovaSezioni(document);
  sezioni.forEach((s) => {
    if (!s.el.id) s.el.id = s.id;
    else s.id = s.el.id;
  });
  window.GibSezioni = sezioni.map(({ id, titolo, vista }) => ({ id, titolo, vista }));
  window.dispatchEvent(new CustomEvent("sito:sezioni", { detail: window.GibSezioni }));

  const apri = () => vaiA(window.location.hash.slice(1));
  // Dopo il caricamento completo: tabelle e grafici hanno già preso la loro altezza
  if (window.location.hash) {
    apri();
    window.addEventListener("load", () => setTimeout(apri, 250), { once: true });
  }
  window.addEventListener("hashchange", apri);
  seguiScroll(sezioni);
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", avvia);
else avvia();
