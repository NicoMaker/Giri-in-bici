document.addEventListener("DOMContentLoaded", function () {
  mermaid.initialize({
    startOnLoad: true,
    theme: "default", // Puoi provare anche "forest", "dark", "neutral"
    themeVariables: {
      primaryColor: "#007acc",
      edgeLabelBackground: "#ffffff",
      clusterBkg: "#f3f3f3",
      fontSize: "16px",
      fontFamily: "Arial",
    },
  });
});
