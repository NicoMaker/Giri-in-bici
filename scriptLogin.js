const currentDate = new Date();
const currentYear = currentDate.getFullYear();
let numeroMeseCorrente = currentDate.getMonth() + 1;
let numeroGiorno = currentDate.getDate();

if (numeroGiorno < 10) numeroGiorno = `0${numeroGiorno}`;

if (numeroMeseCorrente < 10) numeroMeseCorrente = `0${numeroMeseCorrente}`;

const generatePassword = () =>
  `Giri ${numeroGiorno}/${numeroMeseCorrente}/${currentYear}`;

console.log(generatePassword());

const users = [
  {
    username: "NicoMaker",
    password: generatePassword(),
  },
  {
    username: "Jacoreds",
    password: generatePassword(),
  },
];

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

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
