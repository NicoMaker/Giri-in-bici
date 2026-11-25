  // ---------- esperienza d'uso: palette comandi, scorciatoie, stato del server, densità ----------
  const senzaToken = (t) =>
    String(t || "").replace(/\s*\{[A-Z][A-Z0-9_]{1,63}\}/g, "").trim();
  const vaiA = (sezione, dopo) => {
    mostraSezione(sezione);
    if (dopo) setTimeout(dopo, 30);
  };
  const azioniPalette = () => [
    { t: "Inserimento", s: "Sezione", i: "➕", f: () => vaiA("inserimento") },
    { t: "Archivio giri", s: "Sezione", i: "🗂️", f: () => vaiA("archivio") },
    { t: "Utenti", s: "Sezione", i: "👥", f: () => vaiA("utenti") },
    { t: "Bandiere", s: "Sezione", i: "🚩", f: () => vaiA("bandiere") },
    { t: "Colori e periodi", s: "Sezione", i: "🎨", f: () => vaiA("colori") },
    { t: "Nuovo giro", s: "Azione", i: "＋", f: () => vaiA("archivio", () => $("#nuovo-giro").click()) },
    { t: "Nuova bandiera", s: "Azione", i: "＋", f: () => vaiA("bandiere", () => $("#nuova-bandiera").click()) },
    { t: "Nuovo utente", s: "Azione", i: "＋", f: () => vaiA("utenti", () => $("#nuovo-utente").click()) },
    { t: "Cambia tema chiaro / scuro", s: "Aspetto", i: "◐", f: () => $("#tema-bottone").click() },
  ];
  const palette = el(
    "dialog",
    { id: "dlg-palette", class: "palette", "aria-label": "Cerca azioni e giri" },
    el("input", {
      id: "palette-q",
      type: "search",
      placeholder: "Cerca una sezione, un'azione o un giro…",
      autocomplete: "off",
      "aria-label": "Cerca azioni e giri",
    }),
    el("ul", { id: "palette-lista", class: "palette-lista", role: "listbox" }),
    el("p", { class: "palette-aiuto", text: "↑↓ scorri · Invio apri · Esc chiudi" }),
  );
  document.body.append(palette);
  let vociPalette = [];
  let attiva = 0;
  const disegnaPalette = () => {
    const q = norm($("#palette-q").value.trim());
    const azioni = azioniPalette().filter((a) => !q || norm(`${a.t} ${a.s}`).includes(q));
    const trovati =
      q.length >= 2
        ? giri
            .filter((g) => norm(`${g.luogo} ${g.data} ${g.km}`).includes(q))
            .slice(0, 6)
            .map((g) => ({
              t: senzaToken(g.luogo),
              s: `Giro · ${dataIt(g.data)} · ${g.km} km`,
              i: "🚴",
              f: () =>
                vaiA("archivio", () => {
                  const campo = $("#filtro");
                  campo.value = senzaToken(g.luogo);
                  campo.dispatchEvent(new Event("input", { bubbles: true }));
                }),
            }))
        : [];
    vociPalette = [...azioni, ...trovati];
    attiva = Math.min(attiva, Math.max(0, vociPalette.length - 1));
    $("#palette-lista").replaceChildren(
      ...(vociPalette.length
        ? vociPalette.map((v, n) =>
            el(
              "li",
              {
                class: `palette-voce${n === attiva ? " attiva" : ""}`,
                role: "option",
                "aria-selected": String(n === attiva),
                onclick: () => eseguiPalette(n),
              },
              el("span", { class: "palette-icona", text: v.i }),
              el("span", { class: "palette-titolo", text: v.t }),
              el("span", { class: "palette-tipo", text: v.s }),
            ),
          )
        : [el("li", { class: "palette-vuoto", text: "Nessun risultato." })]),
    );
    $("#palette-lista").querySelector(".attiva")?.scrollIntoView({ block: "nearest" });
  };
  const eseguiPalette = (n) => {
    const voce = vociPalette[n];
    if (!voce) return;
    palette.close();
    voce.f();
  };
  const apriPalette = () => {
    document.querySelectorAll("dialog[open]").forEach((d) => d.close());
    $("#palette-q").value = "";
    attiva = 0;
    disegnaPalette();
    palette.showModal();
    $("#palette-q").focus();
    // i giri si caricano alla prima apertura di una sezione: qui servono per la ricerca
    if (!giri.length) caricaTutto().then(disegnaPalette);
  };
  palette.addEventListener("click", (e) => {
    if (e.target === palette) palette.close();
  });
  $("#palette-q").addEventListener("input", () => {
    attiva = 0;
    disegnaPalette();
  });
  $("#palette-q").addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = vociPalette.length || 1;
      attiva = (attiva + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
      disegnaPalette();
    } else if (e.key === "Enter") {
      e.preventDefault();
      eseguiPalette(attiva);
    }
  });
  $("#apri-palette")?.addEventListener("click", apriPalette);

  // scorciatoie: Ctrl/Cmd+K palette · "/" cerca · "n" nuovo
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      palette.open ? palette.close() : apriPalette();
      return;
    }
    const scrive = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) ||
      document.activeElement?.isContentEditable;
    if (scrive || e.ctrlKey || e.metaKey || e.altKey || document.querySelector("dialog[open]")) return;
    if (e.key === "/") {
      const campo = document.querySelector('[data-sezione]:not([hidden]) input[type="search"]');
      if (campo) {
        e.preventDefault();
        campo.focus();
      }
    } else if (e.key === "n") {
      const nuovo = document.querySelector(
        '[data-sezione]:not([hidden]) #nuovo-giro, [data-sezione]:not([hidden]) #nuova-bandiera, [data-sezione]:not([hidden]) #nuovo-utente, [data-sezione]:not([hidden]) #nuovo-colore',
      );
      if (nuovo) {
        e.preventDefault();
        nuovo.click();
      }
    }
  });

  // stato del server: puntino verde/rosso nella testata
  let serverRaggiungibile = true;
  const controllaServer = async () => {
    let ok = true;
    try {
      const r = await fetch(`/icona.svg?ping=${Date.now()}`, { cache: "no-store" });
      ok = r.ok;
    } catch {
      ok = false;
    }
    const pillola = $("#stato-server");
    pillola.dataset.stato = ok ? "ok" : "off";
    pillola.title = ok ? "Server connesso" : "Server non raggiungibile";
    $("#stato-server-testo").textContent = ok ? "Online" : "Offline";
    if (!ok && serverRaggiungibile)
      avvisa("Il server non risponde. Controlla che `node scripts/server.js` sia acceso.", true);
    serverRaggiungibile = ok;
  };
  controllaServer();
  setInterval(controllaServer, 15000);

  // al cambio sezione il focus passa al titolo (utile con tastiera e screen reader)
  let primaVolta = true;
  document.addEventListener("sezione", (e) => {
    if (primaVolta) return (primaVolta = false);
    const titolo = document.querySelector(`[data-sezione="${e.detail}"]:not([hidden]) h2`);
    if (!titolo) return;
    titolo.tabIndex = -1;
    titolo.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // densità dell'elenco giri: comoda / compatta (si ricorda)
  const impostaDensita = (compatta) => {
    $("#lista").classList.toggle("compatta", compatta);
    $("#densita").setAttribute("aria-pressed", String(compatta));
    $("#densita").textContent = compatta ? "Vista comoda" : "Vista compatta";
    try {
      localStorage.setItem("giri-densita", compatta ? "compatta" : "comoda");
    } catch {}
  };
  $("#densita").addEventListener("click", () =>
    impostaDensita(!$("#lista").classList.contains("compatta")),
  );
  try {
    impostaDensita(localStorage.getItem("giri-densita") === "compatta");
  } catch {}
