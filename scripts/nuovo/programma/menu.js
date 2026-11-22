"use strict";

// Programma: il menu e l'avvio.

const fs = require("fs");
const path = require("path");
const { applicaAnno, raccogliAnno } = require("../azioni/anno");
const { applicaFoto, raccogliFoto } = require("../azioni/foto-stagione");
const { applicaGiro, raccogliGiro } = require("../azioni/giro");
const { applicaMese, raccogliMese } = require("../azioni/mese");
const { applicaStagione, raccogliStagione } = require("../azioni/stagione");
const {
  MODO_GIRO,
  PERCORSO_STORICO_JSON,
  PROVA,
  RADICE,
  STAGIONI,
} = require("../base/impostazioni");
const { Piano } = require("../base/piano");
const {
  Uscita,
  chiediValido,
  giallo,
  grassetto,
  grigio,
  rl,
  rosso,
  scegli,
} = require("../base/terminale");
const { leggiJson, ordinaPeriodi, validaPeriodo } = require("../base/utilita");
const { conferma } = require("./riepilogo");

const principale = async () => {
  if (
    !fs.existsSync(path.join(RADICE, "json/Statistiche/History/Storico.json"))
  ) {
    console.error(rosso(`Non sembra la cartella di Giri in Bici: ${RADICE}`));
    process.exit(1);
  }

  console.log(grassetto("\n🚴 Giri in Bici — aggiornamento guidato"));
  console.log(
    grigio(`Cartella: ${RADICE}${PROVA ? "  (modalità --prova)" : ""}`),
  );

  const azione = MODO_GIRO
    ? { tasto: 1 }
    : await scegli("Cosa vuoi fare?", [
        {
          tasto: 1,
          testo:
            "Aggiungere un GIRO (data, stagione, luogo, link, km → aggiorna giri, km del mese e corse)",
        },
        {
          tasto: 2,
          testo:
            "Aggiungere o correggere un MESE di un anno (lo crea se non c'è)",
        },
        {
          tasto: 3,
          testo:
            "Aggiungere FOTO a una stagione già esistente (indichi la cartella)",
        },
        {
          tasto: 4,
          testo:
            "Creare una nuova STAGIONE (Primavera, Estate o Autunno-Inverno)",
        },
        { tasto: 5, testo: "Creare un nuovo ANNO di Statistiche" },
        {
          tasto: 6,
          testo:
            "Creare un nuovo anno COMPLETO (Statistiche + Primavera + Estate + Autunno-Inverno)",
        },
        { tasto: 0, testo: "Esci" },
      ]);
  if (azione.tasto === 0) return;

  const piano = new Piano();

  if (azione.tasto === 1) {
    await applicaGiro(piano, await raccogliGiro(piano));
  } else if (azione.tasto === 3) {
    applicaFoto(piano, await raccogliFoto(piano));
  } else if (azione.tasto === 2) {
    applicaMese(piano, await raccogliMese(piano));
  } else if (azione.tasto === 4) {
    const s = await scegli(
      "Quale stagione?",
      Object.entries(STAGIONI).map(([chiave, v]) => ({
        chiave,
        testo: v.etichetta,
      })),
    );
    applicaStagione(piano, await raccogliStagione(piano, s.chiave));
  } else if (azione.tasto === 5) {
    applicaAnno(piano, await raccogliAnno(piano));
  } else {
    const storico = leggiJson(piano, PERCORSO_STORICO_JSON);
    const ultimo = Object.keys(storico.anni).sort(ordinaPeriodi).pop();
    const anno = await chiediValido(
      "Anno da creare",
      String(parseInt(ultimo, 10) + 1),
      validaPeriodo("anno", Object.keys(storico.anni)),
    );
    const n = parseInt(anno, 10);
    applicaAnno(piano, await raccogliAnno(piano, { anno }));
    applicaStagione(
      piano,
      await raccogliStagione(piano, "Primavera", { periodo: String(n) }),
    );
    applicaStagione(
      piano,
      await raccogliStagione(piano, "Estate", { periodo: String(n) }),
    );
    applicaStagione(
      piano,
      await raccogliStagione(piano, "Autunno_Inverno", {
        periodo: `${n}-${n + 1}`,
      }),
    );
  }

  await conferma(piano);
};

principale()
  .catch((e) => {
    if (e instanceof Uscita) {
      console.log(giallo("\nInterrotto: non è stato scritto nessun file."));
    } else {
      console.error(rosso(`\n✖ ${e.message}`));
      console.error(grigio("Non è stato scritto nessun file."));
      process.exitCode = 1;
    }
  })
  .finally(() => rl.close());
