// Elenco dei paesi con bandiera nelle pagine Giri e About us: si costruisce da solo
// da json/Bandiere-personalizzate.json, quindi una bandiera creata nel gestionale compare qui senza toccare l'HTML.
(() => {
  const nodi = document.querySelectorAll("[data-paesi-bandiere]");
  if (!nodi.length) return;
  const crea = (b) => {
    const img = document.createElement("img");
    img.src = `/img/Icons/Bandiere/${encodeURIComponent(b.file)}`;
    img.alt = b.nome;
    img.title = b.nome;
    img.style.cssText =
      "height:1.2em;vertical-align:-0.15em;margin:0 0.15em;display:inline-block";
    return img;
  };
  fetch("/json/Bandiere-personalizzate.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : []))
    .then((lista) => {
      const bandiere = (Array.isArray(lista) ? lista : []).filter(
        (b) =>
          b &&
          typeof b.nome === "string" &&
          /^[\w-]+\.(png|jpe?g|webp)$/i.test(b.file || ""),
      );
      if (!bandiere.length) return;
      nodi.forEach((nodo) => {
        const frammenti = [];
        bandiere.forEach((b, i) => {
          if (i > 0)
            frammenti.push(
              document.createTextNode(i === bandiere.length - 1 ? " e " : ", "),
            );
          frammenti.push(document.createTextNode(b.nome + " "), crea(b));
        });
        nodo.replaceChildren(...frammenti);
      });
    })
    .catch(() => {});
})();
