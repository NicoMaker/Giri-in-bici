// ============================================================
// dati-giri.js — Utilita' condivise fra le ricerche del diario
//
// Sia "cerca per data" sia "cerca per posto" hanno bisogno delle
// stesse cose: sapere in quali file cercare, leggerli, capire
// l'anno vero di un'uscita Autunno-Inverno (il file copre due anni)
// e disegnare la tabella dei risultati. Prima di sdoppiare tutto
// questo file raccoglie la parte in comune.
//
// L'elenco degli anni coperti dal sito si legge da
// json/Statistiche/History/Storico.json, la stessa fonte gia'
// usata dalle pagine di Statistiche: quando si aggiunge un anno al
// sito non serve toccare questo file.
//
// Dipende da: Json (JS/json.js), formatNumber (JS/utils.js).
// Va incluso PRIMA di cerca-per-data.js e cerca-per-posto.js.
// ============================================================

window.DatiGiri = window.DatiGiri || {};

(function (D) {
  "use strict";

  D.MESI = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  // Nei file Autunno-Inverno (es. "2024-2025.json") i mesi
  // Gennaio-Aprile appartengono al secondo anno della coppia, gli
  // altri (Ottobre-Dicembre) al primo.
  var MESI_SECONDO_ANNO = ["Gennaio", "Febbraio", "Marzo", "Aprile"];

  D.primavera = function (anno) {
    return {
      stagione: "Primavera",
      url: "json/Primavera/Periodi/" + anno + ".json",
    };
  };

  D.estate = function (anno) {
    return {
      stagione: "Estate",
      url: "json/Estate/Periodi/" + anno + ".json",
    };
  };

  D.autunnoInverno = function (annoInizio, annoFine) {
    return {
      stagione: "Autunno - Inverno",
      url:
        "json/Autunno_Inverno/Periodi/" + annoInizio + "-" + annoFine + ".json",
      annoInizio: annoInizio,
      annoFine: annoFine,
    };
  };

  // Candidati per una data precisa: i confini fra una stagione e
  // l'altra si spostano di anno in anno nei dati reali (l'Estate puo'
  // iniziare a fine Maggio, l'Autunno-Inverno arrivare fino a inizio
  // Aprile), quindi nei mesi di confine si controlla piu' di un file.
  D.candidatiPerData = function (meseIndice, anno) {
    switch (meseIndice) {
      case 0: // Gennaio
      case 1: // Febbraio
        return [D.autunnoInverno(anno - 1, anno)];
      case 2: // Marzo
      case 3: // Aprile
        return [D.primavera(anno), D.autunnoInverno(anno - 1, anno)];
      case 4: // Maggio
      case 5: // Giugno
        return [D.primavera(anno), D.estate(anno)];
      case 6: // Luglio
      case 7: // Agosto
      case 8: // Settembre
        return [D.estate(anno)];
      case 9: // Ottobre
        return [D.estate(anno), D.autunnoInverno(anno, anno + 1)];
      case 10: // Novembre
      case 11: // Dicembre
        return [D.autunnoInverno(anno, anno + 1)];
      default:
        return [];
    }
  };

  // Tutti i file di periodo del sito: serve alla ricerca per posto,
  // che non e' legata a una data e deve guardare ovunque.
  D.tuttiICandidati = async function () {
    var storico = await window.Json.leggiOppureNull(
      "json/Statistiche/History/Storico.json",
    );
    var anni =
      storico && storico.anni
        ? Object.keys(storico.anni).map(Number)
        : [2020, 2021, 2022, 2023, 2024, 2025, 2026]; // rete di sicurezza
    anni.sort(function (a, b) {
      return a - b;
    });

    var candidati = [];
    anni.forEach(function (anno) {
      candidati.push(D.primavera(anno));
      candidati.push(D.estate(anno));
      candidati.push(D.autunnoInverno(anno, anno + 1));
    });
    return candidati;
  };

  function annoDaUrl(url) {
    var trovato = url.match(/(\d{4})\.json$/);
    return trovato ? parseInt(trovato[1], 10) : 0;
  }

  // Estrae solo il testo da un campo "place", che puo' contenere un
  // link <a>, per confronti e ordinamenti.
  D.testoPosto = function (html) {
    var contenitore = document.createElement("div");
    contenitore.innerHTML = html;
    return (contenitore.textContent || contenitore.innerText || "").trim();
  };

  // Legge una lista di candidati e restituisce tutte le uscite
  // trovate, ciascuna arricchita con stagione, anno vero, chiave
  // numerica per ordinare per data e testo semplice del posto.
  D.leggiUscite = async function (candidati) {
    var risposte = await Promise.all(
      candidati.map(function (c) {
        return window.Json.leggiOppureNull(c.url);
      }),
    );

    var uscite = [];
    risposte.forEach(function (dati, indice) {
      if (!dati) return;
      var candidato = candidati[indice];

      dati.forEach(function (giro) {
        var parti = giro.date.split(" ");
        var giorno = parseInt(parti[0], 10);
        var mese = parti[1];
        var meseIndice = D.MESI.indexOf(mese);
        var anno =
          candidato.stagione === "Autunno - Inverno"
            ? MESI_SECONDO_ANNO.indexOf(mese) !== -1
              ? candidato.annoFine
              : candidato.annoInizio
            : annoDaUrl(candidato.url);

        uscite.push({
          stagione: candidato.stagione,
          data: giro.date,
          anno: anno,
          etichetta: giro.date + " " + anno,
          postoHtml: giro.place,
          postoTesto: D.testoPosto(giro.place),
          distanza: Number(giro.distance) || 0,
          chiaveData: anno * 10000 + (meseIndice + 1) * 100 + giorno,
        });
      });
    });

    return uscite;
  };

  function perData(a, b) {
    return a.chiaveData - b.chiaveData;
  }

  function perAlfabeto(a, b) {
    return a.postoTesto.localeCompare(b.postoTesto, "it", {
      sensitivity: "base",
    });
  }

  // Ordina un elenco di uscite secondo uno dei 5 criteri dei bottoni
  // "Ordina per" (condiviso fra ricerca per data e ricerca per
  // posto). A parita' di km o di posto, decide sempre la data.
  D.ordina = function (uscite, criterio) {
    var copia = uscite.slice();

    switch (criterio) {
      case "data-vecchio":
        copia.sort(function (a, b) {
          return perData(a, b) || perAlfabeto(a, b);
        });
        break;
      case "data-recente":
        copia.sort(function (a, b) {
          return perData(b, a) || perAlfabeto(a, b);
        });
        break;
      case "distanza-lungo":
        copia.sort(function (a, b) {
          return b.distanza - a.distanza || perData(a, b);
        });
        break;
      case "distanza-corto":
        copia.sort(function (a, b) {
          return a.distanza - b.distanza || perData(a, b);
        });
        break;
      case "alfabetico":
      default:
        copia.sort(function (a, b) {
          return perAlfabeto(a, b) || perData(a, b);
        });
        break;
    }

    return copia;
  };

  // Aggancia i click sul gruppo di bottoni "Ordina per" (un solo
  // "attivo" alla volta) e richiama "alCambio" col nuovo criterio a
  // ogni click. Restituisce un oggetto con "leggi()" per sapere in
  // ogni momento il criterio attualmente scelto.
  D.inizializzaBottoniOrdine = function (idGruppo, alCambio) {
    var gruppo = document.getElementById(idGruppo);
    if (!gruppo)
      return {
        leggi: function () {
          return "alfabetico";
        },
      };

    var bottoni = gruppo.querySelectorAll(".criterio-ordine__pulsante");
    var criterioAttuale = "alfabetico";

    bottoni.forEach(function (bottone) {
      if (bottone.classList.contains("attivo")) {
        criterioAttuale = bottone.getAttribute("data-criterio") || "alfabetico";
      }
      bottone.addEventListener("click", function () {
        bottoni.forEach(function (b) {
          b.classList.remove("attivo");
          b.setAttribute("aria-pressed", "false");
        });
        bottone.classList.add("attivo");
        bottone.setAttribute("aria-pressed", "true");
        criterioAttuale = bottone.getAttribute("data-criterio") || "alfabetico";
        alCambio(criterioAttuale);
      });
    });

    return {
      leggi: function () {
        return criterioAttuale;
      },
    };
  };

  // Elenco dei risultati in stile "classifica" (lo stesso linguaggio
  // visivo di Statistiche > Storico > Classifica dei mesi): riga
  // cliccabile con un segno "↗" quando il posto ha un link al
  // percorso. Riusa TappePiuLunghe.analizzaLuogo/creaLinkMultipli,
  // le stesse funzioni gia' usate in tutto il resto del sito per
  // riconoscere il link dentro "place" (compreso il caso andata/
  // ritorno con due link separati) — se quello script non e' in
  // pagina, il posto resta comunque leggibile ma non cliccabile.
  D.elencoRisultati = function (uscite) {
    var T = window.TappePiuLunghe;
    var totaleKm = uscite.reduce(function (somma, u) {
      return somma + u.distanza;
    }, 0);

    var righe = uscite
      .map(function (u, indice) {
        var info = T
          ? T.analizzaLuogo(u.postoHtml)
          : {
              nome: u.postoHtml,
              nomeTesto: u.postoTesto,
              href: null,
              linkMultipli: null,
            };
        var linkMultipli =
          T && info.linkMultipli ? T.creaLinkMultipli(info.linkMultipli) : "";

        var dentro =
          '<span class="risultato-riga__posizione">' +
          (indice + 1) +
          "</span>" +
          '<span class="risultato-riga__posto">' +
          info.nome +
          '<small class="risultato-riga__sotto">' +
          u.etichetta +
          " · " +
          u.stagione +
          "</small>" +
          linkMultipli +
          "</span>" +
          '<span class="risultato-riga__km">' +
          window.formatNumber(u.distanza) +
          " km</span>";

        var classi =
          "risultato-riga" + (info.href ? " risultato-riga--cliccabile" : "");

        return info.href
          ? '<li class="' +
              classi +
              '"><a class="risultato-riga__link" href="' +
              info.href +
              '" target="_blank" rel="noopener" aria-label="Apri il percorso di ' +
              info.nomeTesto +
              ", " +
              u.etichetta +
              '">' +
              dentro +
              "</a></li>"
          : '<li class="' + classi + '">' + dentro + "</li>";
      })
      .join("");

    var riepilogo =
      uscite.length > 1
        ? '<p class="hero-sub">' +
          uscite.length +
          " giri trovati, per un totale di " +
          window.formatNumber(totaleKm) +
          " km.</p>"
        : "";

    return riepilogo + '<ul class="elenco-risultati">' + righe + "</ul>";
  };
})(window.DatiGiri);
