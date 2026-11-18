// pagina-attiva.js — Trova la voce del menu che corrisponde alla pagina in cui ci si trova.
//
// Prima cerca la pagina esatta. Se non c'è (per esempio Estate/2022 o
// Statistiche/Anni/2024) accende la sezione a cui la pagina appartiene.

// Riduce qualsiasi indirizzo alla stessa forma, così il confronto funziona con
// maiuscole diverse, "/" finale e indirizzi puliti senza estensione (/Giri).
export const percorsoNormalizzato = (indirizzo) => {
  let percorso;
  try {
    percorso = new URL(indirizzo, window.location.href).pathname;
  } catch (e) {
    return "";
  }
  try {
    percorso = decodeURIComponent(percorso);
  } catch (e) {
    /* indirizzo già leggibile */
  }
  percorso = percorso.toLowerCase();
  if (percorso.endsWith("/")) percorso += "index.html";
  if (!/\.[a-z0-9]+$/.test(percorso)) percorso += ".html";
  return percorso;
};

// Pagine che non hanno una voce tutta loro: appartengono a una sezione.
// [come inizia l'indirizzo, voce da accendere]
const SEZIONI = [
  ["/primavera/", "/primavera.html"],
  ["/estate/", "/estate.html"],
  ["/autunno_inverno/", "/autunno_inverno.html"],
  ["/statistiche/anni/", "/statistiche.html"],
  ["/statistiche/history/", "/statistiche.html"],
];

// Restituisce l'indirizzo (normalizzato) della voce da accendere, o "" se nessuna.
export const indirizzoAttivo = (indirizziVoci) => {
  const corrente = percorsoNormalizzato(window.location.href);

  if (indirizziVoci.includes(corrente)) return corrente;

  for (const [inizio, voce] of SEZIONI) {
    if (corrente.startsWith(inizio) && indirizziVoci.includes(voce)) {
      return voce;
    }
  }
  return "";
};
