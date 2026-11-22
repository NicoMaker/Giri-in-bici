// estrai.js — Raccoglie i dati che la pagina sta mostrando in questo momento.
//
// Non serve sapere da quale JSON arrivano: si legge ciò che c'è a schermo.
// Funziona quindi su ogni pagina, anche su quelle nuove, senza toccarle:
//   - le tabelle (uscite, mesi, statistiche...)
//   - le classifiche e i podi (liste)
//   - i riquadri con i totali (.colore)
//   - i risultati della ricerca per data / per posto
//   - i grafici Chart.js (etichette e serie)
// Solo ciò che è visibile: una scheda nascosta o una riga filtrata non esce.
//
// I link ai percorsi (Komoot) vengono tenuti a parte, così chi condivide
// decide se includerli (vedi condividi.js).

const pulisci = (t) =>
  String(t == null ? "" : t)
    .replace(/\s+/g, " ")
    .trim();

const visibile = (el) =>
  !el.closest("[hidden]") && el.getClientRects().length > 0;

// Testo di un elemento con uno spazio fra un pezzo e l'altro
// ("1" + "Settembre" + "1.070 km" non diventa "1Settembre1.070km")
const testo = (el) => {
  const pezzi = [];
  const camminatore = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (camminatore.nextNode()) pezzi.push(camminatore.currentNode.nodeValue);
  return pulisci(pezzi.join(" "));
};

const linkDi = (el) =>
  [...el.querySelectorAll("a[href]")]
    .map((a) => a.href)
    .filter((h) => /^https?:/i.test(h));

const titoloSezione = (el) => {
  const sezione = el.closest("section");
  const titolo = sezione && sezione.querySelector("h2, h3");
  return titolo ? pulisci(titolo.textContent) : "";
};

const tabelle = () =>
  [...document.querySelectorAll("main table")]
    .filter(visibile)
    .map((t) => {
      const intestazioni = [...t.querySelectorAll("thead th")].map(testo);
      const righe = [...t.querySelectorAll("tbody tr, tfoot tr")]
        .filter(visibile)
        .map((tr) => {
          const celle = [...tr.children];
          return { celle: celle.map(testo), link: celle.flatMap(linkDi) };
        })
        .filter((r) => r.celle.some(Boolean));
      return { titolo: titoloSezione(t), intestazioni, righe };
    })
    .filter((t) => t.righe.length);

const elenchi = () => {
  const trovati = [];
  const aggiungi = (el, voci) => {
    if (!voci.length) return;
    trovati.push({
      titolo: titoloSezione(el),
      voci: voci.map((v) => ({ testo: v.testo, link: v.link })),
    });
  };

  // Classifiche (liste ordinate)
  document
    .querySelectorAll("main ol.classifica-lista")
    .forEach((ol) => {
      if (!visibile(ol)) return;
      aggiungi(
        ol,
        [...ol.querySelectorAll(":scope > li")]
          .map((li) => ({ testo: testo(li), link: linkDi(li) }))
          .filter((v) => v.testo),
      );
    });

  // Podi
  document.querySelectorAll("main .podio").forEach((podio) => {
    if (!visibile(podio)) return;
    aggiungi(
      podio,
      [...podio.children]
        .map((g) => ({ testo: testo(g), link: linkDi(g) }))
        .filter((v) => v.testo),
    );
  });

  // Risultati di "Cerca per data" e "Cerca per posto"
  document
    .querySelectorAll("#risultatiCercaData, #risultatiCercaPosto")
    .forEach((contenitore) => {
      if (!visibile(contenitore)) return;
      aggiungi(
        contenitore,
        [...contenitore.querySelectorAll(".risultato-riga")]
          .map((r) => {
            // il numero d'ordine lo rimette la numerazione dell'elenco
            const copia = r.cloneNode(true);
            copia
              .querySelectorAll(".risultato-riga__posizione")
              .forEach((n) => n.remove());
            return { testo: testo(copia), link: linkDi(r) };
          })
          .filter((v) => v.testo),
      );
    });

  return trovati;
};

// Riquadri con i totali: "Totale km percorsi 5.432", "Totale corse 56"...
const riepilogo = () => {
  const voci = [];
  document.querySelectorAll("main .colore").forEach((riquadro) => {
    if (!visibile(riquadro)) return;
    const righe = [...riquadro.querySelectorAll("p")].map(testo).filter(Boolean);
    const tutte = righe.length ? righe : [testo(riquadro)].filter(Boolean);
    tutte.forEach((r) => voci.push(r));
  });
  return voci;
};

// Grafici Chart.js già disegnati
const grafici = () => {
  if (!window.Chart || typeof window.Chart.getChart !== "function") return [];
  const risultato = [];
  document.querySelectorAll("main canvas").forEach((canvas) => {
    if (!visibile(canvas)) return;
    const grafico = window.Chart.getChart(canvas);
    if (!grafico || !grafico.data) return;
    const etichette = (grafico.data.labels || []).map(pulisci);
    const serie = (grafico.data.datasets || [])
      .map((d) => ({
        nome: pulisci(d.label) || "Valori",
        valori: (d.data || []).map((v) =>
          v && typeof v === "object" ? (v.y ?? v.r ?? "") : v,
        ),
      }))
      .filter((s) => s.valori.length);
    if (!etichette.length || !serie.length) return;
    risultato.push({ titolo: titoloSezione(canvas), etichette, serie });
  });
  return risultato;
};

// Ciò che la pagina sta mostrando adesso (sincrono: serve al "Condividi"
// del telefono, che pretende di partire subito dal tocco)
export const estraiPagina = () => {
  const titoloPagina = pulisci(
    (document.querySelector("main h1") || {}).textContent ||
      document.title.split("|")[0],
  );
  return {
    titolo: titoloPagina,
    pagina: document.title.trim(),
    url: window.location.href.split("#")[0],
    riepilogo: riepilogo(),
    tabelle: tabelle(),
    elenchi: elenchi(),
    grafici: grafici(),
  };
};

export const haDati = (dati) =>
  Boolean(
    dati.riepilogo.length ||
      dati.tabelle.length ||
      dati.elenchi.length ||
      dati.grafici.length,
  );

// Il file JSON "grezzo" da cui la pagina legge (es. json/Estate/Periodi/2026.json),
// quando la pagina lo dichiara con <div id="json" link="...">
export const leggiOriginale = async () => {
  const marcatore = document.getElementById("json");
  const percorso = marcatore && marcatore.getAttribute("link");
  if (!percorso || !window.Json) return null;
  const dati = await window.Json.leggiOppureNull(percorso);
  return dati == null ? null : { file: percorso, dati };
};
