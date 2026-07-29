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
  // parametro, o con un valore che non esiste, si parte da "tutto".
  const VISTE_VALIDE = ["tutto", "mesi", "record", "stagioni", "periodi"];
  const gruppiVista = document.querySelectorAll("[data-vista-gruppo]");
  const pulsantiVista = document.querySelectorAll(
    "#selettore-vista .selettore-metrica__pulsante",
  );

  function attivaVista(vista) {
    pulsantiVista.forEach((p) =>
      p.classList.toggle("attivo", p.dataset.vista === vista),
    );
    gruppiVista.forEach((gruppo) => {
      const mostra = vista === "tutto" || gruppo.dataset.vistaGruppo === vista;
      gruppo.style.display = mostra ? "" : "none";
    });
  }

  const vistaIniziale = new URLSearchParams(window.location.search).get(
    "vista",
  );
  attivaVista(VISTE_VALIDE.includes(vistaIniziale) ? vistaIniziale : "tutto");

  pulsantiVista.forEach((pulsante) => {
    pulsante.addEventListener("click", () => attivaVista(pulsante.dataset.vista));
  });

  const podioEl = document.getElementById("podio");
  const listaEl = document.getElementById("classifica");
  const titoloEl = document.getElementById("classifica-titolo");
  const podioStagioniEl = document.getElementById("podio-stagioni");
  const titoloStagioniEl = document.getElementById("classifica-stagioni-titolo");
  const listaPeriodiEl = document.getElementById("classifica-periodi");
  const titoloPeriodiEl = document.getElementById("classifica-periodi-titolo");
  const podioPeriodiEl = document.getElementById("podio-periodi");
  const recordMesiEl = document.getElementById("record-mesi");
  const titoloRecordMesiEl = document.getElementById("record-mesi-titolo");
  const podioRecordMesiEl = document.getElementById("podio-record-mesi");

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
    const { righe: righeRecord, totale: totaleRecord } = CM.calcolaRecordMesi(
      allData,
      ConfigMesi.elenco,
    );

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
        CM.creaRigaTotale(totaleRecord, `${righeRecord.length} record`);
  } catch (error) {
    console.error(`Errore nel caricamento della classifica: ${error}`);
    if (listaEl)
      listaEl.innerHTML =
        '<li class="errore-grafico">Non è stato possibile caricare la classifica dei mesi.</li>';
    if (recordMesiEl)
      recordMesiEl.innerHTML =
        '<li class="errore-grafico">Non è stato possibile caricare i record mese per mese.</li>';
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
    console.error(`Errore nel caricamento del confronto fra i periodi: ${error}`);
    if (listaPeriodiEl)
      listaPeriodiEl.innerHTML =
        '<li class="errore-grafico">Non è stato possibile caricare il confronto fra i periodi.</li>';
  }
});
