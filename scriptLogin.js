var users = [
  { username: "NicoMaker", password: "Giri2023" },
  { username: "Jacopo", password: "Giri2023" },
];

document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Evita il comportamento di default del form

  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  var user = users.find(function(u) {
    return u.username === username && u.password === password;
  });

 if (user) {
      window.location.href = "giri.html";
    } else {
      alert("Nome utente o password non validi!");
    }
});