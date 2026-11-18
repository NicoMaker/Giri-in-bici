// ============================================================
// link-classifica.js — La voce "Classifica" del menu a tendina.
//
// La voce è sempre la stessa in ogni pagina (<a data-classifica>), ma
// NON porta sempre alla stessa scheda: apre la Classifica già sulla
// scheda che c'entra con la pagina in cui ci si trova. Nessun
// "?vista=" scritto a mano nell'HTML: l'indirizzo si costruisce qui.
//
//   Primavera / Estate / Autunno·Inverno   -> Periodi di quella stagione
//   Primavera/2024, Estate/2022, ...        -> Giri di quella stagione e anno
//   Autunno_Inverno/2020-2021               -> Giri di quel periodo
//   Statistiche/Anni/2023                   -> Km mensili di quell'anno
//   Statistiche/stagioni                    -> Stagioni
//   Storico mensile / Statistiche totali    -> Km mensili
//   Cerca per data                          -> Giri
//   tutte le altre pagine                   -> Mesi migliori
//   la Classifica stessa                    -> la scheda e i filtri attuali
//                                              (si aggiorna da sola a ogni
//                                              cambio, vedi stato-url.js)
//
// Dipende da: js/componenti/index.js (è lui a creare le voci del menu).
// ============================================================

(() => {
  "use strict";
  const STAGIONI = {
    primavera: "Primavera",
    estate: "Estate",
    autunno_inverno: "Autunno - Inverno",
  };

  const percorso = () => {
    let p = window.location.pathname;
    try {
      p = decodeURIComponent(p);
    } catch (e) {
      /* già leggibile */
    }
    p = p.toLowerCase();
    // Netlify serve gli indirizzi "puliti" (/statistiche/history/classificamesi
    // invece di .../ClassificaMesi.html): si riporta tutto alla forma con
    // .html, cosi' i confronti qui sotto valgono in entrambi i casi.
    if (p.length > 1 && p.charAt(p.length - 1) === "/") p = p.slice(0, -1);
    if (!/\.[a-z0-9]+$/.test(p)) p += ".html";
    return p;
  };

  const codifica = (v) => encodeURIComponent(v).replace(/%2C/gi, ",");

  const query = (coppie) =>
    coppie.map((c) => c[0] + "=" + codifica(c[1])).join("&");

  // Cosa mostrare nella Classifica, a partire dalla pagina attuale.
  // Restituisce la query string (senza "?"), oppure null se siamo già
  // nella Classifica (in quel caso l'indirizzo vero è quello in barra).
  const queryPerPaginaAttuale = () => {
    const p = percorso();
    let m;

    if (/\/classificamesi\.html$/.test(p)) return null;

    // Pagina di un singolo periodo: Primavera/2024.html, Autunno_Inverno/2020-2021.html
    m = p.match(/\/(primavera|estate|autunno_inverno)\/([^/]+)\.html$/);
    if (m) {
      return query([
        ["vista", "tappe"],
        ["modo", "classifica"],
        ["stagione", STAGIONI[m[1]]],
        ["anno", m[2]],
      ]);
    }

    // Pagina generale di una stagione: Primavera.html ...
    m = p.match(/\/(primavera|estate|autunno_inverno)\.html$/);
    if (m) {
      return query([
        ["vista", "periodi"],
        ["stagione", STAGIONI[m[1]]],
      ]);
    }

    // Statistiche di un anno: Statistiche/Anni/2023.html
    m = p.match(/\/statistiche\/anni\/(\d{4})\.html$/);
    if (m) {
      return query([
        ["vista", "record"],
        ["anno", m[1]],
      ]);
    }

    if (/\/statistiche\/stagioni\.html$/.test(p))
      return query([["vista", "stagioni"]]);

    if (/\/(storicomensile|statistiche_totali)\.html$/.test(p))
      return query([["vista", "record"]]);

    if (/\/cercadata\.html$/.test(p))
      return query([
        ["vista", "tappe"],
        ["modo", "classifica"],
      ]);

    return query([["vista", "mesi"]]);
  };

  const aggiorna = () => {
    const link = document.querySelectorAll("a[data-classifica]");
    if (!link.length) return;
    const q = queryPerPaginaAttuale();

    link.forEach((a) => {
      const base = (a.getAttribute("href") || "").split("?")[0];
      // Nella Classifica stessa: l'indirizzo è quello attuale.
      const coda = q === null ? window.location.search.replace(/^\?/, "") : q;
      a.setAttribute("href", coda ? base + "?" + coda : base);
    });
  };

  const avvia = () => {
    aggiorna();
    // La pagina Classifica riscrive il proprio indirizzo a ogni
    // pulsante/filtro: l'icona lo segue (evento lanciato da stato-url.js).
    window.addEventListener("classifica:url", aggiorna);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})();
