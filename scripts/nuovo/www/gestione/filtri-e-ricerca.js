    const btn = el("button", {
      class: "ms-btn",
      type: "button",
      "aria-haspopup": "listbox",
    });
    const aggiornaBtn = () =>
      btn.replaceChildren(
        el("span", { text: etichetta }),
        el("b", {
          text:
            sel.size === opz.length
              ? `${sel.size} selezionat${sel.size === 1 ? "o" : "e"}`
              : `${sel.size} di ${opz.length}`,
        }),
        el("small", { text: "▾" }),
      );
    const cerca = el("input", {
      type: "search",
      placeholder: `Cerca ${etichetta.toLowerCase()}…`,
      autocomplete: "off",
      "aria-label": `Cerca in ${etichetta}`,
    });
    const lista = el("div", { class: "ms-lista", role: "listbox" });
    const disegnaLista = () => {
      const q = norm(cerca.value.trim());
      lista.replaceChildren(
        ...opz
          .filter((o) => !q || norm(o.t).includes(q))
          .map((o) => {
            const c = el("input", { type: "checkbox", value: o.v });
            c.checked = sel.has(o.v);
            c.addEventListener("change", () => {
              c.checked ? sel.add(o.v) : sel.delete(o.v);
              aggiornaBtn();
              disegnaGiri();
            });
            return el("label", {}, c, el("span", { text: o.t }));
          }),
      );
    };
    const tutte = el("button", {
      class: "btn",
      type: "button",
      text: "Tutte",
      onclick: () => {
        opz.forEach((o) => sel.add(o.v));
        aggiornaBtn();
        disegnaLista();
        disegnaGiri();
      },
    });
    const nessuna = el("button", {
      class: "btn",
      type: "button",
      text: "Nessuna",
      onclick: () => {
        sel.clear();
        aggiornaBtn();
        disegnaLista();
        disegnaGiri();
      },
    });
    const pannello = el(
      "div",
      { class: "ms-panel", hidden: true },
      cerca,
      el("div", { class: "ms-azioni" }, tutte, nessuna),
      lista,
    );
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const apri = pannello.hidden;
      document.querySelectorAll(".ms-panel").forEach((p) => {
        p.hidden = true;
      });
      pannello.hidden = !apri;
      if (apri) {
        cerca.value = "";
        disegnaLista();
        cerca.focus();
      }
    });
    pannello.addEventListener("click", (e) => e.stopPropagation());
    cerca.addEventListener("input", disegnaLista);
    aggiornaBtn();
    cont.replaceChildren(btn, pannello);
  };
  const costruisciFiltri = () => {
    costruisciMulti(
      "stagione",
      "Stagione",
      [...new Map(giri.map((g) => [g.stagione, g.etichetta]))].map(
        ([v, t]) => ({ v, t }),
      ),
    );
    costruisciMulti(
      "anno",
      "Anno",
      [...new Set(giri.map(anno))]
        .sort()
        .reverse()
        .map((v) => ({ v, t: v })),
    );
    costruisciMulti("paese", "Paese", [
      { v: "", t: "Senza bandiera" },
      ...[...new Set(giri.flatMap((g) => g.flags))].map((c) => {
        const p = paesi.find((x) => x.codice === c) || {
          nome: c,
          bandiera: "",
        };
        return { v: c, t: `${p.bandiera} ${p.nome}` };
      }),
    ]);
    const kms = giri.map((g) => g.km);
    $("#km-min").dataset.v = kms.length ? Math.min(...kms) : 0;
    $("#km-max").dataset.v = kms.length ? Math.max(...kms) : 0;
    segnaOrdine();
  };
  const segnaOrdine = () =>
    document
      .querySelectorAll("[data-ordina]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.ordina === ordine),
        ),
      );
  const passaPaese = (g) =>
    !g.flags.length
      ? multi.paese.sel.has("")
      : g.flags.some((f) => multi.paese.sel.has(f));
  const disegnaGiri = () => {
    if (!multi.stagione) return;
    const q = norm($("#filtro").value.trim());
    const da =
        $("#km-da").value === "" ? -Infinity : Number($("#km-da").value),
      a = $("#km-a").value === "" ? Infinity : Number($("#km-a").value);
    const dati = giri.filter(
      (g) =>
        multi.stagione.sel.has(g.stagione) &&
