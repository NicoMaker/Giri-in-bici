// fili.js — Disegna i fili che uniscono le pagine (SVG sopra le schede).
//
//  - fili di struttura (sempre): Home -> pagina capofila -> pagine figlie
//  - fili di contenuto (a richiesta): i link veri trovati nelle pagine, tratteggiati,
//    solo per la scheda scelta (passandoci sopra, con la tastiera o col pulsante ⇄)

import { archiStruttura } from "./modello.js";

const rettangolo = (el, tela) => {
  let x = 0, y = 0, n = el;
  while (n && n !== tela) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
};

const percorso = (a, b) => {
  let x1, y1, x2, y2, orizzontale = true;
  if (b.x >= a.x + a.w - 10) [x1, y1, x2, y2] = [a.x + a.w, a.y + a.h / 2, b.x, b.y + b.h / 2];
  else if (b.x + b.w <= a.x + 10) [x1, y1, x2, y2] = [a.x, a.y + a.h / 2, b.x + b.w, b.y + b.h / 2];
  else {
    orizzontale = false;
    const sotto = b.y > a.y;
    [x1, y1, x2, y2] = [a.x + a.w / 2, sotto ? a.y + a.h : a.y, b.x + b.w / 2, sotto ? b.y : b.y + b.h];
  }
  const d = Math.max(30, (orizzontale ? Math.abs(x2 - x1) : Math.abs(y2 - y1)) / 2);
  const [c1, c2] = orizzontale
    ? [`${x1 + Math.sign(x2 - x1) * d} ${y1}`, `${x2 - Math.sign(x2 - x1) * d} ${y2}`]
    : [`${x1} ${y1 + Math.sign(y2 - y1) * d}`, `${x2} ${y2 - Math.sign(y2 - y1) * d}`];
  return `M${x1} ${y1} C${c1} ${c2} ${x2} ${y2}`;
};

export const disegnaFili = (tela, modello, collegamenti, scelta) => {
  const svg = tela.querySelector(".mappa-fili");
  const schede = new Map([...tela.querySelectorAll(".mappa-scheda")].map((s) => [s.dataset.k, s]));
  const cornici = new Map([...tela.querySelectorAll(".mappa-figli")].map((c) => [c.dataset.k, c]));
  const misure = new Map([...schede, ...cornici].map(([k, el]) => [k, rettangolo(el, tela)]));
  svg.setAttribute("width", tela.offsetWidth);
  svg.setAttribute("height", tela.offsetHeight);

  const tratto = ([da, a], classe) => {
    const A = misure.get(da), B = misure.get(a);
    return A && B ? `<path class="${classe}" d="${percorso(A, B)}" marker-end="url(#mappa-freccia)"/>` : "";
  };

  const struttura = archiStruttura(modello).map((arco) => {
    const cornice = cornici.get(arco[1]);
    const toccata = scelta && (arco[0] === scelta || arco[1] === scelta || (cornice && [...cornice.querySelectorAll(".mappa-scheda")].some((c) => c.dataset.k === scelta)));
    return tratto(arco, `filo${scelta && !toccata ? " filo-spento" : ""}`);
  });
  const contenuto = scelta
    ? collegamenti.filter((c) => c.da === scelta || c.a === scelta).map((c) => tratto([c.da, c.a], "filo filo-link"))
    : [];

  svg.innerHTML = `<defs><marker id="mappa-freccia" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="currentColor"/></marker></defs>${struttura.join("")}${contenuto.join("")}`;

  const collegate = new Set(scelta ? collegamenti.filter((c) => c.da === scelta || c.a === scelta).flatMap((c) => [c.da, c.a]) : []);
  schede.forEach((el, k) => {
    el.classList.toggle("is-scelta", k === scelta);
    el.classList.toggle("is-collegata", collegate.has(k) && k !== scelta);
  });
  return misure.get(scelta);
};
