// ============================================================
// origine.js — Consente il sito solo dal suo dominio ufficiale
//
// Va inserito come PRIMISSIMO script (senza "defer") in OGNI
// pagina, login compresa, cosi' agisce prima che qualsiasi altro
// contenuto venga mostrato. Se qualcuno apre il sito da un altro
// indirizzo (copia, specchio, deploy di anteprima, ecc.) viene
// rimandato subito al dominio originale.
//
// Fa eccezione solo l'ambiente di sviluppo in locale
// (localhost / 127.0.0.1 / file aperto direttamente da disco),
// cosi' il sito resta testabile durante lo sviluppo. Se non la
// vuoi, rimuovi il blocco "e' locale?" qui sotto.
// ============================================================

(function () {
  const DOMINIO_UFFICIALE = "https://giri-in-bici.netlify.app";

  const origineAttuale = window.location.origin;
  const eLocale =
    window.location.protocol === "file:" ||
    origineAttuale.startsWith("http://localhost") ||
    origineAttuale.startsWith("http://127.0.0.1");

  if (origineAttuale !== DOMINIO_UFFICIALE && !eLocale) {
    window.location.replace(
      DOMINIO_UFFICIALE + window.location.pathname + window.location.search,
    );
  }
})();
