// ============================================================
// scriptLogin.js — Avvio della pagina di accesso
//
// Qui c'e' solo l'avvio: ogni funzionalita' vive nel suo file
// dentro Login/js/ e viene caricata prima di questo (vedi index.html).
//   elementi.js         mostrare/nascondere, numeri e colori casuali
//   dati.js             carica gli utenti dal JSON
//   cookie.js           banner dei cookie
//   campi.js            effetti sui campi e occhio della password
//   notifiche.js        messaggi in cima alla pagina
//   accesso.js          controllo di nome utente e password
//   sfondo.js           gradienti che cambiano da soli
//   ripple.js           onda al click sui bottoni
//   particelle.js       sfondo animato particles.js
//   ritorno-indietro.js ricarica se si torna col tasto Indietro
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  initCookieBanner();
  initLoginSystem();
  initBackgroundAnimation();
  initRippleEffect();
  initParticlesJS();
});
