document.addEventListener("DOMContentLoaded", function () {
  initCookieBanner();
  initLoginSystem();
  initBackgroundAnimation();
  initRippleEffect();
  initParticlesJS();
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

  const cookieBanner = document.getElementById("cookie-banner");
  cookieBanner.style.animation = "slideOut 0.5s forwards";

  setTimeout(() => {
    hideElement(cookieBanner);
    showElement(document.getElementById("revoke-cookies"));
  }, 500);
}

// Animazione di uscita per il banner dei cookie
document.head.insertAdjacentHTML('beforeend', `
  <style>
    @keyframes slideOut {
      to {
        transform: translateY(100px);
        opacity: 0;
      }
    }
  </style>
`);

// Revoca il consenso ai cookie
function revokeCookies() {
  localStorage.removeItem("cookieAccepted");
  showElement(document.getElementById("cookie-banner"));
  hideElement(document.getElementById("revoke-cookies"));

  // Resetta l'animazione
  const cookieBanner = document.getElementById("cookie-banner");
  cookieBanner.style.animation = "none";
  void cookieBanner.offsetWidth; // Trigger reflow
  cookieBanner.style.animation = "slideIn 0.5s forwards";
}

// Inizializza il sistema di login
function initLoginSystem() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);

  // Inizializza il toggle della password
  initPasswordToggle();

  // Aggiungi effetto focus agli input
  initInputFocusEffects();
}

// Funzione per inizializzare l'effetto focus sugli input
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

      // Aggiungi un'animazione di rotazione all'icona
      this.style.transform = "rotate(180deg)";
      setTimeout(() => {
        this.style.transform = "rotate(0deg)";
      }, 300);
    });
  }
}

// Gestisce il login
async function handleLoginSubmit(event) {
  event.preventDefault();

  if (!hasAcceptedCookies()) {
    showNotification("⚠️ Devi accettare i cookie per accedere!", "warning");
    return;
  }

  const username = document.getElementById("username").value,
    password = document.getElementById("password").value;

  // Mostra un indicatore di caricamento
  const loginBtn = document.querySelector(".login-btn span");
  const originalText = loginBtn.textContent;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifica...';

  try {
    const users = await loadUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    setTimeout(() => {
      if (user) {
        showNotification("✅ Accesso riuscito! Reindirizzamento...", "success");
        setTimeout(() => {
          window.location.href = "Giri.html";
        }, 1000);
      } else {
        showNotification("❌ Nome utente o password non validi!", "error");
        loginBtn.textContent = originalText;

        // Aggiungi effetto shake al form
        const form = document.getElementById("loginForm");
        form.classList.add("shake");
        setTimeout(() => {
          form.classList.remove("shake");
        }, 500);
      }
    }, 800); // Simula un breve ritardo per il controllo
  } catch (error) {
    showNotification("❌ Errore durante l'accesso. Riprova più tardi.", "error");
    loginBtn.textContent = originalText;
  }
}

// Funzione per mostrare notifiche
function showNotification(message, type) {
  // Rimuovi notifiche esistenti
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Crea una nuova notifica
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Aggiungi stili CSS per la notifica
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      .notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: notificationAppear 0.3s forwards, notificationDisappear 0.3s forwards 3s;
      }
      
      @keyframes notificationAppear {
        from { opacity: 0; transform: translate(-50%, -20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
      
      @keyframes notificationDisappear {
        from { opacity: 1; transform: translate(-50%, 0); }
        to { opacity: 0; transform: translate(-50%, -20px); }
      }
      
      .notification.success {
        background-color: #06d6a0;
      }
      
      .notification.error {
        background-color: #ef476f;
      }
      
      .notification.warning {
        background-color: #ffd166;
        color: #333;
      }
      
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

  document.body.appendChild(notification);

  // Rimuovi la notifica dopo 3.5 secondi
  setTimeout(() => {
    notification.remove();
  }, 3500);
}

// Carica gli utenti dal file JSON
async function loadUsers() {
  try {
    const response = await fetch("Login/JS/users.json");
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
  setInterval(setAbstractBackground, 3000); // Rallentato per una transizione più fluida
}

// Imposta uno sfondo astratto dinamico
function setAbstractBackground() {
  const container = document.getElementById("container");
  if (container) {
    const backgroundColor = getRandomColor(0.2), // Colori più tenui
      backgroundImage = `linear-gradient(45deg, ${getRandomColor(0.3)}, ${getRandomColor(0.3)})`;

    // Usa transizioni CSS per un cambio più fluido
    container.style.transition = "background 2s ease";
    container.style.backgroundColor = backgroundColor;
    container.style.backgroundImage = backgroundImage;
  }
}

// Inizializza l'effetto ripple sui pulsanti
function initRippleEffect() {
  const buttons = document.querySelectorAll('.login-btn, #accept-cookies, .revoke-button');

  buttons.forEach(button => {
    button.addEventListener('click', function (e) {
      const ripple = this.querySelector('.btn-ripple') || document.createElement('span');

      if (!this.querySelector('.btn-ripple')) {
        ripple.classList.add('btn-ripple');
        this.appendChild(ripple);
      }

      ripple.style.left = `${e.offsetX}px`;
      ripple.style.top = `${e.offsetY}px`;
      ripple.style.animation = 'none';

      // Trigger reflow
      void ripple.offsetWidth;

      ripple.style.animation = 'ripple 0.6s linear';
    });
  });
}

// Inizializza particles.js
function initParticlesJS() {
  if (window.particlesJS) {
    particlesJS('particles-js', {
      "particles": {
        "number": {
          "value": 80,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#4361ee"
        },
        "shape": {
          "type": "circle",
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          }
        },
        "opacity": {
          "value": 0.5,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 3,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 2,
            "size_min": 0.1,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#4361ee",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 2,
          "direction": "none",
          "random": true,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
            "enable": false,
            "rotateX": 600,
            "rotateY": 1200
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": true,
            "mode": "grab"
          },
          "onclick": {
            "enable": true,
            "mode": "push"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 140,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 400,
            "size": 40,
            "duration": 2,
            "opacity": 8,
            "speed": 3
          },
          "repulse": {
            "distance": 200,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    });
  }
}

// Funzioni di utilità
const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min,
  getRandomColor = (opacity = 1) =>
    `rgba(${getRandomNumber(0, 255)}, ${getRandomNumber(
      0,
      255
    )}, ${getRandomNumber(0, 255)}, ${opacity})`,
  hideElement = (element) => {
    if (element) element.style.display = "none";
  },
  showElement = (element) => {
    if (element) element.style.display = "block";
  };