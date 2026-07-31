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
  const VISTE_VALIDE = ["mesi", "record", "anni", "stagioni", "periodi", "tappe"];
  const gruppiVista = document.querySelectorAll("[data-vista-gruppo]");
  const pulsantiVista = document.querySelectorAll(
    "#selettore-vista .selettore-metrica__pulsante",
  );
  // Su schermi stretti le pillole lasciano il posto a questo select nativo
  // (vedi css/Statistiche/selettore-metrica.css): stessa scelta, resa come
  // menu a tendina invece che come fila di pulsanti.
  const selettoreMobile = document.getElementById("selettore-vista-mobile");

  function attivaVista(vista) {
    pulsantiVista.forEach((p) =>
      p.classList.toggle("attivo", p.dataset.vista === vista),
    );
    gruppiVista.forEach((gruppo) => {
      gruppo.style.display = gruppo.dataset.vistaGruppo === vista ? "" : "none";
    });
    if (selettoreMobile) selettoreMobile.value = vista;
  }

  const vistaIniziale = new URLSearchParams(window.location.search).get(
    "vista",
  );
  attivaVista(VISTE_VALIDE.includes(vistaIniziale) ? vistaIniziale : "mesi");

  // Chi arriva da un link con "?vista=" (es. da una pagina-stagione)
  // vede subito la fila dei pulsanti in cima, con quello giusto già
  // selezionato — ma se non si scorre non lo si nota, e sembra che
  // il link non abbia funzionato. Uno scorrimento morbido fino al
  // contenuto vero (il gruppo appena attivato) rende ovvio che sei
  // già dove dovevi essere, senza bisogno di ricliccare nulla. Solo
  // quando il link porta davvero un "?vista=" esplicito: una visita
  // diretta alla pagina (senza parametro) resta in cima, come sempre.
  if (VISTE_VALIDE.includes(vistaIniziale)) {
    const gruppoAttivo = document.querySelector(
      `[data-vista-gruppo="${vistaIniziale}"]`,
    );
    if (gruppoAttivo) {
      const motoRidotto = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      requestAnimationFrame(() => {
        gruppoAttivo.scrollIntoView({
          behavior: motoRidotto ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  }

  pulsantiVista.forEach((pulsante) => {
    pulsante.addEventListener("click", () =>
      attivaVista(pulsante.dataset.vista),
    );
  });

  if (selettoreMobile) {
    selettoreMobile.addEventListener("change", () =>
      attivaVista(selettoreMobile.value),
    );
  }

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

  // ---------- Scheda in più per l'anno di provenienza (?anno=2020) ----------
  // "Record per anno" resta sempre generale (tutti gli anni messi a
  // confronto): non viene più rinominato né filtrato. Quando si arriva da
  // una singola pagina-anno si aggiunge invece una scheda a parte, con
  // solo i mesi di quell'anno, che compare accanto alle altre invece di
  // sostituirne una: così il confronto generale resta sempre raggiungibile.
  const pulsanteAnnoCorrente = document.getElementById(
    "pulsante-anno-corrente",
  );
  const opzioneAnnoCorrente = selettoreMobile
    ? selettoreMobile.querySelector("#opzione-anno-corrente")
    : null;
  const titoloAnnoCorrenteEl = document.getElementById("anno-corrente-titolo");
  const podioAnnoCorrenteEl = document.getElementById("podio-anno-corrente");
  const listaAnnoCorrenteEl = document.getElementById(
    "classifica-anno-corrente",
  );
  const h2PodioAnnoCorrenteEl = document.getElementById(
    "anno-corrente-h2-podio",
  );
  const h2ListaAnnoCorrenteEl = document.getElementById(
    "anno-corrente-h2-lista",
  );
  const vediTuttiAnniBtn = document.getElementById("vedi-tutti-anni-bottone");
  if (vediTuttiAnniBtn) {
    vediTuttiAnniBtn.addEventListener("click", () => attivaVista("record"));
  }

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
    // ecc. con "?anno=2020"), si prepara la scheda dedicata solo a quel
    // sottoinsieme: percentuali ricalcolate su quell'anno soltanto, non sul
    // totale di sempre.
    const annoFiltro = new URLSearchParams(window.location.search).get("anno");
    const filtratoPerAnno =
      annoFiltro && righeRecordTutti.some((r) => String(r.anno) === annoFiltro);

    if (filtratoPerAnno) {
      const righeAnnoCorrente = righeRecordTutti
        .filter((r) => String(r.anno) === annoFiltro)
        .map((r) => ({ ...r }));
      const totaleAnnoCorrente = righeAnnoCorrente.reduce(
        (tot, r) => tot + r.km,
        0,
      );
      righeAnnoCorrente.forEach((r) => {
        r.percentuale =
          totaleAnnoCorrente > 0 ? (r.km / totaleAnnoCorrente) * 100 : 0;
      });

      if (pulsanteAnnoCorrente) {
        pulsanteAnnoCorrente.hidden = false;
        pulsanteAnnoCorrente.textContent = `Mesi ${annoFiltro}`;
      }
      if (opzioneAnnoCorrente) {
        opzioneAnnoCorrente.hidden = false;
        opzioneAnnoCorrente.disabled = false;
        opzioneAnnoCorrente.textContent = `Mesi ${annoFiltro}`;
      }
      if (h2PodioAnnoCorrenteEl)
        h2PodioAnnoCorrenteEl.textContent = `I mesi migliori del ${annoFiltro}`;
      if (h2ListaAnnoCorrenteEl)
        h2ListaAnnoCorrenteEl.textContent = `Tutti i mesi del ${annoFiltro}`;
      if (titoloAnnoCorrenteEl)
        titoloAnnoCorrenteEl.innerHTML =
          CM.creaTitoloRecordMesi(righeAnnoCorrente);
      if (podioAnnoCorrenteEl)
        podioAnnoCorrenteEl.innerHTML = CM.creaPodioSemplice(righeAnnoCorrente);
      if (listaAnnoCorrenteEl)
        listaAnnoCorrenteEl.innerHTML =
          CM.creaRecordMesi(righeAnnoCorrente) +
          CM.creaRigaTotale(totaleAnnoCorrente, `mesi del ${annoFiltro}`);

      // Se il link di provenienza chiedeva la scheda "record" (il caso
      // normale: Statistiche/Anni/*.html manda "?vista=record&anno=2020"),
      // si parte subito dalla scheda dedicata a quell'anno invece che dal
      // confronto generale fra tutti gli anni.
      if (vistaIniziale === "record") {
        attivaVista("anno-corrente");
        // Lo scorrimento di prima (subito dopo il caricamento) puntava
        // ancora al gruppo "record": qui si passa davvero a
        // "anno-corrente", che esiste solo dopo questo fetch, quindi
        // serve un secondo scorrimento verso il gruppo giusto.
        const gruppoAnnoCorrente = document.querySelector(
          '[data-vista-gruppo="anno-corrente"]',
        );
        if (gruppoAnnoCorrente) {
          const motoRidotto = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          gruppoAnnoCorrente.scrollIntoView({
            behavior: motoRidotto ? "auto" : "smooth",
            block: "start",
          });
        }
      }
    }

    if (titoloEl) titoloEl.innerHTML = CM.creaTitolo(righe);
    if (podioEl) podioEl.innerHTML = CM.creaPodio(righe, totaleAnni);
    if (listaEl)
      listaEl.innerHTML =
        CM.creaClassifica(righe) + CM.creaRigaTotale(totale, "12 mesi");
    if (titoloRecordMesiEl)
      titoloRecordMesiEl.innerHTML = CM.creaTitoloRecordMesi(righeRecordTutti);
    if (podioRecordMesiEl)
      podioRecordMesiEl.innerHTML = CM.creaPodioSemplice(righeRecordTutti);
    if (recordMesiEl)
      recordMesiEl.innerHTML =
        CM.creaRecordMesi(righeRecordTutti) +
        CM.creaRigaTotale(
          totaleRecordTutti,
          `${righeRecordTutti.length} record`,
        );

    const { righe: righeAnni, totale: totaleAnniKm } = CM.calcolaAnni(allData);
    if (titoloAnniEl) titoloAnniEl.innerHTML = CM.creaTitoloAnni(righeAnni);
    if (podioAnniEl) podioAnniEl.innerHTML = CM.creaPodioAnni(righeAnni);
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

  // ---------- Tappe: ogni singola uscita, di ogni stagione e anno ----------
  // "Tappe più lunghe" vive già nelle pagine di stagione (Estate.html
  // ecc.), ma lì per non sommergere la pagina se ne vedono solo le
  // prime 10: qui, nella pagina Classifica, è la scheda pensata per
  // vederle TUTTE insieme, senza limite. Stessa fonte dati (i file
  // json/<Stagione>/Periodi/<anno>.json), letta qui da capo perché
  // questa pagina non ha già in mano i dati delle stagioni.
  if (window.TappePiuLunghe) {
    try {
      const configStagioni = [
        "json/Estate/estate.json",
        "json/Primavera/primavera.json",
        "json/Autunno_Inverno/autunno-inverno.json",
      ];
      const configuazioni = await Promise.all(
        configStagioni.map((url) => fetchJSON(url)),
      );

      const tutteLeTappe = [];
      for (const config of configuazioni) {
        const periodi = Object.entries(config.subPeriods || {});
        const datiPeriodi = await Promise.all(
          periodi.map(([, file]) => fetchJSON(file)),
        );
        periodi.forEach(([etichettaPeriodo], indice) => {
          const uscite = datiPeriodi[indice] || [];
          uscite.forEach((r) => {
            const info = TappePiuLunghe.analizzaLuogo(r.place);
            tutteLeTappe.push({
              nome: info.nome,
              nomeTesto: info.nomeTesto,
              href: info.href,
              linkMultipli: info.linkMultipli,
              etichetta: `${r.date} · ${config.season} ${etichettaPeriodo}`,
              distance: r.distance,
            });
          });
        });
      }

      TappePiuLunghe.mostra("podio-tappe", "classifica-tappe", tutteLeTappe);
    } catch (error) {
      console.error(`Errore nel caricamento delle tappe: ${error}`);
      const listaTappeEl = document.getElementById("classifica-tappe");
      if (listaTappeEl)
        listaTappeEl.innerHTML =
          '<li class="errore-grafico">Non è stato possibile caricare le tappe.</li>';
    }
  }
});
