const menu = document.querySelector(".menu");
const hamburger = document.querySelector(".hamburger");
const closeIcon = document.querySelector(".CloseIcon");
const menuIcon = document.querySelector(".MenuIcon");

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
if (!kmElement) {
  console.error("Elemento non trovato.");
} else {
  let km = parseFloat(kmElement.getAttribute("data-km"));
  let corse = parseFloat(kmElement.getAttribute("data-corse"));

  if (!isNaN(km) && !isNaN(corse)) {
    let mediaValue = (km / corse).toFixed(2);

    let stampa = `
            <div class="colore">
                <p> totale km ${km} <img src="Icone/traguardo.png"> </p>
                <p> km medi per giro
                percorsi ${mediaValue} </p>
            </div>
        `;

    kmElement.innerHTML = stampa;
  } else
    console.error("Dati non validi.");
}
