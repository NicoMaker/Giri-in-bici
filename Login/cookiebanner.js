// cookieBanner.js
document.addEventListener("DOMContentLoaded", function () {
  const cookieBanner = document.getElementById("cookie-banner"),
    acceptButton = document.getElementById("accept-cookies"),
    revokeButton = document.getElementById("revoke-cookies");

  // Controlla se l'utente ha già accettato i cookie
  if (localStorage.getItem("cookieAccepted") === "true") {
    cookieBanner.style.display = "none";
    revokeButton.style.display = "block"; // Mostra il pulsante di revoca
  } else cookieBanner.style.display = "flex";

  // Quando l'utente accetta i cookie
  acceptButton.addEventListener("click", function () {
    localStorage.setItem("cookieAccepted", "true");
    cookieBanner.style.display = "none";
    revokeButton.style.display = "block"; // Mostra il pulsante di revoca
  });

  // Quando l'utente revoca il consenso ai cookie
  revokeButton.addEventListener("click", function () {
    localStorage.removeItem("cookieAccepted");
    cookieBanner.style.display = "flex";
    revokeButton.style.display = "none"; // Nasconde il pulsante di revoca finché l'utente non accetta di nuovo
  });
});
