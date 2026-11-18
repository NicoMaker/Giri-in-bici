// collegamenti.js — La fila di link utili del piede (con GitHub in fondo).

import { LINK_PIEDE, LINK_GITHUB } from "./link-piede.js";

export const collegamenti = () => {
  const link = LINK_PIEDE.map(
    ([href, nome]) => `<a href="${href}">${nome}</a>`,
  ).join("\n      ");
  return `<nav class="foot-links" aria-label="Collegamenti utili">
      ${link}
      <a href="${LINK_GITHUB}" target="_blank" rel="noopener">GitHub</a>
    </nav>`;
};
