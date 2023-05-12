document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita il comportamento di default del form
  
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
  
    // Verifica se le credenziali sono corrette
    if (username === "NicolaJacopo" && password === "Giri2023") {
      window.location.href = "giri.html"; // Reindirizza alla pagina home.html
    } else {
      alert("Credenziali non valide. Riprova.");
    }
  });
  