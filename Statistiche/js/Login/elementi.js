// ============================================================
// elementi.js — Piccole utilita' condivise dagli altri componenti
// Richiamato da Login/scriptLogin.js
// ============================================================

// Utilità
const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomColor = (opacity = 1) =>
  `rgba(${getRandomNumber(0, 255)}, ${getRandomNumber(0, 255)}, ${getRandomNumber(0, 255)}, ${opacity})`;

const hideElement = (element) => {
  if (element) element.style.display = "none";
};

const showElement = (element) => {
  if (element) element.style.display = "block";
};
