// ============================================================
// rivelazione.js — Comparsa graduale dei blocchi .fade-in
// Richiamato da About_US/JS/script.js
// ============================================================

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
