const menu = document.querySelector(".menu"),
  hamburger = document.querySelector(".hamburger"),
  closeIcon = document.querySelector(".CloseIcon"),
  menuIcon = document.querySelector(".MenuIcon"),
  km = 15196,
  corse = 219,
  mediavalue = (km / corse).toFixed(2);

function toggleMenu() {
  if (menu.classList.contains("showMwnu")) {
    menu.classList.remove("showMwnu");
    closeIcon.style.display = "none";
    menuIcon.style.display = "block";
  } else {
    menu.classList.add("showMwnu");
    closeIcon.style.display = "block";
    menuIcon.style.display = "none";
  }
}

hamburger.addEventListener("click", toggleMenu);

document.getElementById("km").innerHTML = `
    <div class="colore">
      <p class="misuracolre">totale km ${km} <img src="Icons/traguardo.png"></p>
      <p class="misuracolre">km medi per giro percorsi ${mediavalue}</p>
    </div>
  `;