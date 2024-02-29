const currentDate = new Date();
const annoCorrente = currentDate.getFullYear();
let nomiMesi = [
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
];

let numeroMeseCorrente = currentDate.getMonth();
const numeroGiorno = currentDate.getDate();

const meseCorrente = nomiMesi[numeroMeseCorrente];

const info = `&copy; 30 / Maggio / 2020 - ${numeroGiorno} / ${meseCorrente} / ${annoCorrente} 
<br>Nico Maker Giri in Bici`;
document.getElementById("info").innerHTML = `<footer>${info}</footer>`;
