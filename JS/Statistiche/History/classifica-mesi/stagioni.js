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
