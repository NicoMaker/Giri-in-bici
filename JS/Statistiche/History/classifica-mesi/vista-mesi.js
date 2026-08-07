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
    const selettoreRecordAnnoEl = document.getElementById("record-filtro-anno");

    let righeMesi = [];
    let righeAnniComplete = [];
    let totaleAnniGlobale = 0;
    let mostraRecord = () => {};

    function disegnaMesi() {
      const stato = controlliMesi.stato();
      const cercate = CC.cerca(righeMesi, stato.testo, (r) => r.mese);
      const filtrate = CC.filtra(cercate, stato, (r) => r.km);
      const totaleFiltrato = filtrate.reduce((tot, r) => tot + r.km, 0);
      filtrate.forEach((r) => {
        r.percentuale = totaleFiltrato > 0 ? (r.km / totaleFiltrato) * 100 : 0;
      });
      const ordinate = CC.ordina(
        filtrate,
        stato.ordine,
        (r) => r.km,
        (r) => ConfigMesi.ordine[r.mese] || 0,
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
    }

    function disegnaAnni() {
      const stato = controlliAnni.stato();
      const cercate = CC.cerca(righeAnniComplete, stato.testo, (r) => r.nome);
      const filtrate = CC.filtra(cercate, stato, (r) => r.km);
      const totaleFiltrato = filtrate.reduce((tot, r) => tot + r.km, 0);
      filtrate.forEach((r) => {
        r.percentuale = totaleFiltrato > 0 ? (r.km / totaleFiltrato) * 100 : 0;
      });
      const ordinate = CC.ordina(
        filtrate,
        stato.ordine,
        (r) => r.km,
        (r) => Number(r.anno) || 0,
      );
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
          mostraRecord(
            selettoreRecordAnnoEl ? selettoreRecordAnnoEl.value : "",
          ),
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

      mostraRecord = function (annoSelezionato) {
        let righeAnnoScelto = righeRecordTutti;

        if (annoSelezionato) {
          righeAnnoScelto = righeRecordTutti
            .filter((r) => String(r.anno) === annoSelezionato)
            .map((r) => ({ ...r, nome: r.mese }));
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
        const ordinate = CC.ordina(
          filtrate,
          stato.ordine,
          (r) => r.km,
          (r) => (Number(r.anno) || 0) * 100 + (ConfigMesi.ordine[r.mese] || 0),
        );
        const perPodio = ordinate.slice(0, 3);
        const etichettaTotale = annoSelezionato
          ? `${filtrate.length} ${pluralizza(filtrate.length, "mese", "mesi")} del ${annoSelezionato}`
          : `${filtrate.length} record`;

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

      if (selettoreRecordAnnoEl) {
        const anniRecordUnici = [
          ...new Set(righeRecordTutti.map((r) => String(r.anno))),
        ].sort((a, b) => b.localeCompare(a));
        anniRecordUnici.forEach((a) => {
          const opzione = document.createElement("option");
          opzione.value = a;
          opzione.textContent = a;
          selettoreRecordAnnoEl.appendChild(opzione);
        });

        if (annoFiltro && anniRecordUnici.includes(annoFiltro)) {
          selettoreRecordAnnoEl.value = annoFiltro;
        }

        selettoreRecordAnnoEl.addEventListener("change", () => {
          mostraRecord(selettoreRecordAnnoEl.value);
        });

        mostraRecord(selettoreRecordAnnoEl.value);
      } else {
        mostraRecord("");
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
