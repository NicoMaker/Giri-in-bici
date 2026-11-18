// avvolgi-link.js — Mette i link del componente dentro .cta-classifica-wrap.

export const avvolgiLink = (elemento, gruppo) => {
  const link = Array.from(elemento.querySelectorAll("a"));
  link.forEach((a) => a.classList.add("cta-classifica"));

  const contenitore = document.createElement("div");
  contenitore.className =
    "cta-classifica-wrap" + (gruppo ? " cta-classifica-wrap--gruppo" : "");
  contenitore.append(...link);
  elemento.replaceChildren(contenitore);
};
