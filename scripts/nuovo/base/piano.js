"use strict";

// Piano: le modifiche si preparano in memoria, si controllano e si scrivono solo alla fine.

const fs = require("fs");
const path = require("path");
const { RADICE } = require("./impostazioni");

class Piano {
  constructor() {
    this.contenuti = new Map(); // percorso relativo -> testo
    this.creati = new Set();
    this.modificati = new Set();
    this.cartelle = new Set();
    this.promemoria = [];
    this.note = []; // frasi di riepilogo (es. "Il 22 Novembre ho fatto un giro di 95 km")
    this.avvisi = [];
    this.esempio = false; // true se è rimasto un giro/mese d'esempio da sostituire
  }

  creaBinario(rel, buffer) {
    this.crea(rel, buffer);
  }

  assoluto(rel) {
    return path.join(RADICE, rel);
  }

  esiste(rel) {
    return this.contenuti.has(rel) || fs.existsSync(this.assoluto(rel));
  }

  leggi(rel) {
    if (this.contenuti.has(rel)) return this.contenuti.get(rel);
    const file = this.assoluto(rel);
    if (!fs.existsSync(file)) throw new Error(`File non trovato: ${rel}`);
    return fs.readFileSync(file, "utf8");
  }

  crea(rel, testo) {
    if (this.esiste(rel))
      throw new Error(`Esiste già, non lo sovrascrivo: ${rel}`);
    this.contenuti.set(rel, testo);
    this.creati.add(rel);
  }

  modifica(rel, testo) {
    const prima = this.leggi(rel);
    if (prima === testo) return;
    this.contenuti.set(rel, testo);
    if (!this.creati.has(rel)) this.modificati.add(rel);
  }

  cartella(rel) {
    if (!fs.existsSync(this.assoluto(rel))) this.cartelle.add(rel);
  }

  valida() {
    for (const [rel, testo] of this.contenuti) {
      if (rel.endsWith(".json") && typeof testo === "string") {
        try {
          JSON.parse(testo);
        } catch (e) {
          throw new Error(`JSON non valido in ${rel}: ${e.message}`);
        }
      }
    }
  }

  scrivi() {
    for (const rel of this.cartelle) {
      fs.mkdirSync(this.assoluto(rel), { recursive: true });
      fs.writeFileSync(path.join(this.assoluto(rel), ".gitkeep"), "");
    }
    for (const [rel, testo] of this.contenuti) {
      const file = this.assoluto(rel);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, testo, "utf8");
    }
  }
}

module.exports = { Piano };
