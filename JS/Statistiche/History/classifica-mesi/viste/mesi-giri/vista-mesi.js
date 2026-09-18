// ============================================================
// vista-mesi.js — Schede "Mesi", "Record" e "Anni"
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  CM.avviaVistaMesi = async function () {
    const CC = window.ClassificaControlli;

    const podioEl = document.getElementById("podio");
    const listaEl = document.getElementById("classifica");
    const recordMesiEl = document.getElementById("record-mesi");
    const titoloRecordMesiEl = document.getElementById("record-mesi-titolo");
    const podioRecordMesiEl = document.getElementById("podio-record-mesi");
    const podioAnniEl = document.getElementById("podio-anni");
    const listaAnniEl = document.getElementById("classifica-anni");
    const titoloAnniEl = document.getElementById("classifica-anni-titolo");
    const contenitoreRecordAnnoEl = document.getElementById("record-filtro-anno");
    // Ora si possono scegliere più anni insieme (prima un <select> con
    // una sola scelta): vedi assets/ui/filtro-multiplo.js.
    let filtroRecordAnno = null;

    let righeMesi = [];
    let righeAnniComplete = [];
    let totaleAnniGlobale = 0;
    let mostraRecord = () => {};

    function disegnaMesi() {
      const stato = controlliMesi.stato();
      const cercate = CC.cerca(righeMesi, stato.testo, (r) => r.mese);
      // Il filtro per km si applica sempre sui km totali (non sulla media)
      const filtrate = CC.filtra(cercate, stato, (r) => r.km);
      const totaleFiltrato = filtrate.reduce((tot, r) => tot + r.km, 0);
      filtrate.forEach((r) => {
        r.percentuale = totaleFiltrato > 0 ? (r.km / totaleFiltrato) * 100 : 0;
      });
      // Ordina: per media usiamo il valore kmMedi, per gli altri usiamo km
      const ordinate = CC.ordina(
        filtrate,
        stato.ordine,
        (r) => {
          // se l'ordine è media-desc o media-asc, usiamo kmMedi
          if (stato.ordine === "media-desc" || stato.ordine === "media-asc") {
            return r.kmMedi;
          }
          return r.km;
        },
        {
          spareggio: (r) => ConfigMesi.ordine[r.mese] || 0,
          nome: (r) => r.mese,
          data: (r) => ConfigMesi.ordine[r.mese] || 0,
        },
      );
      const perPodio = ordinate.slice(0, 3);

      if (podioEl)
        podioEl.innerHTML = CM.creaPodio(perPodio, totaleAnniGlobale);
      if (listaEl) {
        listaEl.innerHTML =
          CM.creaClassifica(ordinate) +
          CM.creaRigaTotale(
            totaleFiltrato,
            `${filtrate.length} ${pluralizza(filtrate.length, "mese", "mesi")}`,
          );
      }
      // Aggiorna il titolo (ora in podio/mesi.js gestisce i nuovi ordini)
      const titoloEl = document.getElementById("classifica-titolo");
      if (titoloEl) {
        titoloEl.innerHTML = CM.creaTitolo(perPodio, stato.ordine);
      }
    }

    function disegnaAnni() {
      const stato = controlliAnni.stato();
      const cercate = CC.cerca(righeAnniComplete, stato.testo, (r) => r.nome);
      const filtrate = CC.filtra(cercate, stato, (r) => r.km);
      const totaleFiltrato = filtrate.reduce((tot, r) => tot + r.km, 0);
      filtrate.forEach((r) => {
        r.percentuale = totaleFiltrato > 0 ? (r.km / totaleFiltrato) * 100 : 0;
      });
      const ordinate = CC.ordina(filtrate, stato.ordine, (r) => r.km, {
        spareggio: (r) => Number(r.anno) || 0,
        nome: (r) => r.nome,
        data: (r) => Number(r.anno) || 0,
      });
      const perPodio = ordinate.slice(0, 3);

      if (titoloAnniEl)
        titoloAnniEl.innerHTML = CM.creaTitoloAnni(perPodio, stato.ordine);
      if (podioAnniEl) podioAnniEl.innerHTML = CM.creaPodioAnni(perPodio);
      if (listaAnniEl) {
        listaAnniEl.innerHTML =
          CM.creaClassificaAnni(ordinate) +
          CM.creaRigaTotale(
            totaleFiltrato,
            `${filtrate.length} ${pluralizza(filtrate.length, "anno", "anni")}`,
          );
      }
    }

    const controlliMesi = CC.crea(document.getElementById("controlli-mesi"), {
      onCambia: () => disegnaMesi(),
    });
    const controlliRecord = CC.crea(
      document.getElementById("controlli-record"),
      {
        onCambia: () =>
          mostraRecord(filtroRecordAnno ? filtroRecordAnno.selezionati() : []),
      },
    );
    const controlliAnni = CC.crea(document.getElementById("controlli-anni"), {
      onCambia: () => disegnaAnni(),
    });

    try {
      await ConfigMesi.carica();

      const storico = await fetchJSON("json/Statistiche/History/Storico.json");
      if (!storico || !storico.anni) {
        console.error("Struttura anni mancante");
        return;
      }

      const percorsi = Object.values(storico.anni);
      totaleAnniGlobale = percorsi.length;
      const allData = await Json.leggiTutti(percorsi);

      const { righe } = CM.calcolaClassifica(allData, ConfigMesi.elenco);
      righeMesi = righe;
      const { righe: righeRecordTutti } = CM.calcolaRecordMesi(
        allData,
        ConfigMesi.elenco,
      );

      const annoFiltro = new URLSearchParams(window.location.search).get(
        "anno",
      );

      controlliMesi.aggiornaLimiti(righeMesi.map((r) => r.km));
      disegnaMesi();

      mostraRecord = function (anniSelezionati) {
        anniSelezionati = anniSelezionati || [];
        let righeAnnoScelto = righeRecordTutti;

        if (anniSelezionati.length) {
          // Con un solo anno scelto il nome resta il solo mese (come
          // prima: l'anno è già ovvio). Con più anni insieme, invece,
          // due "Gennaio" di anni diversi si confonderebbero: l'anno
          // va aggiunto al nome per distinguerli nel podio e in lista.
          const piuDiUnAnno = anniSelezionati.length > 1;
          righeAnnoScelto = righeRecordTutti
            .filter((r) => anniSelezionati.includes(String(r.anno)))
            .map((r) => ({
              ...r,
              nome: piuDiUnAnno ? `${r.mese} ${r.anno}` : r.mese,
            }));
          const totaleAnno = righeAnnoScelto.reduce((tot, r) => tot + r.km, 0);
          righeAnnoScelto.forEach((r) => {
            r.percentuale = totaleAnno > 0 ? (r.km / totaleAnno) * 100 : 0;
          });
        }

        controlliRecord.aggiornaLimiti(righeAnnoScelto.map((r) => r.km));
        const stato = controlliRecord.stato();
        const cercate = CC.cerca(righeAnnoScelto, stato.testo, (r) => r.nome);
        const filtrate = CC.filtra(cercate, stato, (r) => r.km);
        const totaleFiltrato = filtrate.reduce((tot, r) => tot + r.km, 0);
        filtrate.forEach((r) => {
          r.percentuale =
            totaleFiltrato > 0 ? (r.km / totaleFiltrato) * 100 : 0;
        });
        const dataRecordDi = (r) =>
          (Number(r.anno) || 0) * 100 + (ConfigMesi.ordine[r.mese] || 0);
        const ordinate = CC.ordina(filtrate, stato.ordine, (r) => r.km, {
          spareggio: dataRecordDi,
          nome: (r) => r.nome,
          data: dataRecordDi,
        });
        const perPodio = ordinate.slice(0, 3);
        let etichettaTotale;
        if (!anniSelezionati.length) {
          etichettaTotale = `${filtrate.length} record`;
        } else if (anniSelezionati.length === 1) {
          etichettaTotale = `${filtrate.length} ${pluralizza(filtrate.length, "mese", "mesi")} del ${anniSelezionati[0]}`;
        } else {
          etichettaTotale = `${filtrate.length} ${pluralizza(filtrate.length, "mese", "mesi")} (${anniSelezionati.join(", ")})`;
        }

        if (titoloRecordMesiEl)
          titoloRecordMesiEl.innerHTML = CM.creaTitoloRecordMesi(
            perPodio,
            stato.ordine,
          );
        if (podioRecordMesiEl)
          podioRecordMesiEl.innerHTML = CM.creaPodioSemplice(perPodio);
        if (recordMesiEl)
          recordMesiEl.innerHTML =
            CM.creaRecordMesi(ordinate) +
            CM.creaRigaTotale(totaleFiltrato, etichettaTotale);
      };

      if (contenitoreRecordAnnoEl && window.FiltroMultiplo) {
        const anniRecordUnici = [
          ...new Set(righeRecordTutti.map((r) => String(r.anno))),
        ].sort((a, b) => b.localeCompare(a));

        // Il vecchio parametro ?anno= nell'URL restava un valore solo;
        // ora accetta anche più anni separati da virgola (es.
        // "?anno=2021,2023"), restando comunque compatibile con un
        // singolo anno scritto come prima.
        // Senza "?anno=" nell'indirizzo si parte con TUTTI gli anni già
        // selezionati automaticamente (uno per uno, non "in blocco"),
        // così la scheda Record mostra subito i record anno per anno.
        const anniDaUrl = annoFiltro
          ? annoFiltro
              .split(",")
              .map((a) => a.trim())
              .filter((a) => anniRecordUnici.includes(a))
          : anniRecordUnici;

        filtroRecordAnno = window.FiltroMultiplo.crea(contenitoreRecordAnnoEl, {
          etichetta: "Anno",
          tutte: "Tutti gli anni insieme",
          onCambia: (anni) => mostraRecord(anni),
        });
        filtroRecordAnno.imposta(
          anniRecordUnici.map((a) => ({ value: a, label: a })),
          { preselezionati: anniDaUrl },
        );

        mostraRecord(filtroRecordAnno.selezionati());
      } else {
        mostraRecord([]);
      }

      const { righe: righeAnni } = CM.calcolaAnni(allData);
      righeAnniComplete = righeAnni;
      controlliAnni.aggiornaLimiti(righeAnniComplete.map((r) => r.km));
      disegnaAnni();
    } catch (error) {
      console.error(`Errore nel caricamento della classifica: ${error}`);
      if (listaEl)
        listaEl.innerHTML =
          '<li class="errore-grafico">Non è stato possibile caricare la classifica dei mesi.</li>';
      if (recordMesiEl)
        recordMesiEl.innerHTML =
          '<li class="errore-grafico">Non è stato possibile caricare i record mese per mese.</li>';
      if (listaAnniEl)
        listaAnniEl.innerHTML =
          '<li class="errore-grafico">Non è stato possibile caricare la classifica degli anni.</li>';
    }
  };
})(window.ClassificaMesi);
