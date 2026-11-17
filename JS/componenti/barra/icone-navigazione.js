// icone-navigazione.js — La fila di icone delle sezioni del sito.

import { VOCI_BARRA } from "./voci.js";
import { frecciaIndietro } from "./freccia-indietro.js";

export function iconeNavigazione(indirizzoIndietro, titoloIndietro) {
  const voci = VOCI_BARRA.map(
    ([href, nome, icona, classifica]) =>
      `<a href="${href}"${classifica ? " data-classifica" : ""} title="${nome}" aria-label="${nome}"><img src="/img/Icons/${icona}" alt="" /></a>`,
  ).join("");
  return `<nav class="Icons" aria-label="Sezioni del sito">${frecciaIndietro(indirizzoIndietro, titoloIndietro)}${voci}</nav>`;
}
