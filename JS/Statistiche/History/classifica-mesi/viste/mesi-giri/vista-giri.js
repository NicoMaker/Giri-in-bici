// ============================================================
// vista-giri.js — Scheda "Giri" (i percorsi più lunghi) della
// pagina Classifica dei mesi.
//
// Dati letti direttamente da json/Estate/estate.json,
// json/Primavera/primavera.json e
// json/Autunno_Inverno/autunno-inverno.json (e dai rispettivi
// sottoperiodi), indipendenti dal resto della pagina.
//
// Dipendenze: JS/json.js, JS/utils.js, History/comune/config-mesi.js,
//             assets/tappe-piu-lunghe.js, assets/classifica-controlli.js
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  CM.avviaVistaGiri = async function () {
    const CC = window.ClassificaControlli;

    const controlliGiri = CC.crea(document.getElementById("controlli-giri"), {
      onCambia: () => aggiornaVistaTappe(),
    });

    let aggiornaVistaTappe = () => {};

    if (!window.TappePiuLunghe) return;

    try {
      const configStagioni = [
        "json/Estate/estate.json",
        "json/Primavera/primavera.json",
        "json/Autunno_Inverno/autunno-inverno.json",
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
        filtroAnno.imposta(
          anniDisponibili.map((a) => ({ value: a, label: a })),
          opzioniPopola,
        );
      }

      aggiornaVistaTappe = function () {
        const stagioniScelte = filtroStagione ? filtroStagione.selezionati() : [];
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
          (t) => `${t.nomeTesto || t.nome} ${t.stagione} ${t.periodo}`,
        );
        const filtrate = CC.filtra(cercate, stato, (t) => t.distance);

        TappePiuLunghe.mostra(
          "podio-tappe",
          "classifica-tappe",
          filtrate,
          undefined,
          stato.ordine,
        );

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

      // Come nelle altre schede, ?stagione= e ?anno= nell'URL accettano
      // ora anche più valori separati da virgola, restando compatibili
      // con un valore solo scritto come prima.
      const parametriUrl = new URLSearchParams(window.location.search);
      const stagioniDaUrl = (parametriUrl.get("stagione") || "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => stagioniUniche.includes(s));
      const anniDaUrlGrezzi = (parametriUrl.get("anno") || "")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

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
