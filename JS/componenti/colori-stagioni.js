// Colore generale delle stagioni (Primavera, Estate, Autunno - Inverno).
// Si modifica dal gestionale (sezione "Colori e periodi" → Stagioni) e vale in tutto il sito:
// legge `color` da stagioni.json e lo passa al CSS come variabile --s-<stagione>.
(() => {
  fetch("/json/Statistiche/anni/stagioni/stagioni.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : null))
    .then((dati) => {
      for (const s of (dati && dati.seasons) || []) {
        if (!s || typeof s.name !== "string") continue;
        if (!/^(#[0-9a-f]{3,8}|[a-z]{3,20})$/i.test(String(s.color || "")))
          continue;
        document.documentElement.style.setProperty(
          `--s-${s.name.toLowerCase()}`,
          s.color,
        );
      }
    })
    .catch(() => {});
})();
