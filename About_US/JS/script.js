// ============================================================
// script.js — Piè di pagina dinamico e comparsa dei blocchi
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

// Comparsa graduale dei blocchi
const initReveal = () => {
  const blocchi = document.querySelectorAll(".fade-in");
  if (!blocchi.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  blocchi.forEach((el) => observer.observe(el));
};

// Scorrimento morbido per i collegamenti interni
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || !href.startsWith("#")) return;

  const target = document.querySelector(href);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  updateFooter();
  scheduleMidnightUpdate();
  initReveal();
});
