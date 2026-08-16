// ============================================================
// stagioni.js — Somma i chilometri di ogni stagione su tutti gli
// anni e le ordina dalla più pedalata alla meno pedalata.
//
// Stessa fonte dati della pagina "Confronto tra le stagioni"
// (Statistiche/stagioni.html): json/Statistiche/anni/stagioni/
// stagioni.json elenca, per ognuna delle tre stagioni, il file di
// ogni periodo (anno); ogni file è un elenco di corse con
// {distance: ...}.
//
// Il nome da mostrare (displayName) e il link alla pagina della
// stagione (link) vivono ormai dentro stagioni.json, una voce per
// stagione: prima erano due oggetti fissi qui nel JS
// (NOMI_STAGIONI e LINK_STAGIONI), spostati nel JSON perché sono
// dati, non logica.
//
// Dipendenze: JS/json.js
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  function sommaDistanze(corse) {
    if (!Array.isArray(corse)) return 0;
    return corse.reduce((tot, corsa) => tot + (corsa.distance || 0), 0);
  }

  // Ordine di calendario delle stagioni (Primavera → Estate →
  // Autunno/Inverno), usato solo per l'ordinamento "Più recente"/
  // "Meno recente": le tre stagioni non hanno una data propria (sono
  // il totale di tutti gli anni), quindi "cronologico" qui significa
  // l'ordine in cui si susseguono nell'anno, non un anno preciso.
  const ORDINE_CALENDARIO_STAGIONI = { Primavera: 0, Estate: 1, Autunno_Inverno: 2 };

  // Una riga per stagione: { stagione, km, periodi, kmMedi, percentuale }
  // periodi = in quanti anni diversi è stata pedalata quella stagione.
  CM.calcolaStagioni = async function () {
    const stagioniJson = await Json.leggiOppureNull(
      "json/Statistiche/anni/stagioni/stagioni.json",
    );
    if (!stagioniJson || !Array.isArray(stagioniJson.seasons)) return [];

    const righe = await Promise.all(
      stagioniJson.seasons.map(async (stagione) => {
        const percorsi = Object.values(stagione.subPeriods || {});
        const periodi = percorsi.length;

        // Stesso "correttivo" già usato in Statistiche/js/stagioni.js:
        // i percorsi in stagioni.json non hanno il prefisso "../", qui
        // si aggiunge per restare coerenti con quella pagina.
        const datiPeriodi = await Promise.all(
          percorsi.map((percorso) => {
            const corretto = percorso.startsWith("../")
              ? percorso
              : `../${percorso}`;
            return Json.leggiOppureNull(corretto);
          }),
        );

        const km = datiPeriodi.reduce(
          (tot, corse) => tot + sommaDistanze(corse),
          0,
        );

        return {
          stagione: stagione.displayName || stagione.name,
          link: stagione.link || "#",
          km,
          periodi,
          kmMedi: periodi > 0 ? km / periodi : 0,
          ordineCalendario: ORDINE_CALENDARIO_STAGIONI[stagione.name] ?? 0,
        };
      }),
    );

    const totale = righe.reduce((tot, r) => tot + r.km, 0);
    righe.forEach((r) => {
      r.percentuale = totale > 0 ? (r.km / totale) * 100 : 0;
    });

    righe.sort((a, b) => b.km - a.km);
    return righe;
  };

  // Chiave cronologica di un periodo: anno di inizio del periodo * 10
  // + l'ordine della stagione nell'anno (0=Primavera, 1=Estate,
  // 2=Autunno/Inverno). Serve perché confrontare solo l'anno (con
  // parseInt) non basta: "Primavera 2026" ed "Estate 2026" avrebbero
  // altrimenti la STESSA chiave (2026) e "Più recente"/"Meno recente"
  // non saprebbe quale mettere prima. Con questa chiave invece:
  //   Estate 2025 (20251) < Autunno_Inverno 2025-2026 (20252)
  //   < Primavera 2026 (20260) < Estate 2026 (20261) < ...
  // cioè l'Autunno/Inverno a cavallo fra due anni viene dopo l'Estate
  // dell'anno in cui inizia e prima della Primavera dell'anno in cui
  // finisce, esattamente come nel calendario vero.
  function ordineCronologicoPeriodo(nomeGrezzoStagione, etichettaPeriodo) {
    const indiceStagione = ORDINE_CALENDARIO_STAGIONI[nomeGrezzoStagione] ?? 0;
    const annoInizio = parseInt(etichettaPeriodo, 10) || 0;
    return annoInizio * 10 + indiceStagione;
  }

  // Una riga per OGNI periodo, non per stagione: "Estate 2020",
  // "Autunno · Inverno 2020-2021", ecc. Così si può confrontare un
  // singolo periodo completo con un altro, anche di stagioni diverse.
  CM.calcolaPeriodi = async function () {
    const stagioniJson = await Json.leggiOppureNull(
      "json/Statistiche/anni/stagioni/stagioni.json",
    );
    if (!stagioniJson || !Array.isArray(stagioniJson.seasons)) return [];

    const righe = [];

    await Promise.all(
      stagioniJson.seasons.map(async (stagione) => {
        const nomeStagione = stagione.displayName || stagione.name;
        const voci = Object.entries(stagione.subPeriods || {});

        await Promise.all(
          voci.map(async ([etichettaPeriodo, percorso]) => {
            const corretto = percorso.startsWith("../")
              ? percorso
              : `../${percorso}`;
            const corse = await Json.leggiOppureNull(corretto);
            righe.push({
              nome: `${nomeStagione} ${etichettaPeriodo}`,
              stagione: nomeStagione,
              periodo: etichettaPeriodo,
              // Pagina di quel periodo esatto (es. ../../Estate/2022.html,
              // ../../Autunno_Inverno/2024-2025.html): la cartella ha
              // sempre lo stesso nome della chiave grezza della stagione.
              link: `../../${stagione.name}/${etichettaPeriodo}.html`,
              km: sommaDistanze(corse),
              ordineCronologico: ordineCronologicoPeriodo(
                stagione.name,
                etichettaPeriodo,
              ),
            });
          }),
        );
      }),
    );

    const totale = righe.reduce((tot, r) => tot + r.km, 0);
    righe.forEach((r) => {
      r.percentuale = totale > 0 ? (r.km / totale) * 100 : 0;
    });

    righe.sort((a, b) => b.km - a.km);
    return { righe, totale };
  };
})(window.ClassificaMesi);
