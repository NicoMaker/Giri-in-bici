let currentYear = new Date().getFullYear();

let users = [
  { username: "NicoMaker", password: `Giri${currentYear}` },
  { username: "Jacoreds", password: `Giri${currentYear}` },
];

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Evita il comportamento di default del form

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) window.location.href = "giri.html";
    else alert("Nome utente o password non validi!");
  });

// Genera un numero casuale compreso tra min e max
let getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Genera un colore casuale in formato RGB
function getRandomColor() {
  let red = getRandomNumber(0, 255);
  let green = getRandomNumber(0, 255);
  let blue = getRandomNumber(0, 255);
  return `rgb(${red}, ${green}, ${blue})`;
}

// Imposta lo sfondo con un'immagine astratta
function setAbstractBackground() {
  let container = document.getElementById("container");
  let backgroundColor = getRandomColor();
  let backgroundImage = `linear-gradient(45deg, ${getRandomColor()}, ${getRandomColor()})`;
  container.style.backgroundColor = backgroundColor;
  container.style.backgroundImage = backgroundImage;
}

// Chiamata alla funzione per impostare lo sfondo all'avvio
setAbstractBackground();

setInterval(setAbstractBackground, 1500);
