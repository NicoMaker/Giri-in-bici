// ============================================================
// cookie.js — Banner dei cookie: accetta, revoca, ricorda la scelta
// Richiamato da Login/scriptLogin.js
// ============================================================

// Cookie banner
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

const hasAcceptedCookies = () =>
  localStorage.getItem("cookieAccepted") === "true";

function acceptCookies() {
  localStorage.setItem("cookieAccepted", "true");
  const cookieBanner = document.getElementById("cookie-banner");
  cookieBanner.style.animation = "slideOut 0.5s forwards";
  setTimeout(() => {
    hideElement(cookieBanner);
    showElement(document.getElementById("revoke-cookies"));
  }, 500);
}

function revokeCookies() {
  localStorage.removeItem("cookieAccepted");
  showElement(document.getElementById("cookie-banner"));
  hideElement(document.getElementById("revoke-cookies"));
  const cookieBanner = document.getElementById("cookie-banner");
  cookieBanner.style.animation = "none";
  void cookieBanner.offsetWidth;
  cookieBanner.style.animation = "slideIn 0.5s forwards";
}

document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
    @keyframes slideOut {
      to { transform: translateY(100px); opacity: 0; }
    }
    @keyframes slideIn {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
`,
);
