// ============================================================
// vista-stagioni.js — Scheda "Stagioni"
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
      const totaleFiltrato = filtrate.reduce((tot, r) => tot + r.km, 0);
      filtrate.forEach((r) => {
        r.percentuale = totaleFiltrato > 0 ? (r.km / totaleFiltrato) * 100 : 0;
      });
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
      console.error(
        `Errore nel caricamento della classifica stagioni: ${error}`,
      );
      if (podioStagioniEl)
        podioStagioniEl.innerHTML =
          '<p class="errore-grafico">Non è stato possibile caricare la classifica delle stagioni.</p>';
    }
  };
})(window.ClassificaMesi);
