// ============================================================
// vista-mesi.js — Schede "Mesi", "Record" e "Anni"
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  // Stesso principio già usato per i Giri: il testo sotto al titolo di
  // ogni "Classifica completa" descrive la direzione dell'ordinamento
  // scelto in quel momento, non un ordine fisso deciso una volta per
  // tutte nell'HTML.
  const TESTO_ORDINE_MESI = {
    desc: "dal più al meno pedalato",
    asc: "dal meno al più pedalato",
    alfabetico: "in ordine alfabetico (A-Z)",
    "alfabetico-desc": "in ordine alfabetico (Z-A)",
    "data-recente": "dal più recente al meno recente",
    "data-vecchio": "dal meno recente al più recente",
    "media-desc": "per media più alta",
    "media-asc": "per media più bassa",
  };
  const TESTO_ORDINE_RECORD = TESTO_ORDINE_MESI;
  const TESTO_ORDINE_ANNI = {
    desc: "dal totale più alto al più basso",
    asc: "dal totale più basso al più alto",
    alfabetico: "in ordine alfabetico (A-Z)",
    "alfabetico-desc": "in ordine alfabetico (Z-A)",
    "data-recente": "dal più recente al meno recente",
    "data-vecchio": "dal meno recente al più recente",
    "media-desc": "per media km/corsa più alta",
    "media-asc": "per media km/corsa più bassa",
    "corse-desc": "dall'anno con più corse a quello con meno",
    "corse-asc": "dall'anno con meno corse a quello con più",
  };

  // Mantiene ferma la pagina dove si trova l'utente: quando i filtri
  // ridisegnano podio e classifica (cambiando l'altezza del contenuto)
  // il punto che si sta guardando resta nella stessa posizione sullo
  // schermo, senza salti verso l'alto o verso il basso.
  function conPosizione(ancora, ridisegna) {
    const el = ancora || document.body;
    const prima = el.getBoundingClientRect().top;
    ridisegna();
    const differenza = el.getBoundingClientRect().top - prima;
    if (differenza) window.scrollBy(0, differenza);
  }

  CM.avviaVistaMesi = async function () {
    const CC = window.ClassificaControlli;

    const podioEl = document.getElementById("podio");
    const listaEl = document.getElementById("classifica");
    const heroMesiEl = document.getElementById("classifica-mesi-hero-sub");
    const recordMesiEl = document.getElementById("record-mesi");
    const titoloRecordMesiEl = document.getElementById("record-mesi-titolo");
    const heroRecordEl = document.getElementById("record-mesi-hero-sub");
    const podioRecordMesiEl = document.getElementById("podio-record-mesi");
    const podioAnniEl = document.getElementById("podio-anni");
    const listaAnniEl = document.getElementById("classifica-anni");
    const titoloAnniEl = document.getElementById("classifica-anni-titolo");
    const heroAnniEl = document.getElementById("classifica-anni-hero-sub");
    const contenitoreRecordAnnoEl =
      document.getElementById("record-filtro-anno");
    // Ora si possono scegliere più anni insieme (prima un <select> con
    // una sola scelta): vedi assets/ui/filtro-multiplo.js.
    let filtroRecordAnno = null;
    // Filtro a scelta multipla anche per i MESI (Gennaio, Febbraio...):
    // nessun mese scelto = tutti i mesi. Vedi assets/ui/filtro-multiplo.js.
    const contenitoreRecordMeseEl =
      document.getElementById("record-filtro-mese");
    let filtroRecordMese = null;
    const anniScelti = () =>
      filtroRecordAnno ? filtroRecordAnno.selezionati() : [];
    const mesiScelti = () =>
      filtroRecordMese ? filtroRecordMese.selezionati() : [];

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
      if (heroMesiEl) {
        heroMesiEl.textContent = `La classifica intera dei dodici mesi, uno sotto l'altro, ${TESTO_ORDINE_MESI[stato.ordine] || TESTO_ORDINE_MESI.desc}.`;
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
      // Filtro km sempre sui km totali; con "Media più alta/bassa"
      // si ordina invece per media = km / corse (r.kmMedi).
      const perMedia =
        stato.ordine === "media-desc" || stato.ordine === "media-asc";
      const perCorse =
        stato.ordine === "corse-desc" || stato.ordine === "corse-asc";
      const ordinate = CC.ordina(
        filtrate,
        stato.ordine,
        (r) => (perMedia ? r.kmMedi : perCorse ? r.corse : r.km),
        {
          spareggio: (r) => Number(r.anno) || 0,
          nome: (r) => r.nome,
          data: (r) => Number(r.anno) || 0,
        },
      );
      const perPodio = ordinate.slice(0, 3);

      if (titoloAnniEl)
        titoloAnniEl.innerHTML = CM.creaTitoloAnni(perPodio, stato.ordine);
      if (heroAnniEl) {
        heroAnniEl.textContent = `Tutti gli anni pedalati finora, uno sotto l'altro, ${TESTO_ORDINE_ANNI[stato.ordine] || TESTO_ORDINE_ANNI.desc}.`;
      }
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
      onCambia: () =>
        conPosizione(document.getElementById("controlli-mesi"), disegnaMesi),
    });
    const controlliRecord = CC.crea(
      document.getElementById("controlli-record"),
      {
        onCambia: () =>
          conPosizione(document.getElementById("controlli-record"), () =>
            mostraRecord(anniScelti(), mesiScelti()),
          ),
      },
    );
    const controlliAnni = CC.crea(document.getElementById("controlli-anni"), {
      onCambia: () =>
        conPosizione(document.getElementById("controlli-anni"), disegnaAnni),
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

      mostraRecord = function (anniSelezionati, mesiSelezionati) {
        anniSelezionati = anniSelezionati || [];
        mesiSelezionati = mesiSelezionati || [];
        let righeAnnoScelto = righeRecordTutti;

        // Filtro per MESE: tiene solo i mesi scelti (di qualunque anno
        // fra quelli selezionati). Poi podio e classifica mostrano solo
        // i km maggiori di quei mesi.
        if (mesiSelezionati.length) {
          righeAnnoScelto = righeAnnoScelto.filter((r) =>
            mesiSelezionati.includes(r.mese),
          );
        }

        if (anniSelezionati.length) {
          // Con un solo anno scelto il nome resta il solo mese (come
          // prima: l'anno è già ovvio). Con più anni insieme, invece,
          // due "Gennaio" di anni diversi si confonderebbero: l'anno
          // va aggiunto al nome per distinguerli nel podio e in lista.
          const piuDiUnAnno = anniSelezionati.length > 1;
          righeAnnoScelto = righeAnnoScelto
            .filter((r) => anniSelezionati.includes(String(r.anno)))
            .map((r) => ({
              ...r,
              nome: piuDiUnAnno ? `${r.mese} ${r.anno}` : r.mese,
            }));
        }

        if (anniSelezionati.length || mesiSelezionati.length) {
          const totaleScelto = righeAnnoScelto.reduce(
            (tot, r) => tot + r.km,
            0,
          );
          righeAnnoScelto = righeAnnoScelto.map((r) => ({
            ...r,
            percentuale: totaleScelto > 0 ? (r.km / totaleScelto) * 100 : 0,
          }));
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
        // Etichetta semplice: sempre e solo "N mesi".
        const etichettaTotale = `${filtrate.length} ${pluralizza(filtrate.length, "mese", "mesi")}`;

        if (titoloRecordMesiEl)
          titoloRecordMesiEl.innerHTML = CM.creaTitoloRecordMesi(
            perPodio,
            stato.ordine,
          );
        if (heroRecordEl) {
          heroRecordEl.textContent = `Ogni mese di ogni anno preso singolarmente, ${TESTO_ORDINE_RECORD[stato.ordine] || TESTO_ORDINE_RECORD.desc}: non la somma dei vari mesi, ma ogni edizione a sé.`;
        }
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
          onCambia: (anni) =>
            conPosizione(contenitoreRecordAnnoEl, () =>
              mostraRecord(anni, mesiScelti()),
            ),
        });
        filtroRecordAnno.imposta(
          anniRecordUnici.map((a) => ({ value: a, label: a })),
          { preselezionati: anniDaUrl },
        );

        // Filtro MESI: Gennaio, Febbraio... (nomi, non numeri).
        // Si può anche preselezionare da URL: "?mese=Gennaio,Febbraio".
        if (contenitoreRecordMeseEl) {
          const mesiDaUrl = (
            new URLSearchParams(window.location.search).get("mese") || ""
          )
            .split(",")
            .map((m) => m.trim())
            .filter((m) => ConfigMesi.elenco.includes(m));

          filtroRecordMese = window.FiltroMultiplo.crea(
            contenitoreRecordMeseEl,
            {
              etichetta: "Mese",
              tutte: "Tutti i mesi",
              onCambia: (mesi) =>
                conPosizione(contenitoreRecordMeseEl, () =>
                  mostraRecord(anniScelti(), mesi),
                ),
            },
          );
          filtroRecordMese.imposta(
            ConfigMesi.elenco.map((m) => ({ value: m, label: m })),
            { preselezionati: mesiDaUrl },
          );
        }

        mostraRecord(anniScelti(), mesiScelti());
      } else {
        mostraRecord([], []);
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
