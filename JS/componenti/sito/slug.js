// slug.js — Le sezioni di una pagina e le loro ancore.
//
// Una "sezione" è un <section> dentro <main> con un <h2> (l'hero in cima no).
// L'ancora nasce dal titolo: "Le uscite" -> #le-uscite. Stessa regola sia
// dentro la pagina (ancore.js) sia quando il sito legge le altre pagine
// (scansione.js): per questo i collegamenti #... funzionano ovunque.
// Nella Classifica le sezioni stanno in schede nascoste: l'ancora porta il nome della scheda.

export const slug = (testo) =>
  (testo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "sezione";

// Restituisce [{ el, id, titolo, vista }] per un documento (vivo o letto con DOMParser)
export const trovaSezioni = (radice) => {
  const usati = new Set();
  const lista = [];
  radice.querySelectorAll("main section:not(.hero)").forEach((el) => {
    const h2 = el.querySelector("h2");
    if (!h2) return;
    const gruppo = el.closest("[data-vista-gruppo]");
    const vista = gruppo ? gruppo.dataset.vistaGruppo : "";
    let id = slug((vista ? vista + " " : "") + h2.textContent);
    const base = id;
    for (let n = 2; usati.has(id); n++) id = `${base}-${n}`;
    usati.add(id);
    lista.push({ el, id, titolo: h2.textContent.trim().replace(/\s+/g, " "), vista });
  });
  return lista;
};

// Indirizzo di una sezione: nella Classifica serve anche la scheda giusta (?vista=)
export const linkSezione = (url, sezione) => {
  const query = sezione.vista ? `?vista=${sezione.vista}` : "";
  return `${url}${query}#${sezione.id}`;
};
