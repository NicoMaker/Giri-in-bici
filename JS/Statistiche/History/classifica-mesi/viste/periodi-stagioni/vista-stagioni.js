// ============================================================
// vista-stagioni.js — Scheda "Stagioni"
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  // Stesso principio delle altre schede: il testo sotto il titolo
  // descrive la direzione dell'ordinamento scelto in quel momento
  // (le Stagioni non hanno gli ordini per data, solo km e alfabetico).
  const TESTO_ORDINE_STAGIONI = {
    desc: "dal totale più alto al più basso",
    asc: "dal totale più basso al più alto",
    alfabetico: "in ordine alfabetico (A-Z)",
    "alfabetico-desc": "in ordine alfabetico (Z-A)",
  };

  CM.avviaVistaStagioni = async function () {
    const CC = window.ClassificaControlli;

    const podioStagioniEl = document.getElementById("podio-stagioni");
    const listaStagioniEl = document.getElementById("classifica-stagioni");
    const titoloStagioniEl = document.getElementById(
      "classifica-stagioni-titolo",
    );
    const heroStagioniEl = document.getElementById(
      "classifica-stagioni-hero-sub",
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
      const perPodio = CC.ordina(filtrate, stato.ordine, (r) => r.km, {
        nome: (r) => r.stagione,
        data: (r) => r.ordineCalendario || 0,
      });
      const etichettaTotale = `${filtrate.length} ${pluralizza(filtrate.length, "stagione", "stagioni")}`;
      if (titoloStagioniEl)
        titoloStagioniEl.innerHTML = CM.creaTitoloStagioni(
          perPodio,
          stato.ordine,
        );
      if (heroStagioniEl) {
        heroStagioniEl.textContent = `Ogni stagione, una per una, ${TESTO_ORDINE_STAGIONI[stato.ordine] || TESTO_ORDINE_STAGIONI.desc}.`;
      }
      if (podioStagioniEl)
        podioStagioniEl.innerHTML = CM.creaPodioStagioni(perPodio);
      if (listaStagioniEl)
        listaStagioniEl.innerHTML =
          CM.creaClassificaStagioni(perPodio) +
          CM.creaRigaTotale(totaleFiltrato, etichettaTotale);
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
