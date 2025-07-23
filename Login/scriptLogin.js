document.addEventListener("DOMContentLoaded", function () {
  initCookieBanner();
  initLoginSystem();
  initBackgroundAnimation();
  initRippleEffect();
  initParticlesJS();
});

// Variabile globale temporanea (non salvata)
let appData = null;

// Carica i dati utente
async function loadAppData() {
  try {
    const response = await fetch("../About_US/JS/Users.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    appData = await response.json();
    return appData;
  } catch (error) {
    console.error("Errore nel caricamento dei dati:", error);
    throw error;
  }
}

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

document.head.insertAdjacentHTML('beforeend', `
  <style>
    @keyframes slideOut {
      to { transform: translateY(100px); opacity: 0; }
    }
    @keyframes slideIn {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
`);

function initLoginSystem() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);

    // 🧹 Svuota i campi al caricamento
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    // ❌ Cancella eventuali sessioni residue
    sessionStorage.removeItem('currentUser');
  }

  initPasswordToggle();
  initInputFocusEffects();
}

function initInputFocusEffects() {
  const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
  inputs.forEach(input => {
    input.addEventListener('focus', function () {
      const icon = this.parentElement.querySelector('i:not(.toggle-password)');
      if (icon) icon.style.color = 'var(--accent-color)';
    });
    input.addEventListener('blur', function () {
      const icon = this.parentElement.querySelector('i:not(.toggle-password)');
      if (icon) icon.style.color = 'var(--primary-color)';
    });
  });
}

function initPasswordToggle() {
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
      this.style.transform = "rotate(180deg)";
      setTimeout(() => { this.style.transform = "rotate(0deg)"; }, 300);
    });
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  if (!hasAcceptedCookies()) {
    showNotification("⚠️ Devi accettare i cookie per accedere!", "warning");
    return;
  }

  const username = document.getElementById("username").value.trim(),
    password = document.getElementById("password").value.trim();

  const loginBtn = document.querySelector(".login-btn span");
  const originalText = loginBtn.textContent;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifica...';

  try {
    if (!appData) {
      await loadAppData();
    }

    const user = appData.users.find(u => u.username === username);
    const expectedPassword = generatePassword();

    setTimeout(() => {
      if (user && password === expectedPassword) {
        showNotification("✅ Accesso riuscito! Reindirizzamento...", "success");
        setTimeout(() => {
          window.location.href = "Giri.html";
        }, 1000);
      } else {
        showNotification("❌ Nome utente o password non validi!", "error");
        loginBtn.textContent = originalText;
        const form = document.getElementById("loginForm");
        form.classList.add("shake");
        setTimeout(() => form.classList.remove("shake"), 500);
      }
    }, 800);
  } catch (error) {
    console.error("Errore durante l'accesso:", error);
    showNotification("❌ Errore durante l'accesso. Riprova più tardi.", "error");
    loginBtn.textContent = originalText;
  }
}

function showNotification(message, type) {
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) existingNotification.remove();

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  if (!document.querySelector('style[data-notification-style]')) {
    document.head.insertAdjacentHTML('beforeend', `
      <style data-notification-style>
        .notification {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 1000;
          animation: notificationAppear 0.3s, notificationDisappear 0.3s 3s;
        }
        @keyframes notificationAppear {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes notificationDisappear {
          from { opacity: 1; transform: translate(-50%, 0); }
          to { opacity: 0; transform: translate(-50%, -20px); }
        }
        .notification.success { background-color: #06d6a0; }
        .notification.error { background-color: #ef476f; }
        .notification.warning { background-color: #ffd166; color: #333; }
        .shake {
          animation: shake 0.5s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      </style>
    `);
  }

  document.body.appendChild(notification);
  setTimeout(() => { if (notification.parentNode) notification.remove(); }, 3500);
}

function generatePassword() {
  const date = new Date(),
    day = String(date.getDate()).padStart(2, '0'),
    month = String(date.getMonth() + 1).padStart(2, '0'),
    year = date.getFullYear();
  return `Giri ${day}/${month}/${year}`;
}

function initBackgroundAnimation() {
  setAbstractBackground();
  setInterval(setAbstractBackground, 3000);
}

function setAbstractBackground() {
  const container = document.getElementById("container");
  if (container) {
    const bgColor = getRandomColor(0.2);
    const bgImage = `linear-gradient(45deg, ${getRandomColor(0.3)}, ${getRandomColor(0.3)})`;
    container.style.transition = "background 2s ease";
    container.style.backgroundColor = bgColor;
    container.style.backgroundImage = bgImage;
  }
}

function initRippleEffect() {
  const buttons = document.querySelectorAll('.login-btn, #accept-cookies, .revoke-button');
  buttons.forEach(button => {
    button.addEventListener('click', function (e) {
      const ripple = this.querySelector('.btn-ripple') || document.createElement('span');
      if (!this.querySelector('.btn-ripple')) {
        ripple.classList.add('btn-ripple');
        this.appendChild(ripple);
        if (!document.querySelector('style[data-ripple-style]')) {
          document.head.insertAdjacentHTML('beforeend', `
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
          `);
        }
      }

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = `${e.offsetX - size / 2}px`;
      ripple.style.top = `${e.offsetY - size / 2}px`;
      ripple.style.animation = 'none';
      void ripple.offsetWidth;
      ripple.style.animation = 'ripple 0.6s linear';
    });
  });
}

function initParticlesJS() {
  if (window.particlesJS) {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#4361ee" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: "#4361ee", opacity: 0.4, width: 1 },
        move: { enable: true, speed: 2, direction: "none", random: true, out_mode: "out" }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" },
          resize: true
        },
        modes: {
          grab: { distance: 140, line_linked: { opacity: 1 } },
          push: { particles_nb: 4 }
        }
      },
      retina_detect: true
    });
  }
}

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


// 🔁 Rileva ritorno tramite tasto "Indietro" e forza un reload completo
window.addEventListener("pageshow", function (event) {
  if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    location.reload();
  }
});
