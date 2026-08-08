// ============================================================
// guardia-accesso.js — Richiede il login del giorno corrente
//
// Va inserito come PRIMO script (senza "defer") in ogni pagina
// protetta, cosi' agisce prima che la pagina venga disegnata:
//   - Se manca una sessione valida per l'utente e per il giorno
//     di oggi, rimanda subito al login (niente lampeggio di
//     contenuto protetto).
//   - Se la sessione e' valida, pianifica l'uscita automatica
//     alla mezzanotte successiva: se la pagina resta aperta a
//     cavallo del cambio giorno, si torna al login da soli,
//     senza bisogno di un refresh manuale.
//   - Un controllo periodico fa da rete di sicurezza nel caso
//     il dispositivo vada in stand-by e il timer della mezzanotte
//     venga "saltato".
//
// NON va incluso in index.html (la pagina di login stessa),
// solo nelle pagine che richiedono l'accesso gia' effettuato.
// ============================================================

(function () {
  const PAGINA_LOGIN = "/index.html";

  function chiaveGiornoOggi() {
    const oggi = new Date();
    const anno = oggi.getFullYear();
    const mese = String(oggi.getMonth() + 1).padStart(2, "0");
    const giorno = String(oggi.getDate()).padStart(2, "0");
    return `${anno}-${mese}-${giorno}`;
  }

  function vaiAlLogin() {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("giornoAccesso");
    window.location.replace(PAGINA_LOGIN);
  }

  const utente = sessionStorage.getItem("currentUser");
  const giornoSalvato = sessionStorage.getItem("giornoAccesso");

  // Nessuna sessione valida per l'utente o per il giorno di oggi:
  // via subito al login, senza aspettare che il resto della pagina
  // (immagini, altri script) venga caricato.
  if (!utente || giornoSalvato !== chiaveGiornoOggi()) {
    vaiAlLogin();
  } else {
    // Sessione valida: pianifica l'uscita automatica alla
    // mezzanotte successiva.
    const pianificaUscitaAMezzanotte = () => {
      const ora = new Date();
      const prossimaMezzanotte = new Date(
        ora.getFullYear(),
        ora.getMonth(),
        ora.getDate() + 1,
        0,
        0,
        0,
        0,
      );
      const msMancanti = prossimaMezzanotte - ora;

      // Timer preciso per l'istante esatto della mezzanotte
      setTimeout(vaiAlLogin, msMancanti + 500);

      // Rete di sicurezza: se il dispositivo dorme e il timer
      // sopra "salta" l'orario, questo controllo se ne accorge
      // comunque entro un minuto.
      setInterval(() => {
        if (sessionStorage.getItem("giornoAccesso") !== chiaveGiornoOggi()) {
          vaiAlLogin();
        }
      }, 60 * 1000);
    };

    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        pianificaUscitaAMezzanotte,
      );
    } else {
      pianificaUscitaAMezzanotte();
    }
  }
})();
