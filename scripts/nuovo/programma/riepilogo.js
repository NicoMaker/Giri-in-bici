"use strict";

// Riepilogo e scrittura: mostra cosa cambiera, chiede conferma e scrive i file.

const { PROVA, SI } = require("../base/impostazioni");
const { chiediSiNo, giallo, grassetto, grigio, verde } = require("../base/terminale");

const mostraRiepilogo = (piano) => {
  console.log(`\n${grassetto("Riepilogo")}`);
  piano.note.forEach((n) => console.log(`  ${n}`));
  piano.avvisi.forEach((n) => console.log(`  ${giallo(`⚠ ${n}`)}`));
  if (piano.note.length || piano.avvisi.length) console.log("");
  [...piano.creati].forEach((f) => console.log(`  ${verde("+ crea     ")} ${f}`));
  [...piano.cartelle].forEach((f) => console.log(`  ${verde("+ cartella ")} ${f}/`));
  [...piano.modificati].forEach((f) => console.log(`  ${giallo("~ aggiorna ")} ${f}`));
};

const conferma = async (piano) => {
  piano.valida();
  mostraRiepilogo(piano);
  if (PROVA) {
    console.log(`\n${giallo("Modalità --prova: non è stato scritto nessun file.")}`);
    return false;
  }
  console.log("");
  if (!SI && !(await chiediSiNo("Confermi? Scrivo i file", true))) {
    console.log(giallo("Annullato: non è stato scritto nessun file."));
    return false;
  }
  piano.scrivi();
  console.log(`\n${verde("✔ Fatto.")}`);
  if (piano.promemoria.length) {
    console.log(`\n${grassetto("Da fare a mano:")}`);
    piano.promemoria.forEach((p) => console.log(`  • ${p}`));
  }
  if (piano.esempio) console.log(`\n${grigio("Sostituisci il giro/mese d'esempio con i dati veri quando li hai.")}`);
  return true;
};

module.exports = { mostraRiepilogo, conferma };
