const currentYear = new Date().getFullYear();

const users = [
  { username: "NicoMaker", password: `Giri${currentYear}` },
  { username: "Jacoreds", password: `Giri${currentYear}` },
];

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Cerca l'utente nella lista degli utenti
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      window.location.href = "giri.html";
    } else {
      alert("Nome utente o password non validi!");
    }
  });

const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomColor = () =>
  `rgb(${getRandomNumber(0, 255)}, ${getRandomNumber(
    0,
    255
  )}, ${getRandomNumber(0, 255)})`;

function setAbstractBackground() {
  const container = document.getElementById("container");
  const backgroundColor = getRandomColor();
  const backgroundImage = `linear-gradient(45deg, ${getRandomColor()}, ${getRandomColor()})`;
  container.style.backgroundColor = backgroundColor;
  container.style.backgroundImage = backgroundImage;
}

setAbstractBackground();
setInterval(setAbstractBackground, 1500);
