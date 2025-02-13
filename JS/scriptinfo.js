const info = `&copy; 30 Maggio 2020 - ${
  (new Date().getDate() < 10 ? "0" : "") + new Date().getDate()
} ${
  [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ][new Date().getMonth()]
} ${new Date().getFullYear()} 
<br>Nico Maker Giri in Bici`;
document.getElementById("info").innerHTML = `<footer>${info}</footer>`;
