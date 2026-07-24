// ============================================================
// accesso.js — Controllo di nome utente e password
// Richiamato da Login/scriptLogin.js
// ============================================================

function initLoginSystem() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);

    // 🧹 Svuota i campi al caricamento
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    // ❌ Cancella eventuali sessioni residue
    sessionStorage.removeItem("currentUser");
  }

  initPasswordToggle();
  initInputFocusEffects();
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  if (!hasAcceptedCookies()) {
    showNotification("⚠️ Devi accettare i cookie per accedere!", "warning");
    return;
  }

  const username = document.getElementById("username").value.trim(),
    password = document.getElementById("password").value.trim();

  // Riferimento al bottone
  const loginBtn = document.querySelector(".login-btn");

  // L'etichetta "Accedi" è già nell'HTML: la riusiamo, non la ricreiamo.
  // (Prima veniva aggiunto un secondo span e si leggeva "Accedi Accedi".)
  let textSpan = loginBtn.querySelector(".btn-text");
  if (!textSpan) {
    // Compatibilità con pagine vecchie: prende il primo span che non sia il ripple
    textSpan = loginBtn.querySelector("span:not(.btn-ripple)");
  }
  if (!textSpan) {
    textSpan = document.createElement("span");
    textSpan.className = "btn-text";
    textSpan.textContent = "Accedi";
    const icon = loginBtn.querySelector("i.fa-arrow-right");
    if (icon) loginBtn.insertBefore(textSpan, icon);
    else loginBtn.prepend(textSpan);
  }
  textSpan.classList.add("btn-text");

  // Rimuove eventuali testi sciolti dentro al bottone (doppioni)
  loginBtn.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
      node.textContent = "";
    }
  });

  // Aggiungi uno spinner
  let spinner = loginBtn.querySelector(".fa-spinner");
  if (!spinner) {
    spinner = document.createElement("i");
    spinner.className = "fas fa-spinner fa-spin";
    // Inserisce dopo il testo
    loginBtn.insertBefore(spinner, loginBtn.querySelector(".fa-arrow-right"));
  }
  spinner.style.display = "inline-block";
  // Nascondi l'icona freccia
  const arrow = loginBtn.querySelector(".fa-arrow-right");
  if (arrow) arrow.style.display = "none";

  // Disabilita il bottone per evitare doppi click
  loginBtn.disabled = true;

  try {
    if (!appData) {
      await loadAppData();
    }

    const user = appData.users.find((u) => u.username === username);
    const expectedPassword = generatePassword();

    // Simula un ritardo per l'animazione
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (user && password === expectedPassword) {
      showNotification("✅ Accesso riuscito! Reindirizzamento...", "success");
      // Rimuovi spinner e ripristina
      spinner.style.display = "none";
      if (arrow) arrow.style.display = "inline-block";
      loginBtn.disabled = false;
      window.location.href = "Giri.html";
    } else {
      showNotification("❌ Nome utente o password non validi!", "error");
      // Rimuovi spinner e ripristina
      spinner.style.display = "none";
      if (arrow) arrow.style.display = "inline-block";
      loginBtn.disabled = false;
      // Scuoti il form
      const form = document.getElementById("loginForm");
      form.classList.add("shake");
      setTimeout(() => form.classList.remove("shake"), 500);
    }
  } catch (error) {
    console.error("Errore durante l'accesso:", error);
    showNotification(
      "❌ Errore durante l'accesso. Riprova più tardi.",
      "error",
    );
    spinner.style.display = "none";
    if (arrow) arrow.style.display = "inline-block";
    loginBtn.disabled = false;
  }
}

function generatePassword() {
  const date = new Date(),
    day = String(date.getDate()).padStart(2, "0"),
    month = String(date.getMonth() + 1).padStart(2, "0"),
    year = date.getFullYear();
  return `Giri ${day}/${month}/${year}`;
}
