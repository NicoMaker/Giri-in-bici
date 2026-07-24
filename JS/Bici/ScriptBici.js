// ============================================================
// ScriptBici.js — Avvio del catalogo delle bici
//
// Legge bici.json, mette i dati a disposizione dei componenti
// in Bici/js/ e li richiama:
//   schede.js  HTML delle bici e delle intestazioni
//   vista.js   cosa mostrare nel riquadro
//   filtri.js  barra delle categorie
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  const B = window.Bici;

  Json.leggi("bici.json")
    .then((data) => {
      B.dati = data;
      B.contenitore = document.getElementById("StampaBici");

      window.CalcolaMTB = () => B.mostraBiciFiltrate("mtb");
      window.CalcolaCorsa = () => B.mostraBiciFiltrate("corsa");
      window.CalcolaTutte = () => B.mostraBiciFiltrate("tutte");
      window.Home = B.mostraHome;

      B.collegaBarra();

      // All'avvio mostra la Madonnina in Bici, non subito tutto il catalogo
      B.mostraHome();
    })
    .catch((error) => console.error("Errore nel caricamento del JSON:", error));
});
