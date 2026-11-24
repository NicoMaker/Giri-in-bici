        multi.anno.sel.has(anno(g)) &&
        passaPaese(g) &&
        g.km >= da &&
        g.km <= a &&
        (!q ||
          norm(
            [
              g.luogo,
              dataIt(g.data),
              g.data,
              g.etichetta,
              g.periodo,
              g.km,
              nomiPaesi(g.flags),
              g.links.map((l) => l.title).join(" "),
            ].join(" "),
          ).includes(q)),
    );
    const cmp = {
      "km-desc": (x, y) => y.km - x.km,
      "km-asc": (x, y) => x.km - y.km,
      az: (x, y) => x.luogo.localeCompare(y.luogo, "it"),
      za: (x, y) => y.luogo.localeCompare(x.luogo, "it"),
      recente: (x, y) => y.data.localeCompare(x.data),
      vecchio: (x, y) => x.data.localeCompare(y.data),
    }[ordine];
    dati.sort(cmp);
    $("#conteggio").textContent =
      `${dati.length} di ${giri.length} giri · ${dati.reduce((s, g) => s + g.km, 0).toLocaleString("it-IT")} km`;
    $("#lista").replaceChildren(
      ...(dati.length
        ? dati.slice(0, 200).map((g) =>
            el(
              "article",
              { class: "ride" },
              el(
                "div",
                { class: "ride-info" },
                el("strong", {}, ...luogoNodi(g.luogo)),
                el(
                  "div",
                  { class: "ride-meta" },
                  el("span", { class: "ride-tag", text: dataIt(g.data) }),
                  el("span", {
                    class: "ride-tag",
                    text: `${g.etichetta} ${g.periodo}`,
                  }),
                  el("span", { class: "ride-tag", text: `${g.km} km` }),
                ),
                g.links.length
                  ? el(
                      "div",
                      { class: "ride-links" },
                      g.links.map((l, i) =>
                        el("a", {
                          href: l.url,
                          target: "_blank",
                          rel: "noopener",
                          text:
                            l.title ||
                            (g.links.length > 1
                              ? `Percorso ${i + 1}`
                              : "Percorso"),
                        }),
                      ),
                    )
                  : null,
              ),
              el(
                "div",
                { class: "azioni" },
                el("button", {
                  class: "btn",
                  type: "button",
                  text: "Modifica",
                  onclick: () => modificaGiro(g),
                }),
                el("button", {
                  class: "btn danger",
                  type: "button",
                  text: "Elimina",
                  onclick: async () => {
                    if (
                      await conferma(
                        "Eliminare il giro?",
                        `${senzaBandiere(g.luogo)} · ${dataIt(g.data)} · ${g.km} km. Le statistiche si aggiornano.`,
                      )
                    )
                      await chiama(
                        "/api/gestione/giri/elimina",
                        { id: g.id },
                        dopoModifica,
                      );
                  },
                }),
              ),
            ),
          )
        : [
            el("div", {
              class: "empty-state",
              text: "Nessun giro trovato.",
            }),
          ]),
    );
    if (dati.length > 200)
      $("#lista").append(
        el("p", {
          class: "sotto",
          text: "Mostrati i primi 200: restringi la ricerca per vedere gli altri.",
        }),
      );
  };
