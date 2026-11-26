const selezioneGiri = creaSelezione({
  contenitore: $("#g-barra-box"),
  singolare: "giro",
  plurale: "giri",
  endpoint: "/api/gestione/giri/elimina-multiplo",
  campo: "ids",
  descrivi: (ids) => {
    const voci = ids.map((id) => {
      const g = giri.find((x) => x.id === id);
      return g
        ? `${senzaBandiere(g.luogo)} (${dataIt(g.data)}, ${g.km} km)`
        : id;
    });
    return `${voci.slice(0, 5).join("; ")}${voci.length > 5 ? `; e altri ${voci.length - 5}` : ""}. Le statistiche si aggiornano.`;
  },
  ridisegna: () => disegnaGiri(),
});
const disegnaGiri = () => {
  if (!multi.stagione) return;
  const q = norm($("#filtro").value.trim());
  const da = $("#km-da").value === "" ? -Infinity : Number($("#km-da").value),
    a = $("#km-a").value === "" ? Infinity : Number($("#km-a").value);
  const dati = giri.filter(
    (g) =>
      multi.stagione.sel.has(g.stagione) &&
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
            {
              class: `ride${selezioneGiri.ha(g.id) ? " selezionata" : ""}`,
            },
            el(
              "label",
              { class: "spunta" },
              selezioneGiri.casella(g.id, senzaBandiere(g.luogo)),
            ),
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
              el(
                "button",
                {
                  class: "btn",
                  type: "button",
                  onclick: () => modificaGiro(g),
                },
                ...conIcona("edit", "Modifica"),
              ),
              el(
                "button",
                {
                  class: "btn danger",
                  type: "button",
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
                },
                ...conIcona("trash", "Elimina"),
              ),
            ),
          ),
        )
      : [
          el(
            "div",
            { class: "empty-state" },
            ico("search", "ico-grande"),
            el("span", { text: "Nessun giro trovato." }),
          ),
        ]),
  );
  selezioneGiri.aggiorna(
    dati.slice(0, 200).map((g) => g.id),
    giri.map((g) => g.id),
  );
  if (dati.length > 200)
    $("#lista").append(
      el("p", {
        class: "sotto",
        text: "Mostrati i primi 200: restringi la ricerca per vedere gli altri.",
      }),
    );
};
