"use strict";
// Sezioni Archivio giri, Utenti, Colori e periodi. Usa $, el, api, paesi e i componenti di app.js.
(() => {
  const norm = (t) =>
    String(t ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const dataIt = (iso) =>
    String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/)
      ? iso.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3/$2/$1")
      : iso;
  const oggi = () => {
    const d = new Date(),
      p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const nomiPaesi = (codici) =>
    (codici || [])
      .map((c) => (paesi.find((p) => p.codice === c) || { nome: c }).nome)
      .join(" ");
  let timer;

  // ---------- finestre modali ----------
  const conferma = (titolo, testo, etichetta = "Elimina") =>
    new Promise((ok) => {
      const d = $("#dlg-conferma");
      $("#conf-titolo").textContent = titolo;
      $("#conf-testo").textContent = testo;
      $("#conf-si").textContent = etichetta;
      const fine = (v) => {
        d.close();
        ok(v);
      };
      $("#conf-si").onclick = () => fine(true);
      $("#conf-no").onclick = () => fine(false);
      d.oncancel = () => ok(false);
      d.showModal();
      $("#conf-no").focus();
    });
  const apriDlg = (id, titolo, idTitolo) => {
    const d = $(`#${id}`);
    d.querySelector(".err-dlg").textContent = "";
    if (titolo) $(`#${idTitolo}`).textContent = titolo;
    d.showModal();
  };
  document.querySelectorAll("dialog").forEach((d) => {
    d.addEventListener("click", (e) => {
      if (e.target === d) d.close();
    });
    d.querySelectorAll("[data-chiudi]").forEach((b) =>
      b.addEventListener("click", () => d.close()),
    );
  });
  const avvisa = (testo, errore = false) => {
    const box = $("#notifica");
    box.textContent = testo;
    box.classList.toggle("errore", errore);
    box.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => {
      box.hidden = true;
    }, 5000);
    const dlg = document.querySelector(
      "dialog[open]:not(#dlg-conferma) .err-dlg",
    );
    if (dlg && errore) dlg.textContent = testo;
    const m = $("#msg");
    m.replaceChildren(
      el("p", {
        class: errore ? "avviso" : "conferma",
        text: `${errore ? "Errore: " : "Fatto: "}${testo}`,
      }),
    );
  };
  const chiama = async (url, corpo, ok) => {
    const r = await api(url, corpo);
    if (!r.ok) {
      avvisa(r.errore, true);
      return null;
    }
    if (r.messaggio) avvisa(r.messaggio);
    if (ok) await ok(r);
    return r;
  };
  const opzioni = (sel, lista, primo) =>
    sel.replaceChildren(
      ...(primo ? [el("option", { value: "", text: primo })] : []),
      ...lista.map(([v, t]) => el("option", { value: v, text: t })),
    );

  // ---------- giri ----------
  let giri = [],
    stagioni = [],
    ordine = "recente";
  const selBandiere = bandierePicker($("#f-luogo")),
    selLink = editorLink();
  $("#f-bandiere").replaceChildren(selBandiere.nodo);
  $("#f-links").replaceChildren(selLink.nodo);
  const azzeraGiro = () => {
    $("#id").value = "";
    $("#f-data").value = oggi();
    $("#f-luogo").value = "";
    $("#f-km").value = "";
    selBandiere.aggiorna();
    selLink.set([]);
  };
  const modificaGiro = (g) => {
    $("#id").value = g.id;
    $("#f-stagione").value = g.stagione;
    $("#f-data").value = g.data;
    $("#f-luogo").value = g.luogo;
    $("#f-km").value = g.km;
    selBandiere.aggiorna();
    selLink.set(g.links);
    apriDlg("dlg-giro", "Modifica giro", "t-giro");
  };
  // ---------- filtri (select a scelta multipla con ricerca, ricerca testo, ordinamento, intervallo km) ----------
  const multi = {}; // nome -> { opzioni:[{v,t}], sel:Set, etichetta }
  const anno = (g) => g.data.slice(0, 4);
  const costruisciMulti = (nome, etichetta, opz) => {
    const prima = multi[nome],
      sel = new Set();
    for (const o of opz)
      if (
        !prima ||
        prima.sel.has(o.v) ||
        !prima.opzioni.some((x) => x.v === o.v)
      )
        sel.add(o.v);
    multi[nome] = { opzioni: opz, sel, etichetta };
    const cont = $(`#ms-${nome}`);
    cont.className = "ms";
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

  // ---------- utenti ----------
  let utenti = [];
  const azzeraUtente = () => {
    $("#u-originale").value = "";
    for (const i of [
      "username",
      "name",
      "description",
      "avatar",
      "komoot",
    ])
      $(`#u-${i}`).value = "";
    $("#u-visibile").value = "1";
  };
  const disegnaUtenti = () => {
    const q = norm($("#u-filtro").value.trim());
    const dati = utenti.filter(
      (u) =>
        !q ||
        norm([u.username, u.name, u.description].join(" ")).includes(q),
    );
    $("#u-conteggio").textContent =
      `${dati.length} di ${utenti.length} utenti`;
    $("#u-lista").replaceChildren(
      ...(dati.length
        ? dati.map((u) =>
            el(
              "article",
              { class: "ride" },
              el(
                "div",
                { class: "utente-riga" },
                el("div", {
                  class: "utente-avatar",
                  text: (u.name || u.username)[0].toUpperCase(),
                }),
                el(
                  "div",
                  { class: "ride-info" },
                  el("strong", { text: u.name || u.username }),
                  el("p", {
                    text: `@${u.username}${u.description ? " · " + u.description : ""}`,
                  }),
                  el(
                    "div",
                    { class: "ride-meta" },
                    el("span", {
                      class: "ride-tag",
                      text: u.visibleInTeam
                        ? "Visibile nel team"
                        : "Nascosto",
                    }),
                    u.komootUrl
                      ? el("a", {
                          class: "ride-tag",
                          href: u.komootUrl,
                          target: "_blank",
                          rel: "noopener",
                          text: "Komoot",
                        })
                      : null,
                  ),
                ),
              ),
              el(
                "div",
                { class: "azioni" },
                el("button", {
                  class: "btn",
                  type: "button",
                  text: "Modifica",
                  onclick: () => {
                    $("#u-originale").value = u.username;
                    $("#u-username").value = u.username;
                    $("#u-name").value = u.name || "";
                    $("#u-description").value = u.description || "";
                    $("#u-avatar").value = u.avatar || "";
                    $("#u-komoot").value = u.komootUrl || "";
                    $("#u-visibile").value = u.visibleInTeam ? "1" : "0";
                    apriDlg("dlg-utente", "Modifica utente", "t-utente");
                  },
                }),
                el("button", {
                  class: "btn danger",
                  type: "button",
                  text: "Elimina",
                  onclick: async () => {
                    if (
                      await conferma(
                        "Eliminare l'utente?",
                        `${u.name || u.username} (@${u.username}) sarà rimosso dall'elenco.`,
                      )
                    )
                      await chiama(
                        "/api/gestione/utenti/elimina",
                        { username: u.username },
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
              text: "Nessun utente trovato.",
            }),
          ]),
    );
  };

  // ---------- colori e periodi ----------
  let colori = { anni: [], mesi: [] };
  const aggiornaPeriodoColore = () => {
    const s = stagioni.filter(
      (x) => x.chiave === $("#col-stagione").value,
    );
    opzioni(
      $("#col-periodo"),
      s.map((x) => [x.periodo, x.periodo]),
    );
    if (s[0]) $("#colore").value = s[0].colore;
  };
  const cartaColore = (titolo, valore, url, campo) =>
    el(
      "label",
      { class: "colore-stat-card" },
      el("span", { text: titolo }),
      el("input", {
        type: "color",
        value: valore,
        onchange: (e) =>
          chiama(
            url,
            { [campo]: titolo, colore: e.target.value },
            dopoModifica,
          ),
      }),
    );
  const disegnaPeriodi = () => {
    const q = norm($("#p-filtro").value.trim());
    const gruppi = [...new Set(stagioni.map((s) => s.chiave))];
    $("#lista-periodi").replaceChildren(
      ...gruppi.map((k) => {
        const lista = stagioni.filter(
          (s) =>
            s.chiave === k &&
            (!q || norm(`${s.etichetta} ${s.periodo}`).includes(q)),
        );
        return lista.length
          ? el(
              "div",
              { class: "periodo-gruppo" },
              el("h3", { text: lista[0].etichetta }),
              el(
                "div",
                { class: "periodi-grid" },
                lista.map((s) =>
                  el(
                    "div",
                    {
                      class: "periodo-card",
                      style: `--periodo-colore:${s.colore}`,
                    },
                    el("span", {
                      class: "periodo-chip",
                      text: s.periodo,
                    }),
                    el("button", {
                      class: "btn danger",
                      type: "button",
                      text: "Elimina",
                      onclick: async () => {
                        if (
                          await conferma(
                            "Eliminare il periodo?",
                            `${s.etichetta} ${s.periodo}: verranno rimossi pagina, JSON, foto e giri. Le statistiche si aggiornano.`,
                          )
                        )
                          await chiama(
                            "/api/gestione/stagioni/elimina-periodo",
                            { stagione: s.chiave, periodo: s.periodo },
                            dopoModifica,
                          );
                      },
                    }),
                  ),
                ),
              ),
            )
          : null;
      }),
    );
  };

  const caricaTutto = async () => {
    const [g, s, c, u] = await Promise.all([
      api("/api/gestione/giri"),
      api("/api/gestione/stagioni"),
      api("/api/gestione/statistiche-colori"),
      api("/api/gestione/utenti"),
    ]);
    if (!g.ok) return avvisa(g.errore, true);
    giri = g.giri;
    stagioni = s.stagioni || [];
    colori = c.ok ? c : colori;
    utenti = u.utenti || [];
    const chiavi = [
      ...new Map(stagioni.map((x) => [x.chiave, x.etichetta])),
    ];
    opzioni($("#f-stagione"), chiavi);
    opzioni($("#col-stagione"), chiavi);
    costruisciFiltri();
    selBandiere.ricarica();
    $("#colori-anni").replaceChildren(
      ...colori.anni.map((a) =>
        cartaColore(
          a.anno,
          a.colore,
          "/api/gestione/statistiche/colore-anno",
          "anno",
        ),
      ),
    );
    $("#colori-mesi").replaceChildren(
      ...colori.mesi.map((m) =>
        cartaColore(
          m.nome,
          m.colore,
          "/api/gestione/statistiche/colore-mese",
          "mese",
        ),
      ),
    );
    aggiornaPeriodoColore();
    disegnaGiri();
    disegnaUtenti();
    disegnaPeriodi();
  };
  // dopo un salvataggio o un'eliminazione: ricarica i dati, svuota i moduli e chiude le finestre
  const dopoModifica = async () => {
    await caricaTutto();
    azzeraGiro();
    azzeraUtente();
    document.querySelectorAll("dialog[open]").forEach((d) => d.close());
  };

  $("#form-giro").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("#id").value || undefined;
    const luogo = $("#f-luogo").value.trim();
    const confermato = await conferma(
      id ? "Confermi le modifiche al giro?" : "Confermi la creazione del giro?",
      `${luogo} · ${$("#f-data").value} · ${$("#f-km").value} km. I dati verranno salvati solo dopo questa conferma.`,
      id ? "Salva modifiche" : "Crea giro",
    );
    if (!confermato) return;
    await chiama(
      "/api/gestione/giri/salva",
      {
        id,
        stagione: $("#f-stagione").value,
        data: $("#f-data").value,
        luogo: $("#f-luogo").value,
        km: $("#f-km").value,
        links: selLink.get(),
      },
      dopoModifica,
    );
  });
  $("#nuovo-giro").addEventListener("click", () => {
    azzeraGiro();
    apriDlg("dlg-giro", "Nuovo giro", "t-giro");
  });
  $("#nuovo-utente").addEventListener("click", () => {
    azzeraUtente();
    apriDlg("dlg-utente", "Nuovo utente", "t-utente");
  });
  $("#nuovo-colore").addEventListener("click", () =>
    apriDlg("dlg-colore"),
  );
  $("#form-utente").addEventListener("submit", async (e) => {
    e.preventDefault();
    await chiama(
      "/api/gestione/utenti/salva",
      {
        originale: $("#u-originale").value || undefined,
        username: $("#u-username").value,
        name: $("#u-name").value,
        description: $("#u-description").value,
        avatar: $("#u-avatar").value,
        komootUrl: $("#u-komoot").value,
        visibleInTeam: $("#u-visibile").value === "1",
      },
      dopoModifica,
    );
  });
  $("#form-colore").addEventListener("submit", async (e) => {
    e.preventDefault();
    await chiama(
      "/api/gestione/stagioni/colore",
      {
        stagione: $("#col-stagione").value,
        periodo: $("#col-periodo").value,
        colore: $("#colore").value,
      },
      dopoModifica,
    );
  });
  $("#col-stagione").addEventListener("change", aggiornaPeriodoColore);
  $("#col-periodo").addEventListener("change", () => {
    const x = stagioni.find(
      (s) =>
        s.chiave === $("#col-stagione").value &&
        s.periodo === $("#col-periodo").value,
    );
    if (x) $("#colore").value = x.colore;
  });
  for (const [id, f] of [
    ["#filtro", disegnaGiri],
    ["#km-da", disegnaGiri],
    ["#km-a", disegnaGiri],
    ["#u-filtro", disegnaUtenti],
    ["#p-filtro", disegnaPeriodi],
  ])
    $(id).addEventListener("input", f);
  document.querySelectorAll("[data-ordina]").forEach((b) =>
    b.addEventListener("click", () => {
      ordine = b.dataset.ordina;
      segnaOrdine();
      disegnaGiri();
    }),
  );
  $("#km-min").addEventListener("click", () => {
    $("#km-da").value = $("#km-min").dataset.v;
    disegnaGiri();
  });
  $("#km-max").addEventListener("click", () => {
    $("#km-a").value = $("#km-max").dataset.v;
    disegnaGiri();
  });
  document.querySelectorAll("[data-reset]").forEach((b) =>
    b.addEventListener("click", () => {
      const t = b.dataset.reset;
      if (t !== "ricerca") {
        ordine = "recente";
        $("#km-da").value = "";
        $("#km-a").value = "";
        Object.values(multi).forEach((m) =>
          m.opzioni.forEach((o) => m.sel.add(o.v)),
        );
        costruisciFiltri();
      }
      if (t !== "pulsanti") $("#filtro").value = "";
      disegnaGiri();
    }),
  );

  // paesi arrivano da app.js dopo l'avvio: carico i dati alla prima apertura delle sezioni
  let pronto = false;
  document.addEventListener("sezione", async (e) => {
    if (e.detail !== "inserimento" && !pronto) {
      pronto = true;
      await caricaTutto();
    }
  });
})();
