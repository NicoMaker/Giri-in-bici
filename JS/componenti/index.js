// index.js — Punto d'ingresso dei componenti condivisi del sito.
//
//   <script type="module" src="/js/componenti/index.js"></script>
//
// Metterlo come PRIMO script dell'<head>: i moduli partono in ordine insieme
// agli script "defer", così la barra e il menu esistono prima di
// link-classifica.js e delle icone. (I moduli richiedono un server: su Netlify
// vanno; aprendo il file direttamente con file:// no.)
//
//   componenti/
//     comune/   escape-html.js, registra.js
//     barra/    barra.js + logo, link-stagioni, hamburger, posizione
//     menu/     pannello.js (il menu a tendina di tutte le pagine) + voci-menu
//               (legge json/Menu.json), pagina-attiva, ricerca-menu, apertura
//     piede/    piede.js + copyright, tricolore, collegamenti, link-piede
//     classifica/ controlli-classifica.js + ricerca, ordine, intervallo-km,
//               azzera, opzioni-ordine, selettore-vista + pulsanti-vista,
//               menu-vista-mobile, viste-classifica
//     sito/     indice delle pagine (menu e mappa): gruppi, scopri, scansione, indice
//     ancore/   ancore.js: un id a ogni sezione + scroll alla #ancora
//     mappa/    il modale "Mappa del sito" (modello, schede, fili, legenda)
//     cta/      cta-classifica.js + avvolgi-link
//     ricerca-tabelle/ il campo "Cerca" sopra ogni tabella di dati (stagioni e statistiche)

import "./ancore/ancore.js"; // ancore alle sezioni di ogni pagina
import "./ricerca-tabelle/ricerca-tabelle.js"; // campo "Cerca" sopra ogni tabella di dati
import "./colori-stagioni.js"; // colore delle stagioni scelto dal gestionale
import { registra } from "./comune/registra.js";
import { GibBarra } from "./barra/barra.js";
import { GibPiede } from "./piede/piede.js";
import { GibSelettoreVista } from "./classifica/selettore-vista.js";
import { GibCtaClassifica } from "./cta/cta-classifica.js";
import { GibControlliClassifica } from "./classifica/controlli-classifica.js";

registra("gib-barra", GibBarra);
registra("gib-piede", GibPiede);
registra("gib-controlli-classifica", GibControlliClassifica);
registra("gib-cta-classifica", GibCtaClassifica);
registra("gib-selettore-vista", GibSelettoreVista);
