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

    // Genera un numero casuale compreso tra min e max
    function getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Genera un colore casuale in formato RGB
    function getRandomColor() {
      var red = getRandomNumber(0, 255);
      var green = getRandomNumber(0, 255);
      var blue = getRandomNumber(0, 255);
      return `rgb(${red}, ${green}, ${blue})`;
    }

    // Imposta lo sfondo con un'immagine astratta
    function setAbstractBackground() {
      var container = document.getElementById('container');
      var backgroundColor = getRandomColor();
      var backgroundImage = `linear-gradient(45deg, ${getRandomColor()}, ${getRandomColor()})`;
      container.style.backgroundColor = backgroundColor;
      container.style.backgroundImage = backgroundImage;
    }

    // Chiamata alla funzione per impostare lo sfondo all'avvio
    setAbstractBackground();