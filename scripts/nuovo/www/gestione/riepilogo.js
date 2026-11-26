// ---------- riepilogo dell'archivio e scheletri di caricamento ----------
const numeroIt = (n, d = 0) =>
  Number(n).toLocaleString("it-IT", { maximumFractionDigits: d });
const disegnaRiepilogo = () => {
  const km = giri.map((g) => Number(g.km) || 0);
  const totale = km.reduce((a, b) => a + b, 0);
  const piuLungo = giri.reduce((m, g) => (!m || g.km > m.km ? g : m), null);
  const carta = (etichetta, valore, nota, accento) =>
    el(
      "div",
      { class: `riep-carta${accento ? " riep-carta--accento" : ""}` },
      el("span", { class: "riep-etichetta", text: etichetta }),
      el("strong", { class: "riep-valore", text: valore }),
      el("span", { class: "riep-nota", text: nota }),
    );
  $("#riepilogo-archivio").replaceChildren(
    carta("Giri", numeroIt(giri.length), "registrati", true),
    carta("Chilometri", `${numeroIt(totale, 1)} km`, "in totale"),
    carta(
      "Più lungo",
      piuLungo ? `${numeroIt(piuLungo.km, 1)} km` : "—",
      piuLungo
        ? String(piuLungo.luogo || "")
            .replace(/\s*\{[A-Z][A-Z0-9_]{1,63}\}/g, "")
            .slice(0, 38)
        : "nessun giro",
    ),
    carta("Bandiere", numeroIt(paesi.length), "create"),
  );
};
const mostraScheletri = () => {
  if (giri.length) return;
  $("#lista").replaceChildren(
    ...Array.from({ length: 4 }, () => el("div", { class: "scheletro" })),
  );
};
