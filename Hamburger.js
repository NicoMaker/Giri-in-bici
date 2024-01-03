const menu = document.querySelector(".menu");
const hamburger = document.querySelector(".hamburger");
const closeIcon = document.querySelector(".CloseIcon");
const menuIcon = document.querySelector(".MenuIcon");

function toggleMenu() {

    if (menu.classList.contains("showMwnu")) {
        menu.classList.remove("showMwnu");
        closeIcon.style.display = "none";
        menuIcon.style.display = "block"
    }
    else {
        menu.classList.add("showMwnu");
        closeIcon.style.display = "block";
        menuIcon.style.display = "none";
    }
}

hamburger.addEventListener("click", toggleMenu);

let totale = 12844;
let corse = 183;

let avgtot = totale / corse;
avgtot = parseFloat(avgtot.toFixed(2));

let stampat = `<p>totale km ${totale} <img src="Icone/traguardo.png"></p> <p>km medi per giro percorsi ${avgtot}</p>`;
document.getElementById("totale").innerHTML = stampat;