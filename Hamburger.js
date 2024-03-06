const menu = document.querySelector(".menu"),
  hamburger = document.querySelector(".hamburger"),
  closeIcon = document.querySelector(".CloseIcon"),
  menuIcon = document.querySelector(".MenuIcon");

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

let kmElement = document.getElementById("km");

if (kmElement) {
  let km = parseFloat(kmElement.getAttribute("data-km")),
    corse = parseFloat(kmElement.getAttribute("data-corse"));

  if (!isNaN(km) && !isNaN(corse)) {
    let mediaValue = (km / corse).toFixed(2);

    let stampa = `
      <div class="colore">
        <p>totale km ${km} <img src="Icone/traguardo.png"></p>
        <p>km medi per giro percorsi ${mediaValue}</p>
      </div>
    `;

    kmElement.innerHTML = stampa;
  }
}