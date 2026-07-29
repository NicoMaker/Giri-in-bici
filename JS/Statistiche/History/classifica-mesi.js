// ============================================================
// classifica-mesi.js — Avvio della pagina Classifica dei mesi
//
// Solo l'avvio. I pezzi stanno in History/classifica-mesi/:
//   calcoli.js   somma i chilometri di ogni mese su tutti gli anni
//   podio.js     podio dei primi tre e classifica completa (mesi e
//                stagioni)
//   stagioni.js  somma i chilometri di ogni stagione su tutti gli anni
// L'ordine dei mesi arriva da History/comune/config-mesi.js
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
  const podioEl = document.getElementById("podio");
  const listaEl = document.getElementById("classifica");
  const titoloEl = document.getElementById("classifica-titolo");
  const podioStagioniEl = document.getElementById("podio-stagioni");
  const titoloStagioniEl = document.getElementById("classifica-stagioni-titolo");
  const listaPeriodiEl = document.getElementById("classifica-periodi");
  const titoloPeriodiEl = document.getElementById("classifica-periodi-titolo");
  const recordMesiEl = document.getElementById("record-mesi");
  const titoloRecordMesiEl = document.getElementById("record-mesi-titolo");

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

    const { righe } = CM.calcolaClassifica(allData, ConfigMesi.elenco);
    const righeRecord = CM.calcolaRecordMesi(allData, ConfigMesi.elenco);

    if (titoloEl) titoloEl.innerHTML = CM.creaTitolo(righe);
    if (podioEl) podioEl.innerHTML = CM.creaPodio(righe, totaleAnni);
    if (listaEl) listaEl.innerHTML = CM.creaClassifica(righe);
    if (titoloRecordMesiEl)
      titoloRecordMesiEl.innerHTML = CM.creaTitoloRecordMesi(righeRecord);
    if (recordMesiEl) recordMesiEl.innerHTML = CM.creaRecordMesi(righeRecord);
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
    const righePeriodi = await CM.calcolaPeriodi();
    if (titoloPeriodiEl)
      titoloPeriodiEl.innerHTML = CM.creaTitoloPeriodi(righePeriodi);
    if (listaPeriodiEl)
      listaPeriodiEl.innerHTML = CM.creaClassificaPeriodi(righePeriodi);
  } catch (error) {
    console.error(`Errore nel caricamento del confronto fra i periodi: ${error}`);
    if (listaPeriodiEl)
      listaPeriodiEl.innerHTML =
        '<li class="errore-grafico">Non è stato possibile caricare il confronto fra i periodi.</li>';
  }
});
