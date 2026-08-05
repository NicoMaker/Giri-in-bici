// ============================================================
// vista-stagioni.js — Scheda "Stagioni" della pagina Classifica
// dei mesi.
//
// Dati letti da json/Statistiche/anni/stagioni/stagioni.json (stessa
// fonte di Statistiche/stagioni.html), tramite
// History/classifica-mesi/calcoli.js (CM.calcolaStagioni).
//
// Dipendenze: JS/json.js, History/classifica-mesi/calcoli.js,
//             History/classifica-mesi/podio/*.js,
//             assets/classifica-controlli.js
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  CM.avviaVistaStagioni = async function () {
    const CC = window.ClassificaControlli;

    const podioStagioniEl = document.getElementById("podio-stagioni");
    const titoloStagioniEl = document.getElementById(
      "classifica-stagioni-titolo",
    );

    let righeStagioniComplete = [];

    function disegnaStagioni() {
      const stato = controlliStagioni.stato();
      const cercate = CC.cerca(
        righeStagioniComplete,
        stato.testo,
        (r) => r.stagione,
      );
      const filtrate = CC.filtra(cercate, stato, (r) => r.km);
      const perPodio = CC.ordina(filtrate, stato.ordine, (r) => r.km);
      if (titoloStagioniEl)
        titoloStagioniEl.innerHTML = CM.creaTitoloStagioni(
          perPodio,
          stato.ordine,
        );
      if (podioStagioniEl)
        podioStagioniEl.innerHTML = CM.creaPodioStagioni(perPodio);
    }

    const controlliStagioni = CC.crea(
      document.getElementById("controlli-stagioni"),
      {
        onCambia: () => disegnaStagioni(),
      },
    );

    try {
      righeStagioniComplete = await CM.calcolaStagioni();
      controlliStagioni.aggiornaLimiti(righeStagioniComplete.map((r) => r.km));
      disegnaStagioni();
    } catch (error) {
      console.error(`Errore nel caricamento della classifica stagioni: ${error}`);
      if (podioStagioniEl)
        podioStagioniEl.innerHTML =
          '<p class="errore-grafico">Non è stato possibile caricare la classifica delle stagioni.</p>';
    }
  };
})(window.ClassificaMesi);
