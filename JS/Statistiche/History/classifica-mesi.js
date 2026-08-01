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
// Ogni scheda ha anche i controlli di assets/classifica-controlli.js:
// un pulsante "Ordine" (dal più al meno pedalato o inverso) e un
// filtro "da...a" in chilometri con le scorciatoie "Min"/"Max".
// "Ordine" inverte TUTTO insieme — podio con le medaglie compreso, non
// solo la classifica completa sotto: scegliendo "dal meno al più
// pedalato" il podio mostra i tre con MENO km (o i giri più corti),
// non i tre migliori fissi. Il filtro per km invece si applica sempre
// a podio e lista insieme, così il podio mostra i primi tre DENTRO
// l'intervallo scelto.
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
//             History/classifica-mesi/podio.js,
//             assets/tappe-piu-lunghe.js, assets/classifica-controlli.js
// ============================================================

const CM = window.ClassificaMesi;
const CC = window.ClassificaControlli;

document.addEventListener("DOMContentLoaded", async () => {
  // ---------- Selettore in cima: cosa mostrare ----------
  // Indipendente dal caricamento dei dati: funziona subito, anche se
  // il fetch qui sotto è ancora in corso o fallisce.
  //
  // La vista iniziale arriva da "?vista=" nell'indirizzo: ogni pagina
  // del sito che porta qui sceglie già la scheda giusta (es. dalla
  // pagina di una stagione arriva "?vista=stagioni"). Senza il
  // parametro, o con un valore che non esiste, si parte da "mesi".
  const VISTE_VALIDE = [
    "mesi",
    "record",
    "anni",
    "stagioni",
    "periodi",
    "tappe",
  ];
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

  // Scorre fino all'inizio della PAGINA (non solo del contenuto della
  // scheda): toccando una pillola mentre si è più in basso — magari in
  // fondo alla classifica completa di un'altra scheda — deve sempre
  // riportare all'inizio della pagina, come un arrivo da capo.
  function scorriAllInizioPagina() {
    const motoRidotto = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: motoRidotto ? "auto" : "smooth" });
    });
  }

  const vistaIniziale = new URLSearchParams(window.location.search).get(
    "vista",
  );
  attivaVista(VISTE_VALIDE.includes(vistaIniziale) ? vistaIniziale : "mesi");

  // Chi arriva da un link con "?vista=" (es. da una pagina-stagione)
  // vede già la scheda giusta selezionata in cima, ma la pagina resta
  // ferma in cima: si arriva sempre dall'inizio (intestazione e
  // pillole comprese), non già scorsi in mezzo al contenuto. Solo il
  // cambio scheda FATTO A MANO (pillola o select, qui sotto) scorre:
  // qui all'arrivo no.

  // Cambio scheda manuale (pillola o select mobile): qui invece lo
  // scorrimento resta utile — si sta già leggendo qualcos'altro,
  // magari molto più in basso (es. in fondo alla classifica completa
  // di un'altra scheda) e toccare una pillola deve riportare
  // all'inizio della pagina, non lasciare a metà pagina un pezzo a
  // caso della scheda nuova.
  pulsantiVista.forEach((pulsante) => {
    pulsante.addEventListener("click", () => {
      attivaVista(pulsante.dataset.vista);
      scorriAllInizioPagina();
    });
  });

  if (selettoreMobile) {
    selettoreMobile.addEventListener("change", () => {
      attivaVista(selettoreMobile.value);
      scorriAllInizioPagina();
    });
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
  const selettorePeriodiStagioneEl = document.getElementById(
    "periodi-filtro-stagione",
  );
  const recordMesiEl = document.getElementById("record-mesi");
  const titoloRecordMesiEl = document.getElementById("record-mesi-titolo");
  const podioRecordMesiEl = document.getElementById("podio-record-mesi");
  const podioAnniEl = document.getElementById("podio-anni");
  const listaAnniEl = document.getElementById("classifica-anni");
  const titoloAnniEl = document.getElementById("classifica-anni-titolo");
  const selettoreRecordAnnoEl = document.getElementById("record-filtro-anno");

  // ---------- Controlli condivisi: Ordine + filtro per km ----------
  // Un'istanza per scheda. CC.crea() restituisce uno stato neutro se
  // il contenitore non esiste in pagina, quindi non serve controllare
  // qui se ognuno di questi elementi c'è davvero.
  const controlliMesi = CC.crea(document.getElementById("controlli-mesi"), {
    onCambia: () => disegnaMesi(),
  });
  const controlliRecord = CC.crea(document.getElementById("controlli-record"), {
    onCambia: () =>
      mostraRecord(selettoreRecordAnnoEl ? selettoreRecordAnnoEl.value : ""),
  });
  const controlliAnni = CC.crea(document.getElementById("controlli-anni"), {
    onCambia: () => disegnaAnni(),
  });
  const controlliStagioni = CC.crea(
    document.getElementById("controlli-stagioni"),
    {
      onCambia: () => disegnaStagioni(),
    },
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
  const controlliGiri = CC.crea(document.getElementById("controlli-giri"), {
    onCambia: () => aggiornaVistaTappe(),
  });

  // Righe dei mesi e degli anni, calcolate una volta e riusate da
  // disegnaMesi()/disegnaAnni() ogni volta che cambiano Ordine o
  // filtro per km. Dichiarate qui fuori dal try cosi' le funzioni piu'
  // sotto (chiamate anche dai controlli) le trovano gia' pronte.
  let righeMesi = [];
  let righeAnniComplete = [];
  let righeStagioniComplete = [];

  function disegnaMesi() {
    const stato = controlliMesi.stato();
    // Cerca solo per nome del mese (es. "Settembre"): è l'unico testo
    // che questa scheda ha da offrire, un mese aggregato su tutti gli anni.
    const cercate = CC.cerca(righeMesi, stato.testo, (r) => r.mese);
    const filtrate = CC.filtra(cercate, stato, (r) => r.km);
    // Podio e lista completa seguono LO STESSO ordine scelto: "Ordine"
    // inverte tutto, non solo la lista sotto — se scegli "dal meno al
    // più", il podio mostra i tre con MENO km, non i tre migliori fissi.
    const ordinate = CC.ordina(filtrate, stato.ordine, (r) => r.km);
    const perPodio = ordinate.slice(0, 3);
    const totaleFiltrato = filtrate.reduce((tot, r) => tot + r.km, 0);

    if (titoloEl) titoloEl.innerHTML = CM.creaTitolo(perPodio, stato.ordine);
    if (podioEl) podioEl.innerHTML = CM.creaPodio(perPodio, totaleAnniGlobale);
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
    // Cerca per anno (es. "2024"): "nome" è già l'anno come stringa.
    const cercate = CC.cerca(righeAnniComplete, stato.testo, (r) => r.nome);
    const filtrate = CC.filtra(cercate, stato, (r) => r.km);
    const ordinate = CC.ordina(filtrate, stato.ordine, (r) => r.km);
    const perPodio = ordinate.slice(0, 3);
    const totaleFiltrato = filtrate.reduce((tot, r) => tot + r.km, 0);

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

  // "Stagioni" mostra sempre tutte e tre le stagioni (non c'è una
  // lista a parte sotto): qui "Ordine" decide direttamente quale
  // stagione occupa il gradino d'oro/argento/bronzo, e la frase sopra
  // il podio segue lo stesso ordine (stesso comportamento delle altre
  // schede: "Ordine" inverte tutto, podio compreso).
  function disegnaStagioni() {
    const stato = controlliStagioni.stato();
    // Cerca per nome della stagione (es. "Estate", "Autunno").
    const cercate = CC.cerca(
      righeStagioniComplete,
      stato.testo,
      (r) => r.stagione,
    );
    const filtrate = CC.filtra(cercate, stato, (r) => r.km);
    const perPodio = CC.ordina(filtrate, stato.ordine, (r) => r.km);

    if (titoloStagioniEl)
      titoloStagioniEl.innerHTML = CM.creaTitoloStagioni(
        perPodio,
        stato.ordine,
      );
    if (podioStagioniEl)
      podioStagioniEl.innerHTML = CM.creaPodioStagioni(perPodio);
  }

  let totaleAnniGlobale = 0;
  // Assegnate per davvero dentro i due blocchi try più sotto: qui solo
  // un fallback innocuo, per lo stesso motivo di "aggiornaVistaTappe"
  // più in basso — le callback dei controlli (poche righe sopra) le
  // referenziano già prima che i blocchi try vengano eseguiti.
  let mostraRecord = () => {};
  let mostraPeriodi = () => {};

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

    // "Anno" dentro "Km mensili": scegliendo un anno si ricalcola
    // la percentuale su quel solo anno (non sul totale di sempre),
    // stessa idea di prima ma come filtro dentro la scheda invece che
    // come scheda a parte. "?anno=2020" nell'indirizzo (es. da
    // Statistiche/Anni/2020.html) lo seleziona già in automatico.
    const annoFiltro = new URLSearchParams(window.location.search).get("anno");

    controlliMesi.aggiornaLimiti(righeMesi.map((r) => r.km));
    disegnaMesi();

    mostraRecord = function (annoSelezionato) {
      let righeAnnoScelto = righeRecordTutti;

      if (annoSelezionato) {
        righeAnnoScelto = righeRecordTutti
          .filter((r) => String(r.anno) === annoSelezionato)
          .map((r) => ({ ...r }));
        const totaleAnnoScelto = righeAnnoScelto.reduce(
          (tot, r) => tot + r.km,
          0,
        );
        righeAnnoScelto.forEach((r) => {
          r.percentuale =
            totaleAnnoScelto > 0 ? (r.km / totaleAnnoScelto) * 100 : 0;
        });
      }

      controlliRecord.aggiornaLimiti(righeAnnoScelto.map((r) => r.km));
      const stato = controlliRecord.stato();
      // Cerca per mese o per anno insieme (es. "Settembre" oppure
      // "2024" trovano "Settembre 2024"): "nome" è già "Mese anno".
      const cercate = CC.cerca(
        righeAnnoScelto,
        stato.testo,
        (r) => r.nome,
      );
      const filtrate = CC.filtra(cercate, stato, (r) => r.km);
      const ordinate = CC.ordina(filtrate, stato.ordine, (r) => r.km);
      const perPodio = ordinate.slice(0, 3);

      const totaleFiltrato = filtrate.reduce((tot, r) => tot + r.km, 0);
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

  try {
    righeStagioniComplete = await CM.calcolaStagioni();
    controlliStagioni.aggiornaLimiti(righeStagioniComplete.map((r) => r.km));
    disegnaStagioni();
  } catch (error) {
    console.error(`Errore nel caricamento della classifica stagioni: ${error}`);
    if (podioStagioniEl)
      podioStagioniEl.innerHTML =
        '<p class="errore-grafico">Non è stato possibile caricare la classifica delle stagioni.</p>';
  }

  try {
    const { righe: righePeriodiComplete } = await CM.calcolaPeriodi();

    mostraPeriodi = function (stagioneScelta) {
      let righePerStagione = righePeriodiComplete;

      if (stagioneScelta) {
        righePerStagione = righePeriodiComplete
          .filter((r) => r.stagione === stagioneScelta)
          .map((r) => ({ ...r }));
        const totalePerStagione = righePerStagione.reduce(
          (tot, r) => tot + r.km,
          0,
        );
        righePerStagione.forEach((r) => {
          r.percentuale =
            totalePerStagione > 0 ? (r.km / totalePerStagione) * 100 : 0;
        });
      }

      controlliPeriodi.aggiornaLimiti(righePerStagione.map((r) => r.km));
      const stato = controlliPeriodi.stato();
      // Cerca per nome del periodo (es. "Estate 2020"), per stagione
      // da sola (es. "Autunno") o per solo l'anno/intervallo (es.
      // "2020-2021"): "nome" è già "Stagione periodo" per intero,
      // "periodo" lascia trovare anche il solo anno/intervallo.
      const cercate = CC.cerca(
        righePerStagione,
        stato.testo,
        (r) => `${r.nome} ${r.periodo}`,
      );
      const filtrate = CC.filtra(cercate, stato, (r) => r.km);
      const ordinate = CC.ordina(filtrate, stato.ordine, (r) => r.km);
      const perPodio = ordinate.slice(0, 3);

      const totaleFiltrato = filtrate.reduce((tot, r) => tot + r.km, 0);
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

      // Chi arriva da un link con "?stagione=" (es. dal bottone "Vedi la
      // classifica" in fondo alla pagina di una stagione o di un
      // periodo) trova il filtro gia' impostato giusto, non parte
      // sempre da "Tutte": stesso comportamento gia' usato per i
      // filtri della scheda "Giri" qui sotto.
      const parametriUrlPeriodi = new URLSearchParams(window.location.search);
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

  // ---------- Giri: ogni singola uscita, di ogni stagione e anno ----------
  // "Giri più lunghi" (ex "Tappe più lunghe") vive già nelle pagine di
  // stagione (Estate.html ecc., dove il testo resta invariato), ma lì
  // per non sommergere la pagina se ne vedono solo le prime 10: qui,
  // nella pagina Classifica, è la scheda pensata per vederle TUTTE
  // insieme, con in più due filtri (stagione e anno), il pulsante
  // Ordine e il filtro per km. Stessa fonte dati (i file
  // json/<Stagione>/Periodi/<anno>.json), letta qui da capo perché
  // questa pagina non ha già in mano i dati.
  let aggiornaVistaTappe = () => {};

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
              stagione: config.season,
              periodo: etichettaPeriodo,
              etichetta: `${r.date} · ${config.season} ${etichettaPeriodo}`,
              distance: r.distance,
            });
          });
        });
      }

      // ---------- Filtri: popolati con quello che c'è davvero nei dati ----------
      const selettoreStagioneEl = document.getElementById(
        "tappe-filtro-stagione",
      );
      const selettoreAnnoEl = document.getElementById("tappe-filtro-anno");

      const stagioniUniche = [...new Set(tutteLeTappe.map((t) => t.stagione))];
      stagioniUniche.forEach((s) => {
        const opzione = document.createElement("option");
        opzione.value = s;
        opzione.textContent = s;
        selettoreStagioneEl.appendChild(opzione);
      });

      // "Anno" dipende da quale stagione è scelta: con "Estate" scelta
      // ha senso proporre solo gli anni che l'Estate ha davvero, non
      // anche gli intervalli dell'Autunno-Inverno o gli anni in cui
      // quella stagione non è mai stata registrata. Si ricalcola ogni
      // volta che cambia la stagione (o parte vuota, "Tutte").
      function popolaAnni(stagioneFiltro) {
        // Con "Tutte" le stagioni insieme, un filtro per anno non ha
        // senso: gli anni dell'Estate ("2020") e gli intervalli
        // dell'Autunno-Inverno ("2020-2021") finirebbero mescolati
        // nella stessa lista. Il filtro Anno si sceglie solo dopo
        // aver scelto una singola stagione (Primavera, Estate...).
        if (!stagioneFiltro) {
          selettoreAnnoEl.innerHTML = '<option value="">Tutti</option>';
          selettoreAnnoEl.value = "";
          selettoreAnnoEl.disabled = true;
          return;
        }
        selettoreAnnoEl.disabled = false;

        const disponibili = tutteLeTappe.filter(
          (t) => t.stagione === stagioneFiltro,
        );
        // "Anno" per l'Autunno-Inverno è un intervallo ("2020-2021"):
        // resta per intero così com'è, non separato in due anni,
        // altrimenti una singola stagione finirebbe in due filtri.
        const anniDisponibili = [
          ...new Set(disponibili.map((t) => t.periodo)),
        ].sort((a, b) => b.localeCompare(a));

        const sceltaAttuale = selettoreAnnoEl.value;
        selettoreAnnoEl.innerHTML = '<option value="">Tutti</option>';
        anniDisponibili.forEach((a) => {
          const opzione = document.createElement("option");
          opzione.value = a;
          opzione.textContent = a;
          selettoreAnnoEl.appendChild(opzione);
        });
        // La scelta di prima resta solo se esiste ancora per la
        // stagione appena scelta; altrimenti si torna a "Tutti"
        // invece di lasciare un anno che quella stagione non ha.
        selettoreAnnoEl.value = anniDisponibili.includes(sceltaAttuale)
          ? sceltaAttuale
          : "";
      }

      aggiornaVistaTappe = function () {
        const stagioneScelta = selettoreStagioneEl.value;
        const annoScelto = selettoreAnnoEl.value;
        const perFiltriEsistenti = tutteLeTappe.filter(
          (t) =>
            (!stagioneScelta || t.stagione === stagioneScelta) &&
            (!annoScelto || t.periodo === annoScelto),
        );

        controlliGiri.aggiornaLimiti(perFiltriEsistenti.map((t) => t.distance));
        const stato = controlliGiri.stato();
        // Cerca per nome del giro/posto (es. "Sappada"), per stagione
        // (es. "Primavera") o per periodo/anno (es. "2022"): tutti e
        // tre i campi insieme, così un solo campo di testo copre
        // quello che qui sono due filtri a tendina separati.
        const cercate = CC.cerca(
          perFiltriEsistenti,
          stato.testo,
          (t) => `${t.nomeTesto || t.nome} ${t.stagione} ${t.periodo}`,
        );
        const filtrate = CC.filtra(
          cercate,
          stato,
          (t) => t.distance,
        );

        TappePiuLunghe.mostra(
          "podio-tappe",
          "classifica-tappe",
          filtrate,
          undefined,
          stato.ordine,
        );

        // Stesso totale in fondo alla lista già presente per Mesi, Anni,
        // Periodi e Record: qui mancava (TappePiuLunghe.mostra riempie
        // solo podio e lista, senza somma finale). Riusa CM.creaRigaTotale,
        // già generico e non legato ai mesi.
        const listaGiriEl = document.getElementById("classifica-tappe");
        if (listaGiriEl) {
          const totaleKmGiri = filtrate.reduce((tot, t) => tot + t.distance, 0);
          listaGiriEl.insertAdjacentHTML(
            "beforeend",
            CM.creaRigaTotale(
              totaleKmGiri,
              `${filtrate.length} ${pluralizza(filtrate.length, "giro", "giri")}`,
            ),
          );
        }
      };

      // Chi arriva da un link con "?stagione=" e/o "&anno=" (es. dalla
      // pagina di una stagione o di un periodo) trova i filtri già
      // impostati giusti, non parte sempre da "Tutte/Tutti".
      const parametriUrl = new URLSearchParams(window.location.search);
      const stagioneDaUrl = parametriUrl.get("stagione");
      if (stagioneDaUrl && stagioniUniche.includes(stagioneDaUrl)) {
        selettoreStagioneEl.value = stagioneDaUrl;
      }
      popolaAnni(selettoreStagioneEl.value);
      const annoDaUrl = parametriUrl.get("anno");
      if (
        annoDaUrl &&
        Array.prototype.some.call(
          selettoreAnnoEl.options,
          (o) => o.value === annoDaUrl,
        )
      ) {
        selettoreAnnoEl.value = annoDaUrl;
      }

      selettoreStagioneEl.addEventListener("change", () => {
        popolaAnni(selettoreStagioneEl.value);
        aggiornaVistaTappe();
      });
      selettoreAnnoEl.addEventListener("change", aggiornaVistaTappe);

      aggiornaVistaTappe();
    } catch (error) {
      console.error(`Errore nel caricamento dei giri: ${error}`);
      const listaTappeEl = document.getElementById("classifica-tappe");
      if (listaTappeEl)
        listaTappeEl.innerHTML =
          '<li class="errore-grafico">Non è stato possibile caricare i giri.</li>';
    }
  }
});
