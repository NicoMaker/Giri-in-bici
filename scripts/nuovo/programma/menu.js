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
const { mostraElenco } = require("./elenco");
const { conferma } = require("./riepilogo");
const { casi } = require("./casi.json");

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
    ? casi.find((c) => c.id === "giro")
    : await scegli("Cosa vuoi fare?", [
        ...casi.map(({ id, tasto, testo }) => ({ id, tasto, testo })),
        { id: "esci", tasto: 0, testo: "Esci" },
      ]);
  if (azione.id === "esci") return;

  if (azione.id === "elenco") {
    await mostraElenco(new Piano());
    return;
  }

  const piano = new Piano();

  if (azione.id === "giro") {
    await applicaGiro(piano, await raccogliGiro(piano));
  } else if (azione.id === "foto") {
    applicaFoto(piano, await raccogliFoto(piano));
  } else if (azione.id === "mese") {
    applicaMese(piano, await raccogliMese(piano));
  } else if (azione.id === "stagione") {
    const s = await scegli(
      "Quale stagione?",
      Object.entries(STAGIONI).map(([chiave, v]) => ({
        chiave,
        testo: v.etichetta,
      })),
    );
    applicaStagione(piano, await raccogliStagione(piano, s.chiave));
  } else if (azione.id === "anno") {
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
