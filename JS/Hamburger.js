const menu = document.querySelector(".menu"),
  hamburger = document.querySelector(".hamburger"),
  closeIcon = document.querySelector(".CloseIcon"),
  menuIcon = document.querySelector(".MenuIcon");

function toggleMenu() {
  if (menu.classList.contains("showMenu")) {
    menu.classList.remove("showMenu");
    closeIcon.style.display = "none";
    menuIcon.style.display = "block";
  } else {
    menu.classList.add("showMenu");
    closeIcon.style.display = "block";
    menuIcon.style.display = "none";
  }
}

hamburger.addEventListener("click", toggleMenu);

function contactEmail(emailsubject, subjetmail) {
  const email = emailsubject,
    subject = `info sul sito ${subjetmail}`,
    mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  window.location.href = mailtoLink;
}

const contactell = () => window.location.href = "tel:+393337024320";