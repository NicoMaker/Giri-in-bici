// ============================================================
// contatti.js — Scorciatoie dei pulsanti contatto (mail, telefono, WhatsApp)
// Usato dalla home e dalla pagina Informazioni.
// ============================================================

function contactEmail(indirizzo, oggettoSito) {
  const soggetto = `info sul sito ${oggettoSito}`;
  window.location.href = `mailto:${indirizzo}?subject=${encodeURIComponent(soggetto)}`;
}

const contactell = () => (window.location.href = "tel:+393337024320");

const openWhatsAppChat = () => {
  const numero = "+393337024320",
    messaggio = encodeURIComponent("*Info sul sito Giri in Bici*");
  window.location.href = `https://wa.me/${numero}?text=${messaggio}`;
};
