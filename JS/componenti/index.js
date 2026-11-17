// index.js — Punto d'ingresso dei componenti condivisi del sito.
//
//   <script type="module" src="/js/componenti/index.js"></script>
//
// Metterlo come PRIMO script dell'<head>: i moduli partono in ordine insieme
// agli script "defer", così la barra esiste prima di icone-pagina-attiva.js,
// link-classifica.js e del menu. (I moduli richiedono un server: su Netlify
// vanno; aprendo il file direttamente con file:// no.)
//
//   componenti/
//     comune/   escape-html.js, registra.js
//     barra/    barra.js + logo, icone-navigazione, freccia-indietro,
//               link-stagioni, hamburger, posizione, voci
//     piede/    piede.js + copyright, tricolore, collegamenti, link-piede
//     classifica/ controlli-classifica.js + ricerca, ordine, intervallo-km,
//               azzera, opzioni-ordine, selettore-vista + pulsanti-vista,
//               menu-vista-mobile, viste-classifica
//     cta/      cta-classifica.js + avvolgi-link

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
