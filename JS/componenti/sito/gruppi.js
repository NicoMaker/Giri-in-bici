// gruppi.js — Come il sito è organizzato: gruppi del menu e "famiglie" di pagine.
//
// GRUPPI    le sezioni del menu e della mappa (Principale, Stagioni, ...).
// FAMIGLIE  le pagine che nascono una per anno/periodo (Estate/2022.html, ...).
//           Per ognuna basta creare il file .html nella cartella giusta:
//           il sito la trova da solo (dal JSON dell'elenco + una prova sugli anni nuovi).

export const GRUPPI = [
  { id: "principale", titolo: "Principale", colore: "#14568f" },
  { id: "stagioni", titolo: "Stagioni", colore: "#2e9e5b" },
  { id: "statistiche", titolo: "Statistiche", colore: "#c99a2e" },
  { id: "altro", titolo: "Informazioni e link", colore: "#7b5bd6" },
];

const anno = (k) => parseInt(k, 10);

// padre: pagina "capofila" · json/chiavi: dove sta l'elenco · cartella: dove stanno i file
// chiave(a): da un anno di partenza alla chiave del periodo · etichetta(k): nome mostrato
export const FAMIGLIE = [
  {
    padre: "/Primavera.html", gruppo: "stagioni", icona: "primavera",
    cartella: "/Primavera/", json: "/json/Primavera/generale.json", chiavi: "subPeriods",
    chiave: (a) => `${a}`, etichetta: (k) => `Primavera ${k}`, anno,
  },
  {
    padre: "/Estate.html", gruppo: "stagioni", icona: "estate",
    cartella: "/Estate/", json: "/json/Estate/generale.json", chiavi: "subPeriods",
    chiave: (a) => `${a}`, etichetta: (k) => `Estate ${k}`, anno,
  },
  {
    padre: "/Autunno_Inverno.html", gruppo: "stagioni", icona: "inverno",
    cartella: "/Autunno_Inverno/", json: "/json/Autunno_Inverno/generale.json", chiavi: "subPeriods",
    chiave: (a) => `${a}-${a + 1}`, etichetta: (k) => `Autunno-Inverno ${k}`, anno,
  },
  {
    padre: "/Statistiche.html", gruppo: "statistiche", icona: "calendario",
    cartella: "/Statistiche/Anni/", json: "/json/Statistiche/History/Storico.json", chiavi: "anni",
    chiave: (a) => `${a}`, etichetta: (k) => `Statistiche ${k}`, anno,
  },
];

// Gruppo di una pagina trovata solo guardando i link (nessuna voce nel menu)
export const gruppoDaPercorso = (percorso) => {
  const p = percorso.toLowerCase();
  if (/^\/(primavera|estate|autunno_inverno)(\/|\.html)/.test(p)) return "stagioni";
  if (p.startsWith("/statistiche")) return "statistiche";
  return "altro";
};
