// ricerca-menu.js — Filtra il menu mentre si scrive: pagine, sotto-pagine e sezioni.
//
// Una voce resta visibile se il suo nome contiene il testo, o se lo contiene
// una delle voci al suo interno. Mentre si cerca, gruppi e liste si aprono da soli.

export const collegaRicerca = (campo, radice, messaggioVuoto) => {
  if (!campo) return;

  campo.addEventListener("input", () => {
    const testo = campo.value.trim().toLowerCase();
    const voci = [...radice.querySelectorAll("li[data-nome]")];
    radice.classList.toggle("in-ricerca", Boolean(testo));

    if (!testo) {
      voci.forEach((v) => (v.hidden = false));
      radice.querySelectorAll(".menu-gruppo").forEach((g) => (g.hidden = false));
      if (messaggioVuoto) messaggioVuoto.hidden = true;
      return;
    }

    const trovata = new Map(voci.map((v) => [v, v.dataset.nome.toLowerCase().includes(testo)]));
    let visibili = 0;
    voci.forEach((v) => {
      const dentro = [...v.querySelectorAll("li[data-nome]")].some((x) => trovata.get(x));
      v.hidden = !(trovata.get(v) || dentro);
      if (trovata.get(v)) visibili++;
    });
    radice.querySelectorAll(".menu-gruppo").forEach((g) => {
      g.hidden = !g.querySelector("li[data-nome]:not([hidden])");
      if (!g.hidden) g.open = true;
    });
    if (messaggioVuoto) messaggioVuoto.hidden = visibili > 0;
  });
};
