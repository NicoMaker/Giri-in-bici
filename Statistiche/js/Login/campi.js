// ============================================================
// campi.js — Effetti sui campi e occhio per vedere la password
// Richiamato da Login/scriptLogin.js
// ============================================================

function initInputFocusEffects() {
  const inputs = document.querySelectorAll(
    'input[type="text"], input[type="password"]',
  );
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      const icon = this.parentElement.querySelector("i:not(.toggle-password)");
      if (icon) icon.style.color = "var(--a1)";
    });
    input.addEventListener("blur", function () {
      const icon = this.parentElement.querySelector("i:not(.toggle-password)");
      if (icon) icon.style.color = "var(--ink-3)";
    });
  });
}

function initPasswordToggle() {
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.click();
      }
    });

    togglePassword.addEventListener("click", function () {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
      this.style.transform = "rotate(180deg)";
      setTimeout(() => {
        this.style.transform = "rotate(0deg)";
      }, 300);
    });
  }
}
