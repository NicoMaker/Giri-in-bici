const numeroMeseCorrente = new Date().getMonth();

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
  numeroGiorno = (new Date().getDate() < 10 ? "0" : "") + new Date().getDate();

const info = `&copy; 30 / Maggio / 2020 - ${numeroGiorno} / ${
  nomiMesi[numeroMeseCorrente]
} / ${new Date().getFullYear()} 
<br>Nico Maker Giri in Bici`;
document.getElementById("info").innerHTML = `<footer>${info}</footer>`;
