// ============================================================
// classifica-mesi.js — Avvio della pagina Classifica dei mesi
//
// Solo l'avvio. I pezzi stanno in History/classifica-mesi/:
//   calcoli.js   somma i chilometri di ogni mese su tutti gli anni
//   podio.js     podio dei primi tre (mesi, stagioni, record e
//                periodi) e classifiche complete
//   stagioni.js  somma i chilometri di ogni stagione su tutti gli anni
// L'ordine dei mesi arriva da History/comune/config-mesi.js
//
// Il selettore in cima alla pagina (#selettore-vista) mostra o
// nasconde i gruppi [data-vista-gruppo] della pagina: non serve
// nessun dato, funziona anche prima che i fetch qui sotto finiscano.
//
// Dati letti da json/Statistiche/History/Storico.json (mesi, stessa
// fonte già usata da Statistiche Totali, Statistiche Mensili e
// Storico Mensile) e da json/Statistiche/anni/stagioni/stagioni.json
// (stagioni, stessa fonte di Statistiche/stagioni.html), così la
// classifica resta sempre coerente col resto della sezione.
//
// Dipendenze: JS/json.js, JS/utils.js, History/comune/config-mesi.js,
//             History/classifica-mesi/calcoli.js,
//             History/classifica-mesi/stagioni.js,
//             History/classifica-mesi/podio.js
// ============================================================

const CM = window.ClassificaMesi;

document.addEventListener("DOMContentLoaded", async () => {
  // ---------- Selettore in cima: cosa mostrare ----------
  // Indipendente dal caricamento dei dati: funziona subito, anche se
  // il fetch qui sotto è ancora in corso o fallisce.
  //
  // La vista iniziale arriva da "?vista=" nell'indirizzo: ogni pagina
  // del sito che porta qui sceglie già la scheda giusta (es. dalla
  // pagina di una stagione arriva "?vista=stagioni"). Senza il
  // parametro, o con un valore che non esiste, si parte da "mesi".
  const VISTE_VALIDE = ["mesi", "record", "anni", "stagioni", "periodi"];
  const gruppiVista = document.querySelectorAll("[data-vista-gruppo]");
  const pulsantiVista = document.querySelectorAll(
    "#selettore-vista .selettore-metrica__pulsante",
  );

  function attivaVista(vista) {
    pulsantiVista.forEach((p) =>
      p.classList.toggle("attivo", p.dataset.vista === vista),
    );
    gruppiVista.forEach((gruppo) => {
      gruppo.style.display = gruppo.dataset.vistaGruppo === vista ? "" : "none";
    });
  }

  const vistaIniziale = new URLSearchParams(window.location.search).get(
    "vista",
  );
  attivaVista(VISTE_VALIDE.includes(vistaIniziale) ? vistaIniziale : "mesi");

  pulsantiVista.forEach((pulsante) => {
    pulsante.addEventListener("click", () =>
      attivaVista(pulsante.dataset.vista),
    );
  });

  const podioEl = document.getElementById("podio");
  const listaEl = document.getElementById("classifica");
  const titoloEl = document.getElementById("classifica-titolo");
  const podioStagioniEl = document.getElementById("podio-stagioni");
  const titoloStagioniEl = document.getElementById(
    "classifica-stagioni-titolo",
  );
  const listaPeriodiEl = document.getElementById("classifica-periodi");
  const titoloPeriodiEl = document.getElementById("classifica-periodi-titolo");
  const podioPeriodiEl = document.getElementById("podio-periodi");
  const recordMesiEl = document.getElementById("record-mesi");
  const titoloRecordMesiEl = document.getElementById("record-mesi-titolo");
  const podioRecordMesiEl = document.getElementById("podio-record-mesi");
  const podioAnniEl = document.getElementById("podio-anni");
  const listaAnniEl = document.getElementById("classifica-anni");
  const titoloAnniEl = document.getElementById("classifica-anni-titolo");

  try {
    await ConfigMesi.carica();

    const storico = await fetchJSON("json/Statistiche/History/Storico.json");
    if (!storico || !storico.anni) {
      console.error("Struttura anni mancante");
      return;
    }

    const percorsi = Object.values(storico.anni);
    const totaleAnni = percorsi.length;
    const allData = await Json.leggiTutti(percorsi);

    const { righe, totale } = CM.calcolaClassifica(allData, ConfigMesi.elenco);
    const { righe: righeRecordTutti, totale: totaleRecordTutti } =
      CM.calcolaRecordMesi(allData, ConfigMesi.elenco);

    // Se si arriva da una singola pagina-anno (Statistiche/Anni/2020.html
    // ecc. con "?anno=2020"), il record per anno si restringe a quel
    // solo anno: percentuali ricalcolate su quel sottoinsieme, non sul
    // totale di sempre, e l'etichetta della scheda lo dice chiaramente.
    const annoFiltro = new URLSearchParams(window.location.search).get("anno");
    const filtratoPerAnno =
      annoFiltro && righeRecordTutti.some((r) => String(r.anno) === annoFiltro);

    let righeRecord = righeRecordTutti;
    let totaleRecord = totaleRecordTutti;

    if (filtratoPerAnno) {
      righeRecord = righeRecordTutti
        .filter((r) => String(r.anno) === annoFiltro)
        .map((r) => ({ ...r }));
      totaleRecord = righeRecord.reduce((tot, r) => tot + r.km, 0);
      righeRecord.forEach((r) => {
        r.percentuale = totaleRecord > 0 ? (r.km / totaleRecord) * 100 : 0;
      });

      const pulsanteRecord = document.querySelector(
        '#selettore-vista .selettore-metrica__pulsante[data-vista="record"]',
      );
      if (pulsanteRecord) pulsanteRecord.textContent = `Mesi ${annoFiltro}`;

      const intestazioniRecord = document.querySelectorAll(
        '[data-vista-gruppo="record"] h2',
      );
      if (intestazioniRecord[0])
        intestazioniRecord[0].textContent = `I mesi migliori del ${annoFiltro}`;
      if (intestazioniRecord[1])
        intestazioniRecord[1].textContent = `Tutti i mesi del ${annoFiltro}`;

      const notaRecordEl = document.getElementById("record-mesi-nota");
      if (notaRecordEl) {
        notaRecordEl.innerHTML = `
          Solo l'anno ${annoFiltro}, uno o due mesi alla volta.
          <a href="ClassificaMesi.html?vista=record">Vedi tutti gli anni insieme</a>.`;
      }
    }

    if (titoloEl) titoloEl.innerHTML = CM.creaTitolo(righe);
    if (podioEl) podioEl.innerHTML = CM.creaPodio(righe, totaleAnni);
    if (listaEl)
      listaEl.innerHTML =
        CM.creaClassifica(righe) + CM.creaRigaTotale(totale, "12 mesi");
    if (titoloRecordMesiEl)
      titoloRecordMesiEl.innerHTML = CM.creaTitoloRecordMesi(righeRecord);
    if (podioRecordMesiEl)
      podioRecordMesiEl.innerHTML = CM.creaPodioSemplice(righeRecord);
    if (recordMesiEl)
      recordMesiEl.innerHTML =
        CM.creaRecordMesi(righeRecord) +
        CM.creaRigaTotale(
          totaleRecord,
          filtratoPerAnno
            ? `mesi del ${annoFiltro}`
            : `${righeRecord.length} record`,
        );

    const { righe: righeAnni, totale: totaleAnniKm } = CM.calcolaAnni(allData);
    if (titoloAnniEl) titoloAnniEl.innerHTML = CM.creaTitoloAnni(righeAnni);
    if (podioAnniEl) podioAnniEl.innerHTML = CM.creaPodioSemplice(righeAnni);
    if (listaAnniEl)
      listaAnniEl.innerHTML =
        CM.creaClassificaAnni(righeAnni) +
        CM.creaRigaTotale(totaleAnniKm, `${righeAnni.length} anni`);
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

  try {
    const righeStagioni = await CM.calcolaStagioni();
    if (titoloStagioniEl)
      titoloStagioniEl.innerHTML = CM.creaTitoloStagioni(righeStagioni);
    if (podioStagioniEl)
      podioStagioniEl.innerHTML = CM.creaPodioStagioni(righeStagioni);
  } catch (error) {
    console.error(`Errore nel caricamento della classifica stagioni: ${error}`);
    if (podioStagioniEl)
      podioStagioniEl.innerHTML =
        '<p class="errore-grafico">Non è stato possibile caricare la classifica delle stagioni.</p>';
  }

  try {
    const { righe: righePeriodi, totale: totalePeriodi } =
      await CM.calcolaPeriodi();
    if (titoloPeriodiEl)
      titoloPeriodiEl.innerHTML = CM.creaTitoloPeriodi(righePeriodi);
    if (podioPeriodiEl)
      podioPeriodiEl.innerHTML = CM.creaPodioSemplice(righePeriodi);
    if (listaPeriodiEl)
      listaPeriodiEl.innerHTML =
        CM.creaClassificaPeriodi(righePeriodi) +
        CM.creaRigaTotale(totalePeriodi, `${righePeriodi.length} periodi`);
  } catch (error) {
    console.error(
      `Errore nel caricamento del confronto fra i periodi: ${error}`,
    );
    if (listaPeriodiEl)
      listaPeriodiEl.innerHTML =
        '<li class="errore-grafico">Non è stato possibile caricare il confronto fra i periodi.</li>';
  }
});
