document.addEventListener("DOMContentLoaded", function () {
  initCookieBanner();
  initLoginSystem();
  initBackgroundAnimation();
});

// Inizializza il banner dei cookie
function initCookieBanner() {
  const cookieBanner = document.getElementById("cookie-banner"),
    acceptButton = document.getElementById("accept-cookies"),
    revokeButton = document.getElementById("revoke-cookies");

  if (hasAcceptedCookies()) {
    hideElement(cookieBanner);
    showElement(revokeButton);
  } else showElement(cookieBanner);

  acceptButton.addEventListener("click", acceptCookies);
  revokeButton.addEventListener("click", revokeCookies);
}

// Controlla se i cookie sono stati accettati
const hasAcceptedCookies = () =>
  localStorage.getItem("cookieAccepted") === "true";

// Accetta i cookie
function acceptCookies() {
  localStorage.setItem("cookieAccepted", "true");
  hideElement(document.getElementById("cookie-banner"));
  showElement(document.getElementById("revoke-cookies"));
}

// Revoca il consenso ai cookie
function revokeCookies() {
  localStorage.removeItem("cookieAccepted");
  showElement(document.getElementById("cookie-banner"));
  hideElement(document.getElementById("revoke-cookies"));
}

// Inizializza il sistema di login
function initLoginSystem() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);

  // Inizializza il toggle della password
  initPasswordToggle();
}

// Funzione per inizializzare il toggle della password
function initPasswordToggle() {
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      // Cambia il tipo di input tra "password" e "text"
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Cambia l'icona tra "eye" e "eye-slash"
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }
}

// Gestisce il login
async function handleLoginSubmit(event) {
  event.preventDefault();

  if (!hasAcceptedCookies()) {
    alert("⚠️ Devi accettare i cookie per accedere!");
    return;
  }

  const username = document.getElementById("username").value,
    password = document.getElementById("password").value,
    users = await loadUsers(),
    user = users.find(
      (u) => u.username === username && u.password === password
    );

  if (user) window.location.href = "Giri.html";
  else alert("❌ Nome utente o password non validi!");
}

// Carica gli utenti dal file JSON
async function loadUsers() {
  try {
    const response = await fetch("Login/users.json");
    if (!response.ok) throw new Error("Errore nel caricamento del file JSON.");

    const data = await response.json();
    return data.users.map((user) => ({
      username: user.username,
      password: generatePassword(),
    }));
  } catch (error) {
    console.error(`Errore nel caricamento utenti: ${error}`);
    return [];
  }
}

// Genera una password basata sulla data
function generatePassword() {
  const date = new Date(),
    day = (date.getDate() < 10 ? "0" : "") + date.getDate(),
    month = (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1),
    year = date.getFullYear();
  return `Giri ${day}/${month}/${year}`;
}

// Inizializza lo sfondo animato
function initBackgroundAnimation() {
  setAbstractBackground();
  setInterval(setAbstractBackground, 1500);
}

// Imposta uno sfondo astratto dinamico
function setAbstractBackground() {
  const container = document.getElementById("container");
  if (container) {
    const backgroundColor = getRandomColor(),
      backgroundImage = `linear-gradient(45deg, ${getRandomColor()}, ${getRandomColor()})`;

    container.style.backgroundColor = backgroundColor;
    container.style.backgroundImage = backgroundImage;
  }
}

// Funzioni di utilità
const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min,
  getRandomColor = () =>
    `rgb(${getRandomNumber(0, 255)}, ${getRandomNumber(
      0,
      255
    )}, ${getRandomNumber(0, 255)})`,
  hideElement = (element) => {
    if (element) element.style.display = "none";
  },
  showElement = (element) => {
    if (element) element.style.display = "block";
  };