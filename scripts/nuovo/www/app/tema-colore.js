// ---------- tema chiaro / scuro (si ricorda la scelta) ----------
const CHIAVE_TEMA = "giri-tema";
const temaAttuale = () =>
  document.documentElement.dataset.tema ||
  (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
const applicaTema = (tema) => {
  document.documentElement.dataset.tema = tema;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = tema === "dark" ? "#0b0f1a" : "#f6f7fb";
  const bottone = document.getElementById("tema-bottone");
  if (bottone) bottone.setAttribute("aria-pressed", String(tema === "dark"));
};
applicaTema(temaAttuale());
document.getElementById("tema-bottone")?.addEventListener("click", () => {
  const nuovo = temaAttuale() === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(CHIAVE_TEMA, nuovo);
  } catch {}
  applicaTema(nuovo);
});
