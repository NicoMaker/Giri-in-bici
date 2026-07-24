// ============================================================
// footer.js — Piè di pagina con la data di oggi, aggiornato a mezzanotte
// Richiamato da About_US/JS/script.js
// ============================================================

const months = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const generateFooter = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  return `
    <div class="footer-line">
      <span aria-hidden="true">🚴‍♂️</span>
      <div>
        <div class="footer-dates">Dal 30 Maggio 2020 al ${day} ${month} ${year}</div>
        <div class="footer-brand">Nico Maker &middot; Giri in Bici</div>
      </div>
      <span aria-hidden="true">🚴‍♀️</span>
    </div>
  `;
};

const updateFooter = () => {
  const el = document.getElementById("footer-content");
  if (el) el.innerHTML = generateFooter();
};

// Riallinea la data esattamente a mezzanotte, poi ogni 24 ore
const scheduleMidnightUpdate = () => {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );

  setTimeout(() => {
    updateFooter();
    setInterval(updateFooter, 24 * 60 * 60 * 1000);
  }, midnight - now);
};
