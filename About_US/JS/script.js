// Mermaid configuration
document.addEventListener("DOMContentLoaded", function () {
  mermaid.initialize({
    startOnLoad: true,
    theme: "base",
    themeVariables: {
      primaryColor: "#667eea",
      primaryTextColor: "#2d3748",
      primaryBorderColor: "#764ba2",
      lineColor: "#4a5568",
      secondaryColor: "#f093fb",
      tertiaryColor: "#e2e8f0",
      background: "#ffffff",
      mainBkg: "#ffffff",
      secondBkg: "#f7fafc",
      tertiaryBkg: "#edf2f7",
      cScale0: "#667eea",
      cScale1: "#764ba2",
      cScale2: "#f093fb",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
    },
    flowchart: {
      htmlLabels: true,
      curve: "basis",
      nodeSpacing: 50,
      rankSpacing: 50,
      padding: 20,
    },
  });

  // Hide loading spinner once mermaid is rendered
  setTimeout(() => {
    document.getElementById("mermaid-loading").style.display = "none";
  }, 1000);
});

// Footer content generation
const generateFooter = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
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
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  return `
                <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                    <span style="font-size: 1.5rem;">🚴‍♂️</span>
                    <div>
                        <div style = "color : purple;">&copy; 30 Maggio 2020 - ${day} ${month} ${year}</div>
                        <div style="margin-top: 0.5rem; font-weight: 600; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                            Nico Maker Giri in Bici
                        </div>
                    </div>
                    <span style="font-size: 1.5rem;">🚴‍♀️</span>
                </div>
            `;
};

document.getElementById("footer-content").innerHTML = generateFooter();

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = "0.1s";
      entry.target.classList.add("fade-in");
    }
  });
}, observerOptions);

// Observe all fade-in elements
document.querySelectorAll(".fade-in").forEach((el) => {
  observer.observe(el);
});

// Smooth scrolling for anchor links
document.addEventListener("click", function (e) {
  if (
    e.target.tagName === "A" &&
    e.target.getAttribute("href")?.startsWith("#")
  ) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
});

// Add sparkle effect on hover for team members
document.querySelectorAll(".team-member").forEach((member) => {
  member.addEventListener("mouseenter", function () {
    this.style.background =
      "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(240, 147, 251, 0.2))";
  });

  member.addEventListener("mouseleave", function () {
    this.style.background = "rgba(255, 255, 255, 0.5)";
  });
});
