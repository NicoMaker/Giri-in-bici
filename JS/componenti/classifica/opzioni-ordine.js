// opzioni-ordine.js — Tutti i modi di ordinare una classifica: [codice, testo].
// Ogni scheda ne usa un sottoinsieme (vedi controlli-classifica.js).

export const ORDINE_BASE = [
  ["desc", "Dal più al meno pedalato"],
  ["asc", "Dal meno al più pedalato"],
  ["alfabetico", "Alfabetico (A-Z)"],
  ["alfabetico-desc", "Alfabetico (Z-A)"],
  ["data-recente", "Più recente"],
  ["data-vecchio", "Meno recente"],
];

// Gruppi facoltativi, attivati dall'attributo "ordini" del componente.
export const ORDINE_EXTRA = {
  media: [
    ["media-desc", "Media più alta"],
    ["media-asc", "Media più bassa"],
  ],
  corse: [
    ["corse-desc", "Più corse"],
    ["corse-asc", "Meno corse"],
  ],
  mediamese: [
    ["mediamese-desc", "Media km/mese più alta"],
    ["mediamese-asc", "Media km/mese più bassa"],
  ],
};

// Nella scheda Giri si misura la lunghezza, non quanto si è pedalato.
export const TESTI_LUNGHEZZA = {
  desc: "Dal più al meno lungo",
  asc: "Dal meno al più lungo",
};
