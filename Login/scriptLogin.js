function generatePassword() {
  const date = new Date(),
    day = (date.getDate() < 10 ? "0" : "") + date.getDate(),
    month = (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1),
    year = date.getFullYear();
  return `Giri ${day}/${month}/${year}`;
}
const getRandomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  getRandomColor = () =>
    `rgb(${getRandomNumber(0, 255)}, ${getRandomNumber(
      0,
      255
    )}, ${getRandomNumber(0, 255)})`;

function setAbstractBackground() {
  const container = document.getElementById("container"),
    backgroundColor = getRandomColor(),
    backgroundImage = `linear-gradient(45deg, ${getRandomColor()}, ${getRandomColor()})`;

  container.style.backgroundColor = backgroundColor;
  container.style.backgroundImage = backgroundImage;
}

async function loadUsers() {
  try {
    const response = await fetch("Login/users.json");
    const data = await response.json();
    return data.users.map((user) => ({
      username: user.username,
      password: generatePassword(),
    }));
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const username = document.getElementById("username").value,
    password = document.getElementById("password").value,
    users = await loadUsers(),
    user = users.find(
      (u) => u.username === username && u.password === password
    );

  if (user) window.location.href = "giri.html";
  else alert("Nome utente o password non validi!");
}

function initialize() {
  setAbstractBackground();
  setInterval(setAbstractBackground, 1500);

  document
    .getElementById("loginForm")
    .addEventListener("submit", handleLoginSubmit);
}

window.onload = initialize;
