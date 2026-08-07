// ============================================================
// vista-periodi.js — Scheda "Periodi" (confronto fra ogni singolo
// periodo) della pagina Classifica dei mesi.
//
// Dati calcolati da History/classifica-mesi/calcoli.js
// (CM.calcolaPeriodi).
//
// Dipendenze: JS/json.js, History/classifica-mesi/calcoli.js,
//             History/classifica-mesi/podio/*.js,
//             assets/classifica-controlli.js
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  CM.avviaVistaPeriodi = async function () {
    const CC = window.ClassificaControlli;

    const listaPeriodiEl = document.getElementById("classifica-periodi");
    const titoloPeriodiEl = document.getElementById(
      "classifica-periodi-titolo",
    );
    const podioPeriodiEl = document.getElementById("podio-periodi");
    const selettorePeriodiStagioneEl = document.getElementById(
      "periodi-filtro-stagione",
    );

    const controlliPeriodi = CC.crea(
      document.getElementById("controlli-periodi"),
      {
        onCambia: () =>
          mostraPeriodi(
            selettorePeriodiStagioneEl ? selettorePeriodiStagioneEl.value : "",
          ),
      },
    );

    let mostraPeriodi = () => {};

    try {
      const { righe: righePeriodiComplete } = await CM.calcolaPeriodi();

      mostraPeriodi = function (stagioneScelta) {
        let righePerStagione = righePeriodiComplete;

        if (stagioneScelta) {
          righePerStagione = righePeriodiComplete
            .filter((r) => r.stagione === stagioneScelta)
            .map((r) => ({ ...r }));
          // Le percentuali verranno ricalcolate dopo il filtro
        }

        controlliPeriodi.aggiornaLimiti(righePerStagione.map((r) => r.km));
        const stato = controlliPeriodi.stato();
        const cercate = CC.cerca(
          righePerStagione,
          stato.testo,
          (r) => `${r.nome} ${r.periodo}`,
        );
        const filtrate = CC.filtra(cercate, stato, (r) => r.km);
        const totaleFiltrato = filtrate.reduce((tot, r) => tot + r.km, 0);
        // Ricalcola percentuali sul totale filtrato
        filtrate.forEach(r => {
          r.percentuale = totaleFiltrato > 0 ? (r.km / totaleFiltrato) * 100 : 0;
        });
        const ordinate = CC.ordina(
          filtrate,
          stato.ordine,
          (r) => r.km,
          (r) => parseInt(r.periodo, 10) || 0,
        );
        const perPodio = ordinate.slice(0, 3);
        const etichettaTotale = stagioneScelta
          ? `${filtrate.length} ${pluralizza(filtrate.length, "periodo", "periodi")} di ${stagioneScelta}`
          : `${filtrate.length} ${pluralizza(filtrate.length, "periodo", "periodi")}`;

        if (titoloPeriodiEl)
          titoloPeriodiEl.innerHTML = CM.creaTitoloPeriodi(
            perPodio,
            stato.ordine,
          );
        if (podioPeriodiEl)
          podioPeriodiEl.innerHTML = CM.creaPodioPeriodi(perPodio);
        if (listaPeriodiEl)
          listaPeriodiEl.innerHTML =
            CM.creaClassificaPeriodi(ordinate) +
            CM.creaRigaTotale(totaleFiltrato, etichettaTotale);
      };

      if (selettorePeriodiStagioneEl) {
        const stagioniPeriodiUniche = [
          ...new Set(righePeriodiComplete.map((r) => r.stagione)),
        ];
        stagioniPeriodiUniche.forEach((s) => {
          const opzione = document.createElement("option");
          opzione.value = s;
          opzione.textContent = s;
          selettorePeriodiStagioneEl.appendChild(opzione);
        });

        const parametriUrlPeriodi = new URLSearchParams(
          window.location.search,
        );
        const stagioneDaUrlPeriodi = parametriUrlPeriodi.get("stagione");
        if (
          stagioneDaUrlPeriodi &&
          stagioniPeriodiUniche.includes(stagioneDaUrlPeriodi)
        ) {
          selettorePeriodiStagioneEl.value = stagioneDaUrlPeriodi;
        }

        selettorePeriodiStagioneEl.addEventListener("change", () => {
          mostraPeriodi(selettorePeriodiStagioneEl.value);
        });

        mostraPeriodi(selettorePeriodiStagioneEl.value);
      } else {
        mostraPeriodi("");
      }
    } catch (error) {
      console.error(
        `Errore nel caricamento del confronto fra i periodi: ${error}`,
      );
      if (listaPeriodiEl)
        listaPeriodiEl.innerHTML =
          '<li class="errore-grafico">Non è stato possibile caricare il confronto fra i periodi.</li>';
    }
  };
})(window.ClassificaMesi);