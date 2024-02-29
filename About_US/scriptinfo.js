const currentDate = new Date(),
  annoCorrente = currentDate.getFullYear(),
  numeroMeseCorrente = currentDate.getMonth();
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
  ],
  numeroGiorno = currentDate.getDate();

if (numeroGiorno < 10) numeroGiorno = `0${numeroGiorno}`;

const meseCorrente = nomiMesi[numeroMeseCorrente];

const info = `&copy; 30 / Maggio / 2020 - ${numeroGiorno} / ${meseCorrente} / ${annoCorrente} 
<br>Nico Maker Giri in Bici`;
document.getElementById("info").innerHTML = `<footer>${info}</footer>`;
