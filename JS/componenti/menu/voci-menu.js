// voci-menu.js — Legge le voci del menu a tendina da json/Menu.json.
//
// Aggiungere o togliere una pagina dal menu si fa in json/Menu.json, in un posto solo.
// Ogni voce ha: name, link, icona (nome dell'icona in js/assets/icone.js)
// e/o icon (immagine di riserva). "Pagina Precedente" ha link "#".
// sezione: principale | stagioni | statistiche | altro (in quale gruppo del menu).
// padre: (facoltativo) la pagina sotto cui annidarla, es. "Statistiche.html".

// Se il file non si legge, la navigazione non deve sparire: resta almeno la home.
const DI_RISERVA = [
  {
    nome: "Home",
    link: "/Giri.html",
    icona: "casa",
    gruppo: "principale",
    padre: "",
  },
];

const normalizza = (voce) => {
  const link = voce.link || "#";
  const esterno = /^https?:\/\//i.test(link);
  const icona = voce.icona || "";
  const eSvg = icona.endsWith(".svg");
  return {
    nome: voce.name,
    // I link nel JSON sono scritti dalla radice ("Giri.html"): vanno bene da qualsiasi cartella
    link: esterno || link === "#" || link.startsWith("/") ? link : "/" + link,
    icona: eSvg ? "" : icona,
    immagine: eSvg ? icona : voce.icon || "",
    fuori: esterno,
    indietro: voce.name.trim() === "Pagina Precedente" && link === "#",
    classifica: /classificamesi\.html/i.test(link),
    // Dove sta nel menu e sotto quale pagina (vedi "sezione" e "padre" in json/Menu.json)
    gruppo: voce.sezione || "altro",
    padre: voce.padre
      ? voce.padre.startsWith("/")
        ? voce.padre
        : "/" + voce.padre
      : "",
  };
};

export const caricaVoci = async () => {
  try {
    const risposta = await fetch("/json/Menu.json");
    if (!risposta.ok) throw new Error(`HTTP ${risposta.status}`);
    const dati = await risposta.json();
    return dati.items.map(normalizza);
  } catch (errore) {
    console.error("Errore nel caricamento del menu:", errore);
    return DI_RISERVA;
  }
};
