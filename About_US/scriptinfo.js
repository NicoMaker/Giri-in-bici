const annoCorrente = new Date().getFullYear();
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

let numeroMeseCorrente = new Date().getMonth();
const numeroGiorno = new Date().getDate();

const meseCorrente = nomiMesi[numeroMeseCorrente];

const info = `&copy; 30 / Maggio / 2020 - ${numeroGiorno} / ${meseCorrente} / ${annoCorrente} 
<br>Nico Maker Giri in Bici`;
document.getElementById("info").innerHTML = `<footer>${info}</footer>`;
