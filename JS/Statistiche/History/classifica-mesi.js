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

    // "Anno" dentro "Km mensili": scegliendo un anno si ricalcola
    // la percentuale su quel solo anno (non sul totale di sempre),
    // stessa idea di prima ma come filtro dentro la scheda invece che
    // come scheda a parte. "?anno=2020" nell'indirizzo (es. da
    // Statistiche/Anni/2020.html) lo seleziona già in automatico.
    const annoFiltro = new URLSearchParams(window.location.search).get("anno");

    if (titoloEl) titoloEl.innerHTML = CM.creaTitolo(righe);
    if (podioEl) podioEl.innerHTML = CM.creaPodio(righe, totaleAnni);
    if (listaEl)
      listaEl.innerHTML =
        CM.creaClassifica(righe) + CM.creaRigaTotale(totale, "12 mesi");

    function mostraRecord(annoSelezionato) {
      let righeMostrate = righeRecordTutti;
      let totaleMostrato = totaleRecordTutti;
      let etichettaTotale = `${righeRecordTutti.length} record`;

      if (annoSelezionato) {
        righeMostrate = righeRecordTutti
          .filter((r) => String(r.anno) === annoSelezionato)
          .map((r) => ({ ...r }));
        totaleMostrato = righeMostrate.reduce((tot, r) => tot + r.km, 0);
        righeMostrate.forEach((r) => {
          r.percentuale =
            totaleMostrato > 0 ? (r.km / totaleMostrato) * 100 : 0;
        });
        etichettaTotale = `mesi del ${annoSelezionato}`;
      }

      if (titoloRecordMesiEl)
        titoloRecordMesiEl.innerHTML = CM.creaTitoloRecordMesi(righeMostrate);
      if (podioRecordMesiEl)
        podioRecordMesiEl.innerHTML = CM.creaPodioSemplice(righeMostrate);
      if (recordMesiEl)
        recordMesiEl.innerHTML =
          CM.creaRecordMesi(righeMostrate) +
          CM.creaRigaTotale(totaleMostrato, etichettaTotale);
    }

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

    function mostraPeriodi(stagioneScelta) {
      let righeMostrate = righePeriodi;
      let totaleMostrato = totalePeriodi;
      let etichettaTotale = `${righePeriodi.length} periodi`;

      if (stagioneScelta) {
        righeMostrate = righePeriodi
          .filter((r) => r.stagione === stagioneScelta)
          .map((r) => ({ ...r }));
        totaleMostrato = righeMostrate.reduce((tot, r) => tot + r.km, 0);
        righeMostrate.forEach((r) => {
          r.percentuale =
            totaleMostrato > 0 ? (r.km / totaleMostrato) * 100 : 0;
        });
        etichettaTotale = `periodi di ${stagioneScelta}`;
      }

      if (titoloPeriodiEl)
        titoloPeriodiEl.innerHTML = CM.creaTitoloPeriodi(righeMostrate);
      if (podioPeriodiEl)
        podioPeriodiEl.innerHTML = CM.creaPodioSemplice(righeMostrate);
      if (listaPeriodiEl)
        listaPeriodiEl.innerHTML =
          CM.creaClassificaPeriodi(righeMostrate) +
          CM.creaRigaTotale(totaleMostrato, etichettaTotale);
    }

    if (selettorePeriodiStagioneEl) {
      const stagioniPeriodiUniche = [
        ...new Set(righePeriodi.map((r) => r.stagione)),
      ];
      stagioniPeriodiUniche.forEach((s) => {
        const opzione = document.createElement("option");
        opzione.value = s;
        opzione.textContent = s;
        selettorePeriodiStagioneEl.appendChild(opzione);
      });

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

  // ---------- Tappe: ogni singola uscita, di ogni stagione e anno ----------
  // "Tappe più lunghe" vive già nelle pagine di stagione (Estate.html
  // ecc.), ma lì per non sommergere la pagina se ne vedono solo le
  // prime 10: qui, nella pagina Classifica, è la scheda pensata per
  // vederle TUTTE insieme, con in più due filtri (stagione e anno) per
  // restringere l'elenco invece di scorrerle tutte mescolate. Stessa
  // fonte dati (i file json/<Stagione>/Periodi/<anno>.json), letta qui
  // da capo perché questa pagina non ha già in mano i dati.
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

      const stagioniUniche = [
        ...new Set(tutteLeTappe.map((t) => t.stagione)),
      ];
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
          selettoreAnnoEl.innerHTML =
            '<option value="">Tutti</option>';
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

      function aggiornaVistaTappe() {
        const stagioneScelta = selettoreStagioneEl.value;
        const annoScelto = selettoreAnnoEl.value;
        const filtrate = tutteLeTappe.filter(
          (t) =>
            (!stagioneScelta || t.stagione === stagioneScelta) &&
            (!annoScelto || t.periodo === annoScelto),
        );
        TappePiuLunghe.mostra("podio-tappe", "classifica-tappe", filtrate);
      }

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
      console.error(`Errore nel caricamento delle tappe: ${error}`);
      const listaTappeEl = document.getElementById("classifica-tappe");
      if (listaTappeEl)
        listaTappeEl.innerHTML =
          '<li class="errore-grafico">Non è stato possibile caricare le tappe.</li>';
    }
  }
});
