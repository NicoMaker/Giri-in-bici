// ============================================================
// vista-periodi.js — Scheda "Periodi"
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
    const contenitorePeriodiStagioneEl = document.getElementById(
      "periodi-filtro-stagione",
    );
    // Ora si possono scegliere più stagioni insieme (prima un <select>
    // con una sola scelta): vedi assets/ui/filtro-multiplo.js.
    let filtroPeriodiStagione = null;

    const controlliPeriodi = CC.crea(
      document.getElementById("controlli-periodi"),
      {
        onCambia: () =>
          mostraPeriodi(
            filtroPeriodiStagione ? filtroPeriodiStagione.selezionati() : [],
          ),
      },
    );

    let mostraPeriodi = () => {};

    try {
      const { righe: righePeriodiComplete } = await CM.calcolaPeriodi();

      mostraPeriodi = function (stagioniScelte) {
        stagioniScelte = stagioniScelte || [];
        let righePerStagione = righePeriodiComplete;

        if (stagioniScelte.length) {
          righePerStagione = righePeriodiComplete
            .filter((r) => stagioniScelte.includes(r.stagione))
            .map((r) => ({ ...r }));
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
        filtrate.forEach((r) => {
          r.percentuale =
            totaleFiltrato > 0 ? (r.km / totaleFiltrato) * 100 : 0;
        });
        const dataPeriodoDi = (r) => r.ordineCronologico || 0;
        const ordinate = CC.ordina(filtrate, stato.ordine, (r) => r.km, {
          spareggio: dataPeriodoDi,
          nome: (r) => r.nome,
          data: dataPeriodoDi,
        });
        const perPodio = ordinate.slice(0, 3);
        const etichettaTotale = stagioniScelte.length
          ? `${filtrate.length} ${pluralizza(filtrate.length, "periodo", "periodi")} di ${stagioniScelte.join(", ")}`
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

      if (contenitorePeriodiStagioneEl && window.FiltroMultiplo) {
        const stagioniPeriodiUniche = [
          ...new Set(righePeriodiComplete.map((r) => r.stagione)),
        ];

        // Come per "Km mensili": ?stagione= accetta ora anche più
        // stagioni separate da virgola, restando compatibile con una
        // sola stagione scritta come prima.
        // Senza "?stagione=" nell'indirizzo si parte con TUTTE le
        // stagioni già selezionate automaticamente.
        const parametriUrlPeriodi = new URLSearchParams(window.location.search);
        const stagioneUrlGrezzaPeriodi = parametriUrlPeriodi.get("stagione");
        const stagioniDaUrlPeriodi = stagioneUrlGrezzaPeriodi
          ? stagioneUrlGrezzaPeriodi
              .split(",")
              .map((s) => s.trim())
              .filter((s) => stagioniPeriodiUniche.includes(s))
          : stagioniPeriodiUniche;

        filtroPeriodiStagione = window.FiltroMultiplo.crea(
          contenitorePeriodiStagioneEl,
          {
            etichetta: "Stagione",
            tutte: "Tutte",
            onCambia: (stagioni) => mostraPeriodi(stagioni),
          },
        );
        filtroPeriodiStagione.imposta(
          stagioniPeriodiUniche.map((s) => ({ value: s, label: s })),
          { preselezionati: stagioniDaUrlPeriodi },
        );

        mostraPeriodi(filtroPeriodiStagione.selezionati());
      } else {
        mostraPeriodi([]);
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
