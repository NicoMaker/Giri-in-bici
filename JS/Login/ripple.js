// ============================================================
// ripple.js — Onda che parte dal punto in cui si clicca
// Richiamato da Login/scriptLogin.js
// ============================================================

function initRippleEffect() {
  const buttons = document.querySelectorAll(
    ".login-btn, #accept-cookies, .revoke-button",
  );
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple =
        this.querySelector(".btn-ripple") || document.createElement("span");
      if (!this.querySelector(".btn-ripple")) {
        ripple.classList.add("btn-ripple");
        this.appendChild(ripple);
        if (!document.querySelector("style[data-ripple-style]")) {
          document.head.insertAdjacentHTML(
            "beforeend",
            `
            <style data-ripple-style>
              .btn-ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                pointer-events: none;
              }
              @keyframes ripple {
                to { transform: scale(4); opacity: 0; }
              }
            </style>
          `,
          );
        }
      }

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = `${e.offsetX - size / 2}px`;
      ripple.style.top = `${e.offsetY - size / 2}px`;
      ripple.style.animation = "none";
      void ripple.offsetWidth;
      ripple.style.animation = "ripple 0.6s linear";
    });
  });
}
