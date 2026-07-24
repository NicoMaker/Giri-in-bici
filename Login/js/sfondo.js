// ============================================================
// sfondo.js — Gradienti del marchio che si alternano da soli
// Richiamato da Login/scriptLogin.js
// ============================================================

function initBackgroundAnimation() {
  setAbstractBackground();
  setInterval(setAbstractBackground, 7000);
}

// Gradienti del marchio: niente colori casuali, solo la palette del sito
const GRADIENTI = [
  "linear-gradient(135deg, rgba(14,139,212,.16), rgba(111,91,240,.14))",
  "linear-gradient(135deg, rgba(12,166,120,.16), rgba(99,198,95,.14))",
  "linear-gradient(135deg, rgba(242,112,26,.15), rgba(247,201,72,.14))",
  "linear-gradient(135deg, rgba(27,111,196,.16), rgba(94,194,224,.14))",
];

let indiceGradiente = 0;

function setAbstractBackground() {
  const container = document.getElementById("container");
  if (!container) return;
  container.style.backgroundImage = GRADIENTI[indiceGradiente];
  indiceGradiente = (indiceGradiente + 1) % GRADIENTI.length;
}
