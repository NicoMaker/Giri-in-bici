// ============================================================
// stato-url.js — L'indirizzo della pagina Classifica segue da solo
// quello che si vede: nessun "?vista=" scritto a mano.
//
// Ogni volta che si tocca un pulsante o un filtro, l'indirizzo in
// barra si riscrive (senza ricaricare la pagina e senza riempire la
// cronologia). Si può copiare, condividere o riaprire: la pagina
// riparte esattamente da lì.
//
// Cosa finisce nell'indirizzo (solo ciò che è diverso dall'inizio,
// e solo della scheda aperta in quel momento):
//
//   vista     la scheda: mesi | record | anni | stagioni | periodi | tappe
//   modo      solo nei Giri: classifica | anni  ("Giri per anno")
//   stagione  filtro Stagione (Periodi, Giri), più valori con la virgola
//   anno      filtro Anno (Km mensili, Giri), anni o periodi 2020-2021
//   mese      filtro Mese (Km mensili)
//   ordine    ordine scelto (se non è il primo "dal più al meno pedalato")
//   min, max  filtro in km "Da" / "A"
//   q         testo del campo "Cerca"
//
// Esempi:
//   Classifica.html?vista=mesi
//   Classifica.html?vista=record&anno=2023&ordine=asc
//   Classifica.html?vista=tappe&modo=anni&stagione=Estate&min=40&q=lago
//
// Filtri con "tutto selezionato" o "niente selezionato" non si
// scrivono: valgono come nessun filtro. Cambiando scheda l'indirizzo
// perde i filtri della precedente e prende quelli della nuova.
//
// Ogni scheda legge i propri parametri con CM.statoUrl.parametri(
// "<scheda>"): quelli dell'indirizzo valgono solo per la scheda con
// cui si è aperta la pagina, non per le altre (nascoste).
//
// Dopo ogni riscrittura lancia l'evento "classifica:url" sulla window:
// l'icona Classifica della barra lo ascolta (link-classifica.js).
//
// Nessuna dipendenza (usa FiltroMultiplo.istanza se c'è).
// Richiamato da nucleo/controller.js, selettore-vista.js e dalle viste.
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  const VISTE = ["mesi", "record", "anni", "stagioni", "periodi", "tappe"];

  // Filtri a scelta multipla di ogni scheda: [id del contenitore, parametro].
  const FILTRI = {
    record: [
      ["record-filtro-anno", "anno"],
      ["record-filtro-mese", "mese"],
    ],
    periodi: [["periodi-filtro-stagione", "stagione"]],
    tappe: [
      ["tappe-filtro-stagione", "stagione"],
      ["tappe-filtro-anno", "anno"],
    ],
  };

  const parametriIniziali = new URLSearchParams(window.location.search);
  const richiesta = parametriIniziali.get("vista");
  const vistaIniziale = VISTE.includes(richiesta) ? richiesta : "mesi";

  let pronto = false;
  let timer = null;

  function gruppoDi(vista) {
    return document.querySelector('[data-vista-gruppo="' + vista + '"]');
  }

  function controlliDi(vista) {
    const gruppo = gruppoDi(vista);
    return gruppo ? gruppo.querySelector(".classifica-controlli") : null;
  }

  function vistaAttiva() {
    const attivo = document.querySelector(
      "#selettore-vista .selettore-metrica__pulsante.attivo",
    );
    const vista = attivo ? attivo.dataset.vista : null;
    return VISTE.includes(vista) ? vista : vistaIniziale;
  }

  const numero = (t) => /^\d+(\.\d+)?$/.test(String(t || "").trim());

  // ---------- Lettura: cosa c'è sullo schermo -> coppie nome/valore ----------
  function leggi(vista) {
    const coppie = [["vista", vista]];
    const gruppo = gruppoDi(vista);
    if (!gruppo) return coppie;

    if (vista === "tappe") {
      const modo = gruppo.querySelector("#tappe-vista [data-modo].attivo");
      coppie.push(["modo", modo ? modo.dataset.modo : "classifica"]);
    }

    (FILTRI[vista] || []).forEach(([id, nome]) => {
      const fm = window.FiltroMultiplo;
      const filtro =
        fm && fm.istanza ? fm.istanza(document.getElementById(id)) : null;
      if (!filtro) return;
      const scelti = filtro.selezionati();
      // Tutto o niente = nessun filtro: non si scrive.
      if (scelti.length && scelti.length < filtro.totale()) {
        coppie.push([nome, scelti.join(",")]);
      }
    });

    const controlli = controlliDi(vista);
    if (controlli) {
      const ordine = controlli.querySelector("[data-ordine].attivo");
      if (ordine && ordine.dataset.ordine !== "desc") {
        coppie.push(["ordine", ordine.dataset.ordine]);
      }
      ["min", "max"].forEach((nome) => {
        const campo = controlli.querySelector('[data-range="' + nome + '"]');
        if (campo && numero(campo.value)) {
          coppie.push([nome, campo.value.trim()]);
        }
      });
      const ricerca = controlli.querySelector("[data-ricerca]");
      if (ricerca && ricerca.value.trim()) {
        coppie.push(["q", ricerca.value.trim()]);
      }
    }
    return coppie;
  }

  function costruisci(coppie) {
    return coppie
      .map(
        ([nome, valore]) =>
          nome + "=" + encodeURIComponent(valore).replace(/%2C/gi, ","),
      )
      .join("&");
  }

  const S = (CM.statoUrl = {});

  S.vistaIniziale = () => vistaIniziale;
  S.vistaAttiva = vistaAttiva;
  S.VISTE = VISTE;

  // Parametri dell'indirizzo di apertura, SOLO se riguardano questa
  // scheda; per le altre schede un insieme vuoto.
  S.parametri = (vista) =>
    vista === vistaIniziale
      ? new URLSearchParams(parametriIniziali)
      : new URLSearchParams();

  // Prima che le schede si disegnino: porta nei campi comuni della
  // scheda di apertura ordine, km e testo letti dall'indirizzo.
  // (I filtri a scelta multipla li legge ogni scheda da sé.)
  S.applicaIniziale = function () {
    const controlli = controlliDi(vistaIniziale);
    if (!controlli) return;
    const p = parametriIniziali;

    const ricerca = controlli.querySelector("[data-ricerca]");
    if (ricerca && p.get("q")) ricerca.value = p.get("q");

    ["min", "max"].forEach((nome) => {
      const campo = controlli.querySelector('[data-range="' + nome + '"]');
      if (campo && numero(p.get(nome))) campo.value = p.get(nome).trim();
    });

    const ordine = p.get("ordine");
    if (ordine) {
      const bottoni = Array.from(controlli.querySelectorAll("[data-ordine]"));
      if (bottoni.some((b) => b.dataset.ordine === ordine)) {
        bottoni.forEach((b) => {
          const attivo = b.dataset.ordine === ordine;
          b.classList.toggle("attivo", attivo);
          b.setAttribute("aria-pressed", attivo ? "true" : "false");
        });
      }
    }
  };

  // Riscrive l'indirizzo con lo stato di adesso.
  S.sincronizza = function () {
    if (!pronto) return;
    const nuovo =
      window.location.pathname +
      "?" +
      costruisci(leggi(vistaAttiva())) +
      window.location.hash;
    const attuale =
      window.location.pathname + window.location.search + window.location.hash;
    if (nuovo !== attuale) {
      try {
        window.history.replaceState(window.history.state, "", nuovo);
      } catch (e) {
        /* alcuni browser limitano le riscritture: l'indirizzo resta com'è */
      }
    }
    window.dispatchEvent(new CustomEvent("classifica:url"));
  };

  // Da chiamare a fine caricamento: da qui in poi ogni pulsante,
  // filtro o campo riscrive l'indirizzo.
  S.avvia = function () {
    if (pronto) return;
    pronto = true;
    // Un piccolo ritardo lascia finire prima i gestori della pagina
    // (che ridisegnano e aggiornano i filtri) e legge poi lo stato vero.
    const programma = () => {
      clearTimeout(timer);
      timer = setTimeout(S.sincronizza, 80);
    };
    ["click", "input", "change"].forEach((evento) =>
      document.addEventListener(evento, programma, true),
    );
    S.sincronizza();
  };
})(window.ClassificaMesi);
