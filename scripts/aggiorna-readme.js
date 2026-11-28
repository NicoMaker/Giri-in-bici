#!/usr/bin/env node
/*
 * aggiorna-readme.js — riscrive da solo la sezione "Aggiornare i Dati JSON" del readme.md
 * (stagione, anno, mese, percorsi e numeri) partendo dalla data di oggi e dai JSON.
 *
 * Uso (dalla cartella principale del progetto):
 *     node scripts/aggiorna-readme.js              aggiorna il readme se serve
 *     node scripts/aggiorna-readme.js --controlla  non scrive: esce con errore se è da aggiornare
 *     node scripts/aggiorna-readme.js --stampa     mostra la sezione senza scrivere
 *     node scripts/aggiorna-readme.js --radice=/percorso/Giri-in-bici
 *
 * Parte da sola anche all'avvio del gestionale e dopo ogni salvataggio.
 */
"use strict";

const {
  aggiornaReadme,
  raccogliDati,
  sezione,
} = require("./nuovo/base/readme-automatico");

const argomenti = process.argv.slice(2);

try {
  if (argomenti.includes("--stampa")) {
    console.log(sezione(raccogliDati()));
  } else {
    const soloControllo = argomenti.includes("--controlla");
    const { cambiato } = aggiornaReadme({ soloControllo });
    if (soloControllo) {
      console.log(
        cambiato
          ? "❌ Il readme è da aggiornare."
          : "✅ Il readme è già aggiornato.",
      );
      process.exit(cambiato ? 1 : 0);
    }
    console.log(
      cambiato
        ? "✅ readme.md aggiornato."
        : "✅ readme.md era già aggiornato.",
    );
  }
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
