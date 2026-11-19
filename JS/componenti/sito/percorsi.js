// percorsi.js — Rende confrontabili gli indirizzi (maiuscole, .html, "/" finale, ?query, #ancora).

export const chiave = (indirizzo) => {
  let p;
  try {
    p = new URL(indirizzo, window.location.href).pathname;
  } catch (e) {
    return "";
  }
  try {
    p = decodeURIComponent(p);
  } catch (e) {
    /* già leggibile */
  }
  p = p.toLowerCase();
  if (p.endsWith("/")) p += "index.html";
  if (!/\.[a-z0-9]+$/.test(p)) p += ".html";
  return p;
};

// Indirizzo assoluto dalla radice, senza query né ancora ("/Estate/2022.html")
export const daRadice = (indirizzo, base) => {
  try {
    return new URL(indirizzo, base || window.location.href).pathname;
  } catch (e) {
    return "";
  }
};

export const stessoSito = (indirizzo, base) => {
  try {
    return (
      new URL(indirizzo, base || window.location.href).origin ===
      window.location.origin
    );
  } catch (e) {
    return false;
  }
};
