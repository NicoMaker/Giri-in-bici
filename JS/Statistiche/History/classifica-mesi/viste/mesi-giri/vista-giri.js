// ============================================================
// vista-giri.js — Scheda "Giri" (i percorsi più lunghi) della
// pagina Classifica dei mesi.
//
// Due modi di vedere gli stessi giri (pulsanti "Classifica" / "Giri per
// anno" sopra i filtri, oppure ?modo=anni nell'indirizzo):
//   - Classifica: podio + elenco unico, come sempre;
//   - Giri per anno: un blocco per ogni anno solare con TUTTI i dati
//     (data, posto, link al percorso, stagione e periodo, km, quota
//     sul totale dell'anno) e un riepilogo (giri, km, media, giro più
//     lungo, km per stagione). Lo stesso anno solare di "Corse per anno".
// Nella vista "Giri per anno" (che ha sostituito la vecchia pagina
// "Corse per anno") ci sono anche:
//   - la scelta di uno o più anni solari (pulsanti; ?anni=2023,2024
//     oppure ?anni=tutti nell'indirizzo);
//   - la ricerca avanzata: più posti, più intervalli di date, più
//     intervalli di km ("o questo o quello" dentro un gruppo, i gruppi
//     fra loro si sommano);
//   - il podio dei tre giri più lunghi di ogni anno.
// In "Giri per anno" restano i colori delle stagioni (riga e podio),
// la legenda, il filtro Stagione e la stagione scritta sotto ogni giro
// ("19 Settembre · Estate 2026"); NON c'è invece nessun ordinamento o
// raggruppamento per stagione: dentro ogni anno i giri seguono solo
// l'ordine scelto (km, nome o data).
// I primi 3 hanno il contorno oro/argento/bronzo, sia nel podio sia
// nella tabella sotto.
// Nella Classifica restano i colori e il filtro delle stagioni.
// Ricerca, ordine, km e Anno valgono per entrambi i modi.
//
// Dati letti direttamente da json/Estate/generale.json,
// json/Primavera/generale.json e
// json/Autunno_Inverno/generale.json (e dai rispettivi
// sottoperiodi), indipendenti dal resto della pagina.
//
// Dipendenze: JS/json.js, JS/utils.js, History/comune/config-mesi.js,
//             assets/tappe-piu-lunghe.js, assets/classifica-controlli.js
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  // Il titolo della sezione "Classifica completa" descrive la direzione
  // dell'ordinamento scelto: non può restare fisso su "dal più lungo al
  // più corto" quando l'utente sceglie un altro ordine (es. "Dal meno al
  // più lungo"), altrimenti il testo mentirebbe rispetto a quello che si
  // vede davvero in lista.
  const TITOLI_ORDINE_GIRI = {
    desc: "Tutti i giri, dal più lungo al più corto",
    asc: "Tutti i giri, dal più corto al più lungo",
    alfabetico: "Tutti i giri, in ordine alfabetico (A-Z)",
    "alfabetico-desc": "Tutti i giri, in ordine alfabetico (Z-A)",
    "data-recente": "Tutti i giri, dal più recente al meno recente",
    "data-vecchio": "Tutti i giri, dal meno recente al più recente",
  };

  // Titolo del podio: dice davvero chi c'è sul podio nell'ordine scelto.
  const TITOLI_PODIO_GIRI = {
    desc: "I tre giri più lunghi di sempre",
    asc: "I tre giri più corti di sempre",
    alfabetico: "I primi tre giri in ordine alfabetico",
    "alfabetico-desc": "I primi tre giri in ordine alfabetico inverso",
    "data-recente": "I tre giri più recenti",
    "data-vecchio": "I tre giri meno recenti",
  };

  // Titolo del podio di un anno, secondo l'ordine scelto.
  function titoloPodioAnno(ordine, n, anno) {
    if (ordine === "asc")
      return `${n === 1 ? "Il giro più corto" : `I ${n} giri più corti`} del ${anno}`;
    if (ordine === "alfabetico" || ordine === "alfabetico-desc")
      return `${n === 1 ? "Il primo giro" : `I primi ${n} giri`} in ordine alfabetico del ${anno}`;
    if (ordine === "data-recente")
      return `${n === 1 ? "Il giro più recente" : `I ${n} giri più recenti`} del ${anno}`;
    if (ordine === "data-vecchio")
      return `${n === 1 ? "Il giro meno recente" : `I ${n} giri meno recenti`} del ${anno}`;
    return `${n === 1 ? "Il giro più lungo" : `I ${n} giri più lunghi`} del ${anno}`;
  }

  // ---------- Vista "Giri per anno" ----------
  // Anni, ricerca, ordine e km usano gli stessi filtri della Classifica.

  // Nome della stagione (come in generale.json) -> chiave dei colori.
  function classeStagione(nome) {
    const n = String(nome || "").toLowerCase();
    if (n.includes("primavera")) return "primavera";
    if (n.includes("estate")) return "estate";
    return "autunno-inverno";
  }

  function piuLungo(righe) {
    return righe.reduce(
      (m, r) => (!m || r.distance > m.distance ? r : m),
      null,
    );
  }

  const num = (n) => formatItalianNumber(Math.round(n * 10) / 10);

  // Un blocco per ogni anno solare, con tutti i giri di quell'anno.
  // L'anno più recente per primo, tranne con "Meno recente" (data-vecchio).
  // Ogni giro tiene il colore e l'etichetta della sua stagione, come
  // nella Classifica, ma i giri NON sono raggruppati per stagione.
  function creaGiriPerAnno(righe, ordine) {
    if (!righe.length) {
      return '<p class="errore-grafico">Nessun giro corrisponde ai filtri scelti.</p>';
    }
    // I blocchi sono sempre gli anni solari (2026, 2025 ...): i periodi
    // di Autunno · Inverno (2025/2026) esistono solo nella Classifica.
    const perAnno = new Map();
    righe.forEach((r) => {
      const k = String(r.anno);
      if (!perAnno.has(k)) perAnno.set(k, []);
      perAnno.get(k).push({ ...r });
    });
    const anni = [...perAnno.keys()].sort((a, b) => a.localeCompare(b));
    if (ordine !== "data-vecchio") anni.reverse();

    const blocchi = anni.map((chiave) => {
      const giri = perAnno.get(chiave);
      const anno = chiave;
      const km = giri.reduce((t, r) => t + r.distance, 0);
      const media = giri.length ? km / giri.length : 0;
      const lungo = piuLungo(giri);
      const nGiri = `${giri.length} ${pluralizza(giri.length, "giro", "giri")}`;
      // I tre giri più lunghi dell'anno (gli stessi del podio sopra):
      // ogni riga che ne fa parte porta la sua medaglia, ovunque si
      // trovi nell'elenco. Solo quando l'elenco è "dal più lungo" e non
      // diviso per stagione i tre stanno davvero in cima: lì si traccia
      // anche la riga di separazione dal 4º in poi.
      TappePiuLunghe.ordina(giri, ordine)
        .slice(0, 3)
        .forEach((r, i) => {
          r.posPodio = i;
        });
      const separaPodio = ordine === "desc";
      const corpo = `<ol class="classifica-lista giri-anno__lista">${TappePiuLunghe.creaLista(TappePiuLunghe.ordina(giri, ordine), km, undefined, { segnaPodio: true, separatore: separaPodio })}</ol>`;
      const piede = `<ol class="classifica-lista giri-anno__lista giri-anno__lista--totale">${CM.creaRigaTotale(
        km,
        `${anno} · ${nGiri} · media ${num(media)} km a giro`,
      )}</ol>`;
      return `
        <section class="giri-anno" id="giri-anno-${chiave}">
          <header class="giri-anno__testa">
            <h3 class="giri-anno__titolo">${anno}</h3>
            <dl class="giri-anno__dati">
              <div><dt>Giri fatti</dt><dd>${giri.length}</dd></div>
              <div><dt>Km totali</dt><dd>${formatItalianNumber(km)} km</dd></div>
              <div><dt>Media a giro</dt><dd>${num(media)} km</dd></div>
              <div><dt>Più lungo</dt><dd>${formatItalianNumber(lungo.distance)} km</dd></div>
            </dl>
          </header>
          <div class="giri-anno__podio">
            <p class="giri-anno__podio-titolo">${titoloPodioAnno(ordine, Math.min(3, giri.length), anno)}</p>
            <div class="podio">${TappePiuLunghe.creaPodio(TappePiuLunghe.ordina(giri, ordine), km)}</div>
          </div>
          ${corpo}
          ${piede}
        </section>`;
    });

    const totaleKm = righe.reduce((t, r) => t + r.distance, 0);
    const mediaGiro = righe.length ? totaleKm / righe.length : 0;
    const mediaAnno = anni.length ? totaleKm / anni.length : 0;
    const totale = `<ol class="classifica-lista giri-anno__lista giri-anno__lista--totale giri-anno__lista--finale">${CM.creaRigaTotale(
      totaleKm,
      `${righe.length} ${pluralizza(righe.length, "giro", "giri")} in ${anni.length} ${pluralizza(anni.length, "anno", "anni")} · media ${num(mediaGiro)} km a giro, ${num(mediaAnno)} km all'anno`,
    )}</ol>`;
    return blocchi.join("") + totale;
  }

  CM.avviaVistaGiri = async function () {
    const CC = window.ClassificaControlli;

    const titoloSezioneEl = document.getElementById(
      "classifica-tappe-titolo-sezione",
    );

    // "Azzera pulsanti" rimette Stagione e Anno com'erano all'apertura
    // (tutti selezionati); la funzione vera è assegnata più sotto, dopo
    // aver caricato i dati.
    let ripristinaFiltriGiri = () => {};
    const ripristinaRicercaGiri = () => {};
    const controlliGiri = CC.crea(document.getElementById("controlli-giri"), {
      onCambia: () => aggiornaVistaTappe(),
      ripristinaFiltri: () => ripristinaFiltriGiri(),
      ripristinaRicerca: () => ripristinaRicercaGiri(),
    });

    let aggiornaVistaTappe = () => {};
    // Cambiando modo (Classifica / Giri per anno) cambia l'elenco del
    // filtro Anno: assegnata più sotto, quando i dati sono caricati.
    let alCambioModo = () => {};

    // Modo di visualizzazione: "classifica" (podio + elenco) o "anni".
    // Non è un filtro: il reset dei pulsanti non lo cambia.
    let modo =
      new URLSearchParams(window.location.search).get("modo") === "anni"
        ? "anni"
        : "classifica";
    const pulsantiModo = document.querySelectorAll("#tappe-vista [data-modo]");
    pulsantiModo.forEach((p) => {
      p.addEventListener("click", () => {
        if (modo === p.dataset.modo) return;
        modo = p.dataset.modo;
        alCambioModo();
        aggiornaVistaTappe();
      });
    });

    if (!window.TappePiuLunghe) return;

    try {
      const configStagioni = [
        "json/Estate/generale.json",
        "json/Primavera/generale.json",
        "json/Autunno_Inverno/generale.json",
      ];
      const configuazioni = await Promise.all(
        configStagioni.map((url) => fetchJSON(url)),
      );

      function annoReale(etichettaPeriodo, meseNum) {
        const intervallo = etichettaPeriodo.match(/^(\d{4})-(\d{4})$/);
        if (!intervallo) return parseInt(etichettaPeriodo, 10);
        return meseNum >= 10
          ? parseInt(intervallo[1], 10)
          : parseInt(intervallo[2], 10);
      }

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
            const [giornoTesto, meseTesto] = (r.date || "").split(" ");
            const giorno = parseInt(giornoTesto, 10) || 0;
            const meseNum = ConfigMesi.ordine[meseTesto] || 0;
            const anno = annoReale(etichettaPeriodo, meseNum) || 0;
            // Periodo scritto come nei file e nelle pagine del sito:
            // "2026" (Primavera/Estate) oppure "2025-2026" (Autunno ·
            // Inverno, a cavallo di due anni).
            const periodoLeggibile = String(etichettaPeriodo);
            tutteLeTappe.push({
              nome: info.nome,
              nomeTesto: info.nomeTesto,
              href: info.href,
              linkMultipli: info.linkMultipli,
              stagione: config.season,
              stagioneClasse: classeStagione(config.season),
              anno,
              periodo: etichettaPeriodo,
              // Elenco completo (classifica): data, stagione e periodo di
              // OGNI stagione, scritto per esteso: "Primavera 2026",
              // "Autunno - Inverno 2025-2026".
              etichetta: `${r.date} · ${config.season} ${periodoLeggibile}`,
              // Solo la data (usata come testo breve).
              dataTesto: r.date,
              distance: r.distance,
              dataOrdine: anno * 10000 + meseNum * 100 + giorno,
            });
          });
        });
      }

      const contenitoreStagioneEl = document.getElementById(
        "tappe-filtro-stagione",
      );
      const contenitoreAnnoEl = document.getElementById("tappe-filtro-anno");

      // Ora ognuno dei due filtri può avere più scelte insieme (prima
      // due <select> con una sola scelta a testa): vedi
      // assets/ui/filtro-multiplo.js. Si può restringere a una sola
      // coppia precisa (solo Primavera 2021), cambiare idea e
      // restringerla a un'altra (solo Estate 2025), oppure lasciarne
      // scelte diverse insieme.
      let filtroStagione = null;
      let filtroAnno = null;

      const stagioniUniche = [...new Set(tutteLeTappe.map((t) => t.stagione))];

      // Il filtro Anno cambia secondo le stagioni scelte:
      //  - Primavera / Estate: gli ANNI solari (2026, 2025 ... 2020);
      //  - Autunno · Inverno, che scavalca due anni: i PERIODI
      //    (2025/2026, 2024/2025 ... 2020/2021);
      //  - più stagioni insieme (o tutte): prima gli anni, poi i periodi.
      // I valori sono diversi ("2025" contro "2025-2026"), quindi non si
      // confondono. Un giro rientra se è selezionato il SUO anno solare
      // oppure il SUO periodo: con tutto selezionato si vede sempre tutto.
      const CHIAVE_AI = "autunno-inverno";
      const eAutunnoInverno = (nome) => CM.chiaveStagione(nome) === CHIAVE_AI;

      // "2025-2026" -> "2025/2026" (solo per come si legge nel filtro).
      const etichettaFiltroAnno = (valore) => valore.replace("-", "/");

      // "popolaAnni.mantieni" tiene i valori già scelti se restano validi;
      // se nessuno resta valido riparte con tutto selezionato.
      // "popolaAnni.preselezionati" sceglie da capo (primo caricamento,
      // per i valori letti dall'indirizzo).
      function popolaAnni(stagioniScelte, opzioniPopola) {
        if (!filtroAnno) return;
        const tutte = !stagioniScelte || !stagioniScelte.length;
        const disponibili = tutte
          ? tutteLeTappe
          : tutteLeTappe.filter((t) => stagioniScelte.includes(t.stagione));
        const conAnni =
          modo !== "classifica" ||
          tutte ||
          stagioniScelte.some((s) => !eAutunnoInverno(s));
        // I periodi (2025/2026) si scelgono solo nella Classifica: in
        // "Giri per anno" il filtro ha soltanto gli anni.
        const conPeriodi =
          modo === "classifica" &&
          (tutte || stagioniScelte.some(eAutunnoInverno));
        const ordinaDesc = (arr) => arr.sort((x, y) => y.localeCompare(x));
        const anni = conAnni
          ? ordinaDesc([...new Set(disponibili.map((t) => String(t.anno)))])
          : [];
        const periodi = conPeriodi
          ? ordinaDesc([
              ...new Set(
                disponibili
                  .filter((t) => eAutunnoInverno(t.stagione))
                  .map((t) => t.periodo),
              ),
            ])
          : [];
        const valoriDisponibili = [...anni, ...periodi];
        opzioniPopola = opzioniPopola || {};
        const voci = valoriDisponibili.map((v) => ({
          value: v,
          label: etichettaFiltroAnno(v),
        }));
        if (opzioniPopola.mantieni) {
          filtroAnno.imposta(voci, { mantieni: true });
          if (!filtroAnno.selezionati().length) filtroAnno.selezionaTutte();
          return;
        }
        const preselezionati = (opzioniPopola.preselezionati || []).filter(
          (v) => valoriDisponibili.includes(v),
        );
        filtroAnno.imposta(voci, {
          preselezionati: preselezionati.length
            ? preselezionati
            : valoriDisponibili,
        });
      }

      aggiornaVistaTappe = function () {
        const inAnni = modo === "anni";
        const stagioniScelte = filtroStagione
          ? filtroStagione.selezionati()
          : [];
        const anniScelti = filtroAnno ? filtroAnno.selezionati() : [];
        // Nessuna scelta su un filtro equivale a "tutte/tutti" per
        // quell'asse: con entrambi i filtri scelti si vede solo
        // l'incrocio esatto (es. solo Primavera 2021 e solo Estate
        // 2025, scegliendo Stagione=[Primavera, Estate] e
        // Anno=[2021, 2025] si vedono anche Primavera 2025 ed Estate
        // 2021 se esistono: per vedere ESATTAMENTE una singola coppia
        // basta lasciare una sola stagione e un solo anno selezionati).
        const perFiltriEsistenti = tutteLeTappe.filter(
          (t) =>
            (!stagioniScelte.length || stagioniScelte.includes(t.stagione)) &&
            (!anniScelti.length ||
              anniScelti.includes(String(t.anno)) ||
              (modo === "classifica" && anniScelti.includes(t.periodo))),
        );
        controlliGiri.aggiornaLimiti(perFiltriEsistenti.map((t) => t.distance));
        const stato = controlliGiri.stato();
        const cercate = CC.cerca(
          perFiltriEsistenti,
          stato.testo,
          (t) =>
            `${t.nomeTesto || t.nome} ${t.stagione} ${t.periodo} ${t.anno}`,
        );
        const filtrate = CC.filtra(cercate, stato, (t) => t.distance);
        // Filtro Stagione e legenda dei colori restano in entrambi i modi.
        if (contenitoreStagioneEl) contenitoreStagioneEl.style.display = "";
        const legendaEl = document.querySelector(".legenda-stagioni");
        if (legendaEl) legendaEl.style.display = "";
        pulsantiModo.forEach((p) => {
          const attivo = p.dataset.modo === modo;
          p.classList.toggle("attivo", attivo);
          p.setAttribute("aria-pressed", attivo ? "true" : "false");
        });
        const podioEl = document.getElementById("podio-tappe");
        const listaEl = document.getElementById("classifica-tappe");
        const annoEl = document.getElementById("giri-per-anno");
        if (podioEl) podioEl.hidden = inAnni;
        if (listaEl) listaEl.hidden = inAnni;
        if (annoEl) annoEl.hidden = !inAnni;
        const testi = {
          eyebrow: inAnni ? "Anno per anno" : "Podio",
          titolo: inAnni
            ? "Tutti i giri, anno per anno"
            : TITOLI_PODIO_GIRI[stato.ordine] || TITOLI_PODIO_GIRI.desc,
          sotto: inAnni
            ? "Ogni anno ha il suo blocco: giri fatti, km totali, media, podio e tutti i giri."
            : "Ogni singola uscita, di ogni stagione e di ogni anno, messe a confronto una per una: non un periodo intero, il giro singolo.",
        };
        [
          ["tappe-podio-eyebrow", testi.eyebrow],
          ["tappe-podio-titolo", testi.titolo],
          ["tappe-podio-sub", testi.sotto],
        ].forEach(([id, testo]) => {
          const el = document.getElementById(id);
          if (el) el.textContent = testo;
        });
        if (titoloSezioneEl) {
          titoloSezioneEl.textContent =
            TITOLI_ORDINE_GIRI[stato.ordine] || TITOLI_ORDINE_GIRI.desc;
        }
        const subEl = document.getElementById("classifica-tappe-sub");
        if (subEl) {
          subEl.textContent =
            "Ogni singola uscita, di ogni stagione e di ogni anno, una per una.";
        }
        // Nella vista per anno l'intestazione "Classifica completa" non
        // serve (i filtri sono già sopra): si nasconde.
        [
          "classifica-tappe-eyebrow",
          "classifica-tappe-titolo-sezione",
          "classifica-tappe-sub",
        ].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.style.display = inAnni ? "none" : "";
        });

        if (inAnni) {
          if (annoEl)
            annoEl.innerHTML = creaGiriPerAnno(filtrate, stato.ordine);
          return;
        }

        // I primi tre dell'elenco, NELL'ORDINE SCELTO e dopo i filtri
        // (stagioni, anni, ricerca, km), hanno il contorno oro/argento/
        // bronzo e sono gli stessi del podio qui sopra: "dal più lungo" i
        // tre più lunghi, "dal meno al più lungo" i tre più corti, e così
        // per alfabetico e data.
        TappePiuLunghe.mostra(
          "podio-tappe",
          "classifica-tappe",
          filtrate,
          undefined,
          stato.ordine,
          { segnaPodio: true, perPosizione: true },
        );

        if (listaEl) {
          const totaleKmGiri = filtrate.reduce((tot, t) => tot + t.distance, 0);
          listaEl.insertAdjacentHTML(
            "beforeend",
            CM.creaRigaTotale(
              totaleKmGiri,
              `${filtrate.length} ${pluralizza(filtrate.length, "giro", "giri")}`,
            ),
          );
        }
      };

      // Come nelle altre schede, ?stagione= e ?anno= nell'URL accettano
      // ora anche più valori separati da virgola, restando compatibili
      // con un valore solo scritto come prima.
      // Senza uno dei due parametri nell'indirizzo si parte con TUTTE
      // le opzioni di quel filtro già selezionate automaticamente.
      const parametriUrl = new URLSearchParams(window.location.search);
      const stagioneUrlGrezza = parametriUrl.get("stagione");
      // ?anno=2025,2026 (o il vecchio ?anni=...): anni solari, oppure
      // periodi scritti 2025-2026 / 2025/2026 per Autunno · Inverno.
      const annoUrlGrezzo =
        parametriUrl.get("anno") || parametriUrl.get("anni");
      const anniDaUrlGrezzi =
        annoUrlGrezzo && annoUrlGrezzo !== "tutti"
          ? annoUrlGrezzo
              .split(",")
              .map((a) => a.trim().replace(/\s*[/–]\s*/, "-"))
              .map((a) => a.replace(/\s*-\s*/, "-"))
              .filter((a) => /^\d{4}(-\d{4})?$/.test(a))
          : null;
      // Un periodo (2020-2021) esiste solo in Autunno · Inverno: se
      // l'indirizzo ne cita uno senza dire la stagione, la stagione è
      // quella.
      const haPeriodiNellUrl =
        !!anniDaUrlGrezzi && anniDaUrlGrezzi.some((a) => a.includes("-"));
      const stagioneDaUrlEffettiva =
        stagioneUrlGrezza ||
        (haPeriodiNellUrl && modo === "classifica"
          ? stagioniUniche.find((s) => CM.chiaveStagione(s) === CHIAVE_AI)
          : null);
      const stagioniDaUrl = CM.stagioniDaParametro(
        stagioneDaUrlEffettiva,
        stagioniUniche,
      );

      if (contenitoreStagioneEl && window.FiltroMultiplo) {
        filtroStagione = window.FiltroMultiplo.crea(contenitoreStagioneEl, {
          etichetta: "Stagione",
          tutte: "Tutte",
          onCambia: (stagioni) => {
            // Cambiare le stagioni scelte ridisegna anche l'elenco
            // degli anni proposti, tenendo quelli già scelti se
            // restano validi per le nuove stagioni.
            popolaAnni(stagioni, { mantieni: true });
            aggiornaVistaTappe();
          },
        });
        filtroStagione.imposta(
          stagioniUniche.map((s) => ({ value: s, label: s })),
          { preselezionati: stagioniDaUrl },
        );
      }

      if (contenitoreAnnoEl && window.FiltroMultiplo) {
        filtroAnno = window.FiltroMultiplo.crea(contenitoreAnnoEl, {
          etichetta: "Anno",
          tutte: "Tutti",
          onCambia: () => aggiornaVistaTappe(),
        });
      }

      popolaAnni(filtroStagione ? filtroStagione.selezionati() : [], {
        preselezionati: anniDaUrlGrezzi,
      });

      alCambioModo = () =>
        popolaAnni(filtroStagione ? filtroStagione.selezionati() : [], {
          mantieni: true,
        });

      // "Azzera pulsanti": tutte le stagioni e tutti gli anni.
      ripristinaFiltriGiri = () => {
        if (filtroStagione) filtroStagione.selezionaTutte();
        popolaAnni(filtroStagione ? filtroStagione.selezionati() : [], {});
      };

      aggiornaVistaTappe();
    } catch (error) {
      console.error(`Errore nel caricamento dei giri: ${error}`);
      const listaTappeEl = document.getElementById("classifica-tappe");
      if (listaTappeEl)
        listaTappeEl.innerHTML =
          '<li class="errore-grafico">Non è stato possibile caricare i giri.</li>';
    }
  };
})(window.ClassificaMesi);
