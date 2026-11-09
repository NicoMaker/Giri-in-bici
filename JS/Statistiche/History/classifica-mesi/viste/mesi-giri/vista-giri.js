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
//   - il podio dei tre giri più lunghi di ogni anno;
//   - "Dentro ogni anno": elenco unico oppure raggruppato per stagione.
// In entrambi i modi ogni giro ha il colore della SUA stagione:
// verde = Primavera, arancione = Estate, blu = Autunno - Inverno
// (data-stagione sulle righe/gradini, stili in classifica-mesi.css).
// Ricerca, ordine, km, Stagione e Anno valgono per entrambi i modi.
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

  // ---------- Vista "Giri per anno": stato dei filtri extra ----------
  const extra = {
    anni: new Set(), // anni solari scelti (vuoto = tutti)
    raggruppa: "elenco", // "elenco" | "stagione"
    posti: [""],
    date: [{ da: "", a: "" }],
    km: [{ min: "", max: "" }],
  };

  function normalizza(testo) {
    return String(testo || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // "2024-03-05" -> 20240305 (come dataOrdine dei giri); 0 se vuota.
  function numeroData(valore) {
    const m = String(valore || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? +m[1] * 10000 + +m[2] * 100 + +m[3] : 0;
  }

  function passaFiltriExtra(t) {
    if (extra.anni.size && !extra.anni.has(t.anno)) return false;

    const posti = extra.posti.map(normalizza).filter(Boolean);
    if (posti.length) {
      const nome = normalizza(t.nomeTesto || t.nome);
      if (!posti.some((p) => nome.includes(p))) return false;
    }

    const date = extra.date
      .map((r) => ({ da: numeroData(r.da), a: numeroData(r.a) }))
      .filter((r) => r.da || r.a);
    if (
      date.length &&
      !date.some(
        (r) =>
          (!r.da || t.dataOrdine >= r.da) && (!r.a || t.dataOrdine <= r.a),
      )
    ) {
      return false;
    }

    const km = extra.km
      .map((r) => ({ min: parseFloat(r.min), max: parseFloat(r.max) }))
      .filter((r) => !isNaN(r.min) || !isNaN(r.max));
    if (
      km.length &&
      !km.some(
        (r) =>
          (isNaN(r.min) || t.distance >= r.min) &&
          (isNaN(r.max) || t.distance <= r.max),
      )
    ) {
      return false;
    }
    return true;
  }

  // Disegna il pannello (anni, ricerca avanzata, raggruppamento) dentro
  // #giri-anno-pannello. "ridisegna" ricalcola la vista. Restituisce i
  // due ripristini usati dal reset a tre vie.
  function montaPannelloAnni(anniDisponibili, ridisegna) {
    const selettore = document.getElementById("giri-anno-selettore");
    const pannello = document.getElementById("giri-anno-pannello");
    if (!pannello) return { ripristinaPulsanti() {}, ripristinaRicerca() {} };

    function disegnaAnni() {
      if (!selettore) return;
      const tutti = extra.anni.size === 0;
      selettore.innerHTML =
        `<button type="button" class="classifica-ordine__pulsante${tutti ? " attivo" : ""}" data-anno="tutti" aria-pressed="${tutti}">Tutti gli anni</button>` +
        anniDisponibili
          .map((a) => {
            const on = extra.anni.has(a);
            return `<button type="button" class="classifica-ordine__pulsante${on ? " attivo" : ""}" data-anno="${a}" aria-pressed="${on}">${a}</button>`;
          })
          .join("");
    }
    if (selettore) {
      selettore.addEventListener("click", (e) => {
        const b = e.target.closest("[data-anno]");
        if (!b) return;
        if (b.dataset.anno === "tutti") extra.anni.clear();
        else {
          const a = +b.dataset.anno;
          if (extra.anni.has(a)) extra.anni.delete(a);
          else extra.anni.add(a);
        }
        disegnaAnni();
        ridisegna();
      });
    }

    // Righe "o questo o quello" dei tre gruppi di ricerca avanzata.
    const GRUPPI = {
      posti: {
        vuota: () => "",
        html: (v, i) =>
          `<input type="text" data-campo="${i}" value="${String(v).replace(/"/g, "&quot;")}" placeholder="Nome del posto" aria-label="Posto ${i + 1}" />`,
        leggi: (riga, i) => riga.querySelector("input").value,
      },
      date: {
        vuota: () => ({ da: "", a: "" }),
        html: (v, i) =>
          `<input type="date" data-k="da" value="${v.da}" aria-label="Dal" /><span class="giri-riga__sep">→</span><input type="date" data-k="a" value="${v.a}" aria-label="Al" />`,
        leggi: (riga) => ({
          da: riga.querySelector('[data-k="da"]').value,
          a: riga.querySelector('[data-k="a"]').value,
        }),
      },
      km: {
        vuota: () => ({ min: "", max: "" }),
        html: (v, i) =>
          `<input type="number" min="0" inputmode="numeric" data-k="min" value="${v.min}" placeholder="min km" aria-label="Km minimi" /><span class="giri-riga__sep">→</span><input type="number" min="0" inputmode="numeric" data-k="max" value="${v.max}" placeholder="max km" aria-label="Km massimi" />`,
        leggi: (riga) => ({
          min: riga.querySelector('[data-k="min"]').value,
          max: riga.querySelector('[data-k="max"]').value,
        }),
      },
    };

    function disegnaRighe(gruppo) {
      const cont = pannello.querySelector(`[data-righe="${gruppo}"]`);
      if (!cont) return;
      const g = GRUPPI[gruppo];
      cont.innerHTML = extra[gruppo]
        .map(
          (v, i) =>
            `<div class="giri-riga" data-i="${i}">${g.html(v, i)}${
              extra[gruppo].length > 1
                ? '<button type="button" class="giri-riga__togli" data-togli aria-label="Togli questa riga">×</button>'
                : ""
            }</div>`,
        )
        .join("");
    }

    ["posti", "date", "km"].forEach((gruppo) => {
      const cont = pannello.querySelector(`[data-righe="${gruppo}"]`);
      if (!cont) return;
      cont.addEventListener("input", (e) => {
        const riga = e.target.closest(".giri-riga");
        if (!riga) return;
        extra[gruppo][+riga.dataset.i] = GRUPPI[gruppo].leggi(riga);
        ridisegna();
      });
      cont.addEventListener("click", (e) => {
        if (!e.target.closest("[data-togli]")) return;
        const riga = e.target.closest(".giri-riga");
        extra[gruppo].splice(+riga.dataset.i, 1);
        if (!extra[gruppo].length) extra[gruppo].push(GRUPPI[gruppo].vuota());
        disegnaRighe(gruppo);
        ridisegna();
      });
    });

    pannello.querySelectorAll("[data-aggiungi]").forEach((b) => {
      b.addEventListener("click", () => {
        const gruppo = b.dataset.aggiungi;
        extra[gruppo].push(GRUPPI[gruppo].vuota());
        disegnaRighe(gruppo);
        const campi = pannello.querySelectorAll(
          `[data-righe="${gruppo}"] .giri-riga:last-child input`,
        );
        if (campi[0]) campi[0].focus();
      });
    });

    const pulsantiRaggruppa = pannello.querySelectorAll("[data-raggruppa]");
    function evidenziaRaggruppa() {
      pulsantiRaggruppa.forEach((b) => {
        const on = b.dataset.raggruppa === extra.raggruppa;
        b.classList.toggle("attivo", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    pulsantiRaggruppa.forEach((b) =>
      b.addEventListener("click", () => {
        extra.raggruppa = b.dataset.raggruppa;
        evidenziaRaggruppa();
        ridisegna();
      }),
    );

    disegnaAnni();
    ["posti", "date", "km"].forEach(disegnaRighe);
    evidenziaRaggruppa();

    return {
      // "Solo pulsanti": anni, date e chilometri (il raggruppamento è
      // un modo di vedere, non un filtro, e resta com'è).
      ripristinaPulsanti() {
        extra.anni.clear();
        extra.date = [GRUPPI.date.vuota()];
        extra.km = [GRUPPI.km.vuota()];
        disegnaAnni();
        disegnaRighe("date");
        disegnaRighe("km");
      },
      // "Solo ricerca": i posti scritti.
      ripristinaRicerca() {
        extra.posti = [GRUPPI.posti.vuota()];
        disegnaRighe("posti");
      },
    };
  }

  // Nome della stagione (come in generale.json) -> chiave dei colori.
  function classeStagione(nome) {
    const n = String(nome || "").toLowerCase();
    if (n.includes("primavera")) return "primavera";
    if (n.includes("estate")) return "estate";
    return "autunno-inverno";
  }

  const ETICHETTE_STAGIONE = {
    primavera: "Primavera",
    estate: "Estate",
    "autunno-inverno": "Autunno · Inverno",
  };

  function piuLungo(righe) {
    return righe.reduce((m, r) => (!m || r.distance > m.distance ? r : m), null);
  }

  // Un blocco per ogni anno solare, con tutti i giri di quell'anno.
  // L'anno più recente per primo, tranne con "Meno recente" (data-vecchio).
  function creaGiriPerAnno(righe, ordine, raggruppa) {
    if (!righe.length) {
      return '<p class="errore-grafico">Nessun giro corrisponde ai filtri scelti.</p>';
    }
    const perAnno = new Map();
    righe.forEach((r) => {
      if (!perAnno.has(r.anno)) perAnno.set(r.anno, []);
      perAnno.get(r.anno).push(r);
    });
    const anni = [...perAnno.keys()].sort((a, b) => a - b);
    if (ordine !== "data-vecchio") anni.reverse();

    const indice =
      '<nav class="giri-anno__indice" aria-label="Vai all\'anno">' +
      anni
        .map((a) => `<a href="#giri-anno-${a}">${a}</a>`)
        .join("") +
      "</nav>";

    const blocchi = anni.map((anno) => {
      const giri = perAnno.get(anno);
      const km = giri.reduce((t, r) => t + r.distance, 0);
      const media = giri.length ? km / giri.length : 0;
      const lungo = piuLungo(giri);
      const perStagione = Object.keys(ETICHETTE_STAGIONE)
        .map((chiave) => {
          const di = giri.filter((r) => r.stagioneClasse === chiave);
          if (!di.length) return "";
          const kmS = di.reduce((t, r) => t + r.distance, 0);
          return `<li class="giri-anno__chip" data-stagione="${chiave}">${ETICHETTE_STAGIONE[chiave]} · ${di.length} ${pluralizza(di.length, "giro", "giri")} · ${formatItalianNumber(kmS)} km</li>`;
        })
        .join("");
      const ordinate = TappePiuLunghe.ordina(giri, ordine);
      return `
        <section class="giri-anno" id="giri-anno-${anno}">
          <header class="giri-anno__testa">
            <h3 class="giri-anno__titolo">${anno}</h3>
            <dl class="giri-anno__dati">
              <div><dt>Giri</dt><dd>${giri.length}</dd></div>
              <div><dt>Km totali</dt><dd>${formatItalianNumber(km)} km</dd></div>
              <div><dt>Media</dt><dd>${formatItalianNumber(Math.round(media * 10) / 10)} km</dd></div>
              <div><dt>Più lungo</dt><dd>${formatItalianNumber(lungo.distance)} km</dd></div>
            </dl>
            <ul class="giri-anno__stagioni">${perStagione}</ul>
          </header>
          <div class="giri-anno__podio">
            <p class="giri-anno__podio-titolo">I ${Math.min(3, giri.length)} ${pluralizza(Math.min(3, giri.length), "giro più lungo", "giri più lunghi")} del ${anno}</p>
            <div class="podio">${TappePiuLunghe.creaPodio(TappePiuLunghe.ordina(giri, "desc"), km)}</div>
          </div>
          ${
            raggruppa === "stagione"
              ? Object.keys(ETICHETTE_STAGIONE)
                  .map((chiave) => {
                    const di = giri.filter((r) => r.stagioneClasse === chiave);
                    if (!di.length) return "";
                    const kmS = di.reduce((t, r) => t + r.distance, 0);
                    return `<div class="giri-anno__gruppo" data-stagione="${chiave}">
                      <h4 class="giri-anno__gruppo-titolo">${ETICHETTE_STAGIONE[chiave]}<span>${di.length} ${pluralizza(di.length, "giro", "giri")} · ${formatItalianNumber(kmS)} km</span></h4>
                      <ol class="classifica-lista giri-anno__lista">${TappePiuLunghe.creaLista(TappePiuLunghe.ordina(di, ordine), km)}</ol>
                    </div>`;
                  })
                  .join("")
              : `<ol class="classifica-lista giri-anno__lista">${TappePiuLunghe.creaLista(ordinate, km)}</ol>`
          }
        </section>`;
    });

    const totaleKm = righe.reduce((t, r) => t + r.distance, 0);
    const totale = `<ol class="classifica-lista giri-anno__lista giri-anno__lista--totale">${CM.creaRigaTotale(
      totaleKm,
      `${righe.length} ${pluralizza(righe.length, "giro", "giri")} in ${anni.length} ${pluralizza(anni.length, "anno", "anni")}`,
    )}</ol>`;
    return indice + blocchi.join("") + totale;
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
    let ripristinaRicercaGiri = () => {};
    const controlliGiri = CC.crea(document.getElementById("controlli-giri"), {
      onCambia: () => aggiornaVistaTappe(),
      ripristinaFiltri: () => ripristinaFiltriGiri(),
      ripristinaRicerca: () => ripristinaRicercaGiri(),
    });

    let aggiornaVistaTappe = () => {};

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
            tutteLeTappe.push({
              nome: info.nome,
              nomeTesto: info.nomeTesto,
              href: info.href,
              linkMultipli: info.linkMultipli,
              stagione: config.season,
              stagioneClasse: classeStagione(config.season),
              anno,
              periodo: etichettaPeriodo,
              etichetta: `${r.date} · ${config.season} ${etichettaPeriodo}`,
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

      // Gli anni proposti nel secondo filtro dipendono dalle stagioni
      // scelte nel primo: senza nessuna stagione selezionata si vedono
      // gli anni di TUTTE le stagioni insieme (prima invece, senza una
      // stagione scelta, il filtro Anno restava bloccato su "Tutti" —
      // ora invece si può anche restringere solo per anno, senza per
      // forza passare prima dalla stagione). "opzioniPopola.mantieni"
      // tiene un anno già scelto se resta valido nella nuova lista;
      // "opzioniPopola.preselezionati" sceglie da capo (usato solo al
      // primo caricamento, per gli anni letti dall'URL).
      function popolaAnni(stagioniScelte, opzioniPopola) {
        if (!filtroAnno) return;
        const disponibili =
          stagioniScelte && stagioniScelte.length
            ? tutteLeTappe.filter((t) => stagioniScelte.includes(t.stagione))
            : tutteLeTappe;
        const anniDisponibili = [
          ...new Set(disponibili.map((t) => t.periodo)),
        ].sort((a, b) => b.localeCompare(a));
        opzioniPopola = opzioniPopola || {};
        // Nessun anno scelto esplicitamente (né dall'URL né da tenere)
        // equivale a partire con TUTTI gli anni disponibili già
        // selezionati automaticamente, uno per uno.
        if (opzioniPopola.preselezionati == null && !opzioniPopola.mantieni) {
          opzioniPopola = {
            ...opzioniPopola,
            preselezionati: anniDisponibili,
          };
        }
        filtroAnno.imposta(
          anniDisponibili.map((a) => ({ value: a, label: a })),
          opzioniPopola,
        );
      }

      aggiornaVistaTappe = function () {
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
            (!anniScelti.length || anniScelti.includes(t.periodo)),
        );
        controlliGiri.aggiornaLimiti(perFiltriEsistenti.map((t) => t.distance));
        const stato = controlliGiri.stato();
        const cercate = CC.cerca(
          perFiltriEsistenti,
          stato.testo,
          (t) => `${t.nomeTesto || t.nome} ${t.stagione} ${t.periodo} ${t.anno}`,
        );
        const filtrateBase = CC.filtra(cercate, stato, (t) => t.distance);
        const inAnni = modo === "anni";
        // Nella vista per anno valgono anche anni, posti, date e km extra.
        const filtrate = inAnni
          ? filtrateBase.filter(passaFiltriExtra)
          : filtrateBase;
        const pannelloEl = document.getElementById("giri-anno-pannello");
        if (pannelloEl) pannelloEl.hidden = !inAnni;
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
            : "I tre giri più lunghi di sempre",
          sotto: inAnni
            ? "Ogni anno solare ha il suo blocco con podio e tutti i giri: data, posto, percorso, stagione, chilometri e quota sul totale dell'anno."
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
          titoloSezioneEl.textContent = inAnni
            ? "Giri per anno, con tutti i dati"
            : TITOLI_ORDINE_GIRI[stato.ordine] || TITOLI_ORDINE_GIRI.desc;
        }

        const subEl = document.getElementById("classifica-tappe-sub");
        if (subEl) {
          subEl.textContent = inAnni
            ? "Un blocco per ogni anno, dal più recente: dentro, podio dei tre giri più lunghi e tutti i giri con il colore della loro stagione."
            : "Ogni singola uscita, di ogni stagione e di ogni anno, una per una.";
        }

        if (inAnni) {
          if (annoEl) annoEl.innerHTML = creaGiriPerAnno(filtrate, stato.ordine, extra.raggruppa);
          return;
        }

        TappePiuLunghe.mostra(
          "podio-tappe",
          "classifica-tappe",
          filtrate,
          undefined,
          stato.ordine,
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
      const stagioniDaUrl = stagioneUrlGrezza
        ? stagioneUrlGrezza
            .split(",")
            .map((s) => s.trim())
            .filter((s) => stagioniUniche.includes(s))
        : stagioniUniche;
      const annoUrlGrezzo = parametriUrl.get("anno");
      const anniDaUrlGrezzi = annoUrlGrezzo
        ? annoUrlGrezzo
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : null;

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

      // "Azzera pulsanti": tutte le stagioni e, di conseguenza, tutti i
      // loro anni selezionati (lo stato di quando si apre la scheda).
      const anniSolari = [...new Set(tutteLeTappe.map((t) => t.anno))]
        .filter(Boolean)
        .sort((a, b) => b - a);
      const annoUrl = new URLSearchParams(window.location.search).get("anni");
      if (annoUrl && annoUrl !== "tutti") {
        annoUrl
          .split(",")
          .map((x) => parseInt(x, 10))
          .filter((x) => anniSolari.includes(x))
          .forEach((x) => extra.anni.add(x));
      }
      const pannelloAnni = montaPannelloAnni(anniSolari, () =>
        aggiornaVistaTappe(),
      );

      ripristinaFiltriGiri = () => {
        if (filtroStagione) filtroStagione.selezionaTutte();
        popolaAnni(filtroStagione ? filtroStagione.selezionati() : [], {});
        pannelloAnni.ripristinaPulsanti();
      };
      ripristinaRicercaGiri = () => pannelloAnni.ripristinaRicerca();

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
