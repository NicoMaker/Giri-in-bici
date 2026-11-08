// ============================================================
// corse-per-anno.js — "Le corse di un anno solare" (o di tutti)
//
// Le stagioni del sito non coincidono con gli anni del calendario:
// l'Autunno-Inverno "2023-2024" contiene le uscite di Ottobre-
// Dicembre 2023 e quelle di Gennaio-Aprile 2024. Questa pagina fa
// il lavoro inverso: scelto un anno (es. 2023) mostra TUTTE le
// uscite di quell'anno, nell'ordine del calendario, pescando da
// piu' file:
//
//   Autunno-Inverno 2022-2023  -> solo Gennaio-Aprile 2023
//   Primavera 2023
//   Estate 2023
//   Autunno-Inverno 2023-2024  -> solo Ottobre-Dicembre 2023
//
// Modalita' della pagina (indirizzo ?anno=...):
//   ?anno=2023       un anno solare
//   ?anno=2022,2023  piu' anni insieme (i bottoni si accendono e si
//                    spengono)
//   ?anno=tutti      TUTTE le corse di tutti gli anni (pulsante
//                    "Tutti gli anni"; e' il link della pagina
//                    Statistiche generale)
//
// Filtri, tutti facoltativi e combinabili. Dentro ciascun gruppo
// si possono scrivere piu' righe e basta che la corsa ne rispetti
// UNA ("o questo o quello"); i gruppi fra loro si sommano ("e"):
//   - posti         uno o piu' nomi (senza badare ad accenti/maiuscole)
//   - date          uno o piu' intervalli dal/al, anche con un solo
//                   estremo ("da" = da quel giorno in poi, "a" = fino
//                   a quel giorno)
//   - chilometri    uno o piu' intervalli minimi/massimi
//   - stagioni      una o piu' stagioni (bottoni a scelta multipla)
//   - stagioni      le stagioni scelte si vedono anche per intero,
//     intere        con la parte nell'anno vicino
//   - vista         raggruppate per stagione oppure in un unico elenco
//
// Tutto finisce nell'indirizzo, cosi' una ricerca si puo' condividere:
//   ?anno=2023&q=udine&q=gemona&int=2023-03-01~2023-04-30
//   &km=40~80&stagione=Primavera+2023,Estate+2023&intera=1&vista=elenco
//
// L'anno vero di ogni uscita lo calcola gia' DatiGiri.leggiUscite
// (dati-condivisi.js). I totali di un anno coincidono con
// json/Statistiche/anni/<anno>.json.
//
// Un anno nuovo compare da solo nei bottoni (da Storico.json o
// dall'anno corrente): nessun file di questa pagina da toccare.
//
// Dipende da: Json (js/core/lettura-json.js), formatNumber
// (js/core/formattazione-numeri.js), DatiGiri
// (dati-condivisi.js) e, facoltativo, TappePiuLunghe
// (js/assets/tappe-piu-lunghe.js) per i link ai percorsi.
// ============================================================

(function () {
  "use strict";

  var D = window.DatiGiri;
  if (!D) return;

  var PRIMO_ANNO = 2020;
  var TUTTI = "tutti";
  var annoCorrente = new Date().getFullYear();

  var stato = {
    tuttiAnni: false, // true = "Tutti gli anni"
    anni: [], // anni scelti (numeri), usati se tuttiAnni e' false
    tutte: [], // tutte le uscite lette (anche l'altra meta' delle stagioni)
    posti: [""], // una riga per posto ("" = riga vuota, ignorata)
    date: [{ da: "", a: "" }], // intervalli di date "YYYY-MM-DD"
    km: [{ min: "", max: "" }], // intervalli di chilometri
    stagioni: [], // stagioni scelte (stagioneCompleta); vuoto = tutte
    intera: false,
    vista: "stagioni", // "stagioni" | "elenco"
    ordine: "data-vecchio",
  };

  var cacheAnni = {};
  var richiestaAttuale = 0;
  var bottoniOrdine = null;
  var timerAggiorna = null;

  function el(id) {
    return document.getElementById(id);
  }

  function formatta(n) {
    return window.formatNumber ? window.formatNumber(n) : String(n);
  }

  function annoSingolo() {
    return !stato.tuttiAnni && stato.anni.length === 1 ? stato.anni[0] : null;
  }

  function annoScelto(anno) {
    return stato.tuttiAnni || stato.anni.indexOf(anno) !== -1;
  }

  // ---------- Anni selezionabili ----------

  // Come per la ricerca del diario: gli anni dichiarati in
  // Storico.json piu' quelli calcolati (2020 -> anno corrente), cosi'
  // un anno nuovo compare anche se Storico.json resta indietro.
  async function anniDisponibili() {
    var insieme = {};
    var storico = await window.Json.leggiOppureNull(
      "json/Statistiche/History/Storico.json",
    );

    if (storico && storico.anni) {
      Object.keys(storico.anni).forEach(function (chiave) {
        var anno = Number(chiave);
        if (!Number.isNaN(anno) && anno > 0) insieme[anno] = true;
      });
    }
    for (var a = PRIMO_ANNO; a <= annoCorrente; a++) insieme[a] = true;

    return Object.keys(insieme)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
  }

  function creaBottoniAnni(anni) {
    var contenitore = el("selettoreAnno");
    if (!contenitore) return;
    contenitore.innerHTML = "";

    function bottone(valore, testo, extra) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "criterio-ordine__pulsante" + (extra ? " " + extra : "");
      b.setAttribute("data-anno", String(valore));
      b.setAttribute("aria-pressed", "false");
      b.textContent = testo;
      b.addEventListener("click", function () {
        cliccaAnno(valore);
      });
      contenitore.appendChild(b);
    }

    anni.forEach(function (anno) {
      bottone(anno, String(anno));
    });
    bottone(TUTTI, "Tutti gli anni", "criterio-ordine__pulsante--tutti");
  }

  function evidenziaAnni() {
    var bottoni = document.querySelectorAll("#selettoreAnno button");
    bottoni.forEach(function (b) {
      var v = b.getAttribute("data-anno");
      var attivo =
        v === TUTTI ? stato.tuttiAnni : annoScelto(Number(v)) && !stato.tuttiAnni;
      b.classList.toggle("attivo", attivo);
      b.setAttribute("aria-pressed", attivo ? "true" : "false");
    });
  }

  // Click su un anno: lo accende o lo spegne (non si puo' spegnere
  // l'ultimo). "Tutti gli anni" e' esclusivo.
  function cliccaAnno(valore) {
    if (valore === TUTTI) {
      stato.tuttiAnni = !stato.tuttiAnni;
      if (!stato.tuttiAnni && !stato.anni.length) stato.anni = [annoCorrente];
    } else if (stato.tuttiAnni) {
      stato.tuttiAnni = false;
      stato.anni = [valore];
    } else {
      var i = stato.anni.indexOf(valore);
      if (i === -1) stato.anni.push(valore);
      else if (stato.anni.length > 1) stato.anni.splice(i, 1);
      stato.anni.sort(function (a, b) {
        return a - b;
      });
    }
    caricaEMostra(false);
  }

  // ---------- Lettura dei dati ----------

  // I 4 file che possono contenere uscite di un anno solare.
  function candidatiAnno(anno) {
    return [
      D.autunnoInverno(anno - 1, anno), // Gen-Apr dell'anno
      D.primavera(anno),
      D.estate(anno),
      D.autunnoInverno(anno, anno + 1), // Ott-Dic dell'anno
    ];
  }

  // Restituisce TUTTE le uscite dei file coinvolti, anche quelle
  // dell'anno vicino (Ott-Dic o Gen-Apr dell'altro anno): servono
  // per "vedi tutta la stagione". Il filtro sull'anno si fa dopo.
  // Con piu' anni i file in comune (un Autunno-Inverno copre due
  // anni) vengono letti una volta sola.
  function caricaAnni() {
    var chiave = stato.tuttiAnni ? TUTTI : stato.anni.join(",");
    if (!cacheAnni[chiave]) {
      var promessa;
      if (stato.tuttiAnni) {
        promessa = D.tuttiICandidati().then(D.leggiUscite);
      } else {
        var visti = {};
        var candidati = [];
        stato.anni.forEach(function (anno) {
          candidatiAnno(anno).forEach(function (c) {
            if (!visti[c.url]) {
              visti[c.url] = true;
              candidati.push(c);
            }
          });
        });
        promessa = D.leggiUscite(candidati);
      }
      cacheAnni[chiave] = promessa;
    }
    return cacheAnni[chiave];
  }

  // ---------- Filtri ----------

  function chiaveDaInput(valore) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valore || "");
    return m ? Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]) : null;
  }

  function numeroOppureNull(valore) {
    if (valore === "" || valore == null) return null;
    var n = Number(String(valore).replace(",", "."));
    return Number.isNaN(n) ? null : n;
  }

  // Le righe davvero compilate di ciascun gruppo.
  function postiAttivi() {
    return stato.posti
      .map(function (t) {
        return D.normalizza(t.trim());
      })
      .filter(Boolean);
  }

  function dateAttive() {
    return stato.date
      .map(function (r) {
        var da = chiaveDaInput(r.da);
        var a = chiaveDaInput(r.a);
        // Se sono invertite le scambia: "da 30/06 a 01/03" cerca
        // comunque fra le due.
        if (da !== null && a !== null && da > a) {
          var t = da;
          da = a;
          a = t;
        }
        return { da: da, a: a };
      })
      .filter(function (r) {
        return r.da !== null || r.a !== null;
      });
  }

  function kmAttivi() {
    return stato.km
      .map(function (r) {
        var min = numeroOppureNull(r.min);
        var max = numeroOppureNull(r.max);
        if (min !== null && max !== null && min > max) {
          var t = min;
          min = max;
          max = t;
        }
        return { min: min, max: max };
      })
      .filter(function (r) {
        return r.min !== null || r.max !== null;
      });
  }

  // L'uscita appartiene alla vista corrente? (prima dei filtri
  // scelti dall'utente: solo la logica "anni" / "stagione intera")
  function nellAmbito(u) {
    if (stato.tuttiAnni || annoScelto(u.anno)) return true;
    return stato.intera && stato.stagioni.indexOf(u.stagioneCompleta) !== -1;
  }

  function passaFiltri(u, filtri) {
    if (filtri.posti.length) {
      var testo = D.normalizza(u.postoTesto + " " + u.stagioneCompleta);
      var trovato = filtri.posti.some(function (ago) {
        return testo.indexOf(ago) !== -1;
      });
      if (!trovato) return false;
    }

    if (
      filtri.date.length &&
      !filtri.date.some(function (r) {
        return (
          (r.da === null || u.chiaveData >= r.da) &&
          (r.a === null || u.chiaveData <= r.a)
        );
      })
    ) {
      return false;
    }

    if (
      filtri.km.length &&
      !filtri.km.some(function (r) {
        return (
          (r.min === null || u.distanza >= r.min) &&
          (r.max === null || u.distanza <= r.max)
        );
      })
    ) {
      return false;
    }

    if (
      stato.stagioni.length &&
      stato.stagioni.indexOf(u.stagioneCompleta) === -1
    ) {
      return false;
    }
    return true;
  }

  function filtraturaAttiva() {
    return !!(postiAttivi().length || dateAttive().length || kmAttivi().length);
  }

  // ---------- Raggruppamento ----------

  function raggruppa(uscite) {
    var ordineChiavi = [];
    var mappa = {};

    uscite
      .slice()
      .sort(function (a, b) {
        return a.chiaveData - b.chiaveData;
      })
      .forEach(function (u) {
        var chiave = u.stagioneCompleta;
        if (!mappa[chiave]) {
          mappa[chiave] = {
            chiave: chiave,
            stagione: u.stagione,
            uscite: [],
          };
          ordineChiavi.push(chiave);
        }
        mappa[chiave].uscite.push(u);
      });

    // Ordine cronologico: per data della prima uscita di ogni gruppo.
    return ordineChiavi
      .map(function (c) {
        return mappa[c];
      })
      .sort(function (a, b) {
        return a.uscite[0].chiaveData - b.uscite[0].chiaveData;
      });
  }

  // Le stagioni per i bottoni "Mostra": quelle che hanno almeno una
  // uscita negli anni scelti.
  function gruppiPerBottoni() {
    var base = stato.tutte.filter(function (u) {
      return stato.tuttiAnni || annoScelto(u.anno);
    });
    return raggruppa(base);
  }

  // ---------- Disegno ----------

  function tipoStagione(stagione) {
    if (stagione === "Primavera") return "primavera";
    if (stagione === "Estate") return "estate";
    return "autunno-inverno";
  }

  // Frase che spiega come l'anno si collega alle stagioni vicine
  // (solo quando e' scelto un anno solo).
  function notaGruppo(gruppo) {
    var anno = annoSingolo();
    if (anno === null || stato.intera) return null;
    if (gruppo.stagione !== "Autunno - Inverno") return null;
    var anni = gruppo.chiave.match(/(\d{4})-(\d{4})/);
    if (!anni) return null;
    var inizio = parseInt(anni[1], 10);
    var fine = parseInt(anni[2], 10);

    if (fine === anno) {
      return {
        testo:
          "Solo le uscite del " +
          anno +
          ": la stagione era iniziata nel " +
          inizio +
          " (Ottobre-Dicembre).",
        annoLink: inizio,
      };
    }
    if (inizio === anno) {
      return {
        testo:
          "Solo le uscite fino a Dicembre " +
          anno +
          ": la stagione continua nel " +
          fine +
          " (Gennaio-Aprile).",
        annoLink: fine,
      };
    }
    return null;
  }

  function creaRiepilogo(uscite) {
    var totaleKm = uscite.reduce(function (s, u) {
      return s + u.distanza;
    }, 0);
    var media = uscite.length ? totaleKm / uscite.length : 0;
    var piuLunga = uscite.reduce(function (max, u) {
      return !max || u.distanza > max.distanza ? u : max;
    }, null);

    var etichettaCorse;
    if (stato.tuttiAnni) etichettaCorse = "Corse in totale";
    else if (annoSingolo() !== null) etichettaCorse = "Corse nel " + annoSingolo();
    else etichettaCorse = "Corse negli anni scelti";
    if (!stato.tuttiAnni && stato.intera) etichettaCorse = "Corse mostrate";
    if (filtraturaAttiva() || stato.stagioni.length) {
      etichettaCorse = "Corse trovate";
    }

    var box = [
      { etichetta: etichettaCorse, valore: String(uscite.length) },
      { etichetta: "Chilometri totali", valore: formatta(totaleKm) + " km" },
      {
        etichetta: "Media per corsa",
        valore: formatta(Math.round(media * 10) / 10) + " km",
      },
      {
        etichetta: "Giro più lungo",
        valore: piuLunga ? formatta(piuLunga.distanza) + " km" : "—",
        sotto: piuLunga ? piuLunga.postoTesto + " · " + piuLunga.etichetta : "",
      },
    ];

    var griglia = document.createElement("div");
    griglia.className = "riepilogo-anno";

    box.forEach(function (b) {
      var c = document.createElement("div");
      c.className = "riepilogo-anno__box";

      var v = document.createElement("span");
      v.className = "riepilogo-anno__valore";
      v.textContent = b.valore;

      var e = document.createElement("span");
      e.className = "riepilogo-anno__etichetta";
      e.textContent = b.etichetta;

      c.appendChild(v);
      c.appendChild(e);

      if (b.sotto) {
        var sotto = document.createElement("small");
        sotto.className = "riepilogo-anno__sotto";
        sotto.textContent = b.sotto;
        c.appendChild(sotto);
      }
      griglia.appendChild(c);
    });

    return griglia;
  }

  function creaFiltriStagioni() {
    var contenitore = el("filtroStagioniAnno");
    if (!contenitore) return;
    contenitore.innerHTML = "";

    var gruppi = gruppiPerBottoni();
    if (gruppi.length < 2) {
      contenitore.parentNode.hidden = true;
      return;
    }
    contenitore.parentNode.hidden = false;

    var voci = [
      {
        chiave: "tutte",
        etichetta: stato.tuttiAnni ? "Tutte le stagioni" : "Tutto il periodo",
      },
    ].concat(
      gruppi.map(function (g) {
        return { chiave: g.chiave, etichetta: g.chiave };
      }),
    );

    voci.forEach(function (voce) {
      var attivo =
        voce.chiave === "tutte"
          ? stato.stagioni.length === 0
          : stato.stagioni.indexOf(voce.chiave) !== -1;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "criterio-ordine__pulsante" + (attivo ? " attivo" : "");
      b.setAttribute("aria-pressed", attivo ? "true" : "false");
      b.textContent = voce.etichetta;
      b.addEventListener("click", function () {
        // "Tutto il periodo" azzera la scelta; le altre stagioni si
        // accendono/spengono una per una, cosi' se ne possono unire
        // quante si vuole.
        if (voce.chiave === "tutte") {
          stato.stagioni = [];
        } else {
          var i = stato.stagioni.indexOf(voce.chiave);
          if (i === -1) stato.stagioni.push(voce.chiave);
          else stato.stagioni.splice(i, 1);
        }
        aggiornaTutto();
      });
      contenitore.appendChild(b);
    });
  }

  // La casella "per intero" ha senso solo quando fra le stagioni
  // scelte ce n'e' una che continua in un anno non scelto.
  function aggiornaStagioneIntera() {
    var campo = el("campoStagioneIntera");
    var casella = el("stagioneIntera");
    if (!campo || !casella) return;

    var disponibile = false;
    if (!stato.tuttiAnni && stato.stagioni.length) {
      disponibile = stato.tutte.some(function (u) {
        return (
          stato.stagioni.indexOf(u.stagioneCompleta) !== -1 &&
          !annoScelto(u.anno)
        );
      });
    }
    if (!disponibile) stato.intera = false;

    campo.hidden = !disponibile;
    casella.checked = stato.intera;
  }

  function aggiornaLimitiDate() {
    var campi = document.querySelectorAll("#contenitoreDateAnno input");
    var min = "";
    var max = "";
    if (!stato.tuttiAnni && !stato.intera && stato.anni.length) {
      min = stato.anni[0] + "-01-01";
      max = stato.anni[stato.anni.length - 1] + "-12-31";
    }
    campi.forEach(function (campo) {
      if (min) campo.min = min;
      else campo.removeAttribute("min");
      if (max) campo.max = max;
      else campo.removeAttribute("max");
    });
  }

  function creaGruppoDom(g) {
    var sezione = document.createElement("section");
    sezione.className = "gruppo-stagione";
    sezione.setAttribute("data-stagione", tipoStagione(g.stagione));

    var testa = document.createElement("header");
    testa.className = "gruppo-stagione__testa";

    var titolo = document.createElement("h3");
    titolo.className = "gruppo-stagione__titolo";
    titolo.textContent = g.chiave;
    testa.appendChild(titolo);

    var primo = g.uscite[0];
    var ultimo = g.uscite[g.uscite.length - 1];
    var periodo = document.createElement("p");
    periodo.className = "gruppo-stagione__periodo";
    periodo.textContent =
      "Dal " + primo.etichetta + " al " + ultimo.etichetta + " · " +
      g.uscite.length + (g.uscite.length === 1 ? " corsa" : " corse");
    testa.appendChild(periodo);

    var nota = notaGruppo(g);
    if (nota && !filtraturaAttiva()) {
      var p = document.createElement("p");
      p.className = "gruppo-stagione__nota";
      p.appendChild(document.createTextNode(nota.testo + " "));

      var link = document.createElement("button");
      link.type = "button";
      link.className = "link-aggiungi-data";
      link.textContent = "Vai al " + nota.annoLink + " →";
      link.addEventListener("click", function () {
        stato.tuttiAnni = false;
        stato.anni = [nota.annoLink];
        caricaEMostra(false);
      });
      p.appendChild(link);
      testa.appendChild(p);
    }

    return { sezione: sezione, testa: testa };
  }

  function disegnaElenco(visibili) {
    var contenitore = el("risultatiCorseAnno");
    if (!contenitore) return;
    contenitore.innerHTML = "";

    // Elenco unico: tutte le corse insieme, ordinate col criterio
    // scelto (utile per "le 10 piu' lunghe di sempre").
    if (stato.vista === "elenco") {
      var unica = document.createElement("section");
      unica.className = "gruppo-stagione gruppo-stagione--unico";
      var corpoUnico = document.createElement("div");
      corpoUnico.innerHTML = D.elencoRisultati(D.ordina(visibili, stato.ordine));
      unica.appendChild(corpoUnico);
      contenitore.appendChild(unica);
      return;
    }

    var gruppi = raggruppa(visibili);

    // Solo con "Data più recente" si capovolge anche l'ordine delle
    // stagioni; con gli altri criteri restano nell'ordine del calendario.
    if (stato.ordine === "data-recente") gruppi = gruppi.slice().reverse();

    gruppi.forEach(function (g) {
      var parti = creaGruppoDom(g);
      parti.sezione.appendChild(parti.testa);

      var corpo = document.createElement("div");
      corpo.innerHTML = D.elencoRisultati(D.ordina(g.uscite, stato.ordine));
      parti.sezione.appendChild(corpo);

      contenitore.appendChild(parti.sezione);
    });
  }

  function mostraMessaggio(testo) {
    var m = el("messaggioCorseAnno");
    if (!m) return;
    m.textContent = testo || "";
    m.hidden = !testo;
  }

  // Ridisegna riepilogo + elenco secondo lo stato attuale dei filtri.
  function disegnaRisultati() {
    var riepilogo = el("riepilogoCorseAnno");
    var blocco = el("bloccoRisultatiAnno");
    var elenco = el("risultatiCorseAnno");
    var vuoto = el("nessunRisultatoAnno");

    var filtri = { posti: postiAttivi(), date: dateAttive(), km: kmAttivi() };
    var visibili = stato.tutte.filter(function (u) {
      return nellAmbito(u) && passaFiltri(u, filtri);
    });

    if (riepilogo) {
      riepilogo.innerHTML = "";
      if (visibili.length) riepilogo.appendChild(creaRiepilogo(visibili));
    }

    if (!visibili.length) {
      if (elenco) elenco.innerHTML = "";
      if (vuoto) vuoto.hidden = false;
      return;
    }
    if (vuoto) vuoto.hidden = true;
    if (blocco) blocco.hidden = false;
    disegnaElenco(visibili);
  }

  function aggiornaTutto() {
    evidenziaAnni();
    creaFiltriStagioni();
    aggiornaStagioneIntera();
    aggiornaLimitiDate();
    aggiornaPulsantiVista();
    aggiornaIndirizzo();
    disegnaRisultati();
  }

  // ---------- Indirizzo condivisibile ----------

  function aggiornaIndirizzo() {
    try {
      var url = new URL(window.location.href);
      var p = url.searchParams;

      ["anno", "q", "int", "km", "stagione", "intera", "vista"].forEach(
        function (k) {
          p.delete(k);
        },
      );

      p.set("anno", stato.tuttiAnni ? TUTTI : stato.anni.join(","));
      stato.posti.forEach(function (t) {
        if (t.trim()) p.append("q", t.trim());
      });
      stato.date.forEach(function (r) {
        if (r.da || r.a) p.append("int", r.da + "~" + r.a);
      });
      stato.km.forEach(function (r) {
        if (r.min !== "" || r.max !== "") p.append("km", r.min + "~" + r.max);
      });
      if (stato.stagioni.length) p.set("stagione", stato.stagioni.join(","));
      if (stato.intera) p.set("intera", "1");
      if (stato.vista === "elenco") p.set("vista", "elenco");

      window.history.replaceState(null, "", url.toString());
    } catch (e) {
      /* anche senza, la pagina funziona */
    }
  }

  function coppie(valori, nomeA, nomeB) {
    var righe = valori.map(function (v) {
      var parti = String(v).split("~");
      var r = {};
      r[nomeA] = parti[0] || "";
      r[nomeB] = parti[1] || "";
      return r;
    });
    if (!righe.length) {
      var vuota = {};
      vuota[nomeA] = "";
      vuota[nomeB] = "";
      righe.push(vuota);
    }
    return righe;
  }

  function leggiIndirizzo() {
    try {
      var p = new URL(window.location.href).searchParams;
      var anno = (p.get("anno") || "").toLowerCase();

      stato.tuttiAnni = anno === TUTTI;
      stato.anni = anno
        .split(",")
        .map(function (x) {
          return parseInt(x, 10);
        })
        .filter(function (x) {
          return !Number.isNaN(x);
        });

      var posti = p.getAll("q").filter(Boolean);
      stato.posti = posti.length ? posti : [""];
      stato.date = coppie(p.getAll("int"), "da", "a");
      stato.km = coppie(p.getAll("km"), "min", "max");
      stato.stagioni = (p.get("stagione") || "").split(",").filter(Boolean);
      stato.intera = p.get("intera") === "1";
      stato.vista = p.get("vista") === "elenco" ? "elenco" : "stagioni";
    } catch (e) {
      /* si parte dai valori di base */
    }
  }

  // ---------- Form dei filtri (righe multiple) ----------

  // Aggiorna i risultati dopo una breve pausa, per non ridisegnare
  // l'elenco a ogni lettera digitata.
  function aggiornaConPausa() {
    clearTimeout(timerAggiorna);
    timerAggiorna = setTimeout(aggiornaTutto, 180);
  }

  function bottoneRimuovi(etichetta, alClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "rimuovi-data";
    b.setAttribute("aria-label", etichetta);
    b.textContent = "×";
    b.addEventListener("click", alClick);
    return b;
  }

  function campo(tipo, valore, etichetta, segnaposto, alCambio) {
    var i = document.createElement("input");
    i.type = tipo;
    i.value = valore;
    i.setAttribute("aria-label", etichetta);
    if (segnaposto) i.placeholder = segnaposto;
    if (tipo === "number") {
      i.min = "0";
      i.step = "1";
      i.setAttribute("inputmode", "decimal");
    }
    i.addEventListener("input", function () {
      alCambio(i.value);
      aggiornaConPausa();
    });
    return i;
  }

  function separatore(testo) {
    var s = document.createElement("span");
    s.className = "separatore-riga";
    s.textContent = testo;
    return s;
  }

  // Disegna le righe di un gruppo. "righe" e' l'array nello stato,
  // "creaRiga" costruisce i campi di una riga. Il pulsante × c'e'
  // solo se la riga non e' l'unica.
  function disegnaGruppo(idContenitore, righe, vuota, creaRiga, nome) {
    var c = el(idContenitore);
    if (!c) return;
    c.innerHTML = "";

    righe.forEach(function (riga, indice) {
      var r = document.createElement("div");
      r.className = "riga-data-input";
      creaRiga(r, riga, indice);
      if (righe.length > 1) {
        r.appendChild(
          bottoneRimuovi("Rimuovi " + nome, function () {
            righe.splice(indice, 1);
            disegnaForm();
            aggiornaTutto();
          }),
        );
      }
      c.appendChild(r);
    });
  }

  function disegnaForm() {
    disegnaGruppo(
      "contenitorePostiAnno",
      stato.posti,
      "",
      function (r, valore, i) {
        r.appendChild(
          campo("text", valore, "Posto", "Es. Gemona, Lignano…", function (v) {
            stato.posti[i] = v;
          }),
        );
      },
      "questo posto",
    );

    disegnaGruppo(
      "contenitoreDateAnno",
      stato.date,
      null,
      function (r, riga) {
        r.appendChild(separatore("dal"));
        r.appendChild(
          campo("date", riga.da, "Dal giorno", "", function (v) {
            riga.da = v;
          }),
        );
        r.appendChild(separatore("al"));
        r.appendChild(
          campo("date", riga.a, "Al giorno", "", function (v) {
            riga.a = v;
          }),
        );
      },
      "questo intervallo di date",
    );

    disegnaGruppo(
      "contenitoreKmAnno",
      stato.km,
      null,
      function (r, riga) {
        r.appendChild(separatore("da"));
        r.appendChild(
          campo("number", riga.min, "Km minimi", "0", function (v) {
            riga.min = v;
          }),
        );
        r.appendChild(separatore("a"));
        r.appendChild(
          campo("number", riga.max, "Km massimi", "∞", function (v) {
            riga.max = v;
          }),
        );
        r.appendChild(separatore("km"));
      },
      "questo intervallo di km",
    );

    aggiornaLimitiDate();
  }

  function aggiungiRiga(righe, nuova, idContenitore) {
    righe.push(nuova);
    disegnaForm();
    var primo = document.querySelector(
      "#" + idContenitore + " .riga-data-input:last-child input",
    );
    if (primo) primo.focus();
  }

  function agganciaForm() {
    aggancia("aggiungiPostoAnno", "click", function () {
      aggiungiRiga(stato.posti, "", "contenitorePostiAnno");
    });
    aggancia("aggiungiDataAnno", "click", function () {
      aggiungiRiga(stato.date, { da: "", a: "" }, "contenitoreDateAnno");
    });
    aggancia("aggiungiKmAnno", "click", function () {
      aggiungiRiga(stato.km, { min: "", max: "" }, "contenitoreKmAnno");
    });

    aggancia("stagioneIntera", "change", function (e) {
      stato.intera = !!e.target.checked;
      aggiornaTutto();
    });

    aggancia("azzeraFiltri", "click", function () {
      stato.posti = [""];
      stato.date = [{ da: "", a: "" }];
      stato.km = [{ min: "", max: "" }];
      stato.stagioni = [];
      stato.intera = false;
      disegnaForm();
      aggiornaTutto();
    });

    var form = el("filtriCorseAnno");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
      });
    }

    var vista = el("vistaCorseAnno");
    if (vista) {
      vista.querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          stato.vista = b.getAttribute("data-vista");
          aggiornaTutto();
        });
      });
    }
  }

  function aggancia(id, evento, funzione) {
    var c = el(id);
    if (c) c.addEventListener(evento, funzione);
  }

  function aggiornaPulsantiVista() {
    var vista = el("vistaCorseAnno");
    if (!vista) return;
    vista.querySelectorAll("button").forEach(function (b) {
      var attivo = b.getAttribute("data-vista") === stato.vista;
      b.classList.toggle("attivo", attivo);
      b.setAttribute("aria-pressed", attivo ? "true" : "false");
    });
  }

  // ---------- Icona della scheda (favicon) ----------

  // Come le pagine Statistiche/Anni/<anno>.html: l'icona e' l'immagine
  // dell'anno scelto (img/Statistiche/Anni/<anno>.jpg); con piu' anni o
  // con "Tutti gli anni" quella delle statistiche. Se l'immagine di un
  // anno nuovo non esiste ancora, resta l'icona predefinita.
  var FAVICON_PREDEFINITA = "/img/Icons/corse-anno.png";

  function aggiornaFavicon() {
    var link = el("faviconPagina");
    if (!link) return;
    var anno = annoSingolo();
    var percorso =
      anno === null
        ? "/img/Statistiche/Logo_statistiche.jpg"
        : "/img/Statistiche/Anni/" + anno + ".jpg";

    var prova = new Image();
    prova.onload = function () {
      link.href = percorso;
    };
    prova.onerror = function () {
      link.href = FAVICON_PREDEFINITA;
    };
    prova.src = percorso;
  }

  // ---------- Caricamento ----------

  function testoCaricamento() {
    if (stato.tuttiAnni) return "tutti gli anni";
    return stato.anni.length === 1 ? "il " + stato.anni[0] : "gli anni scelti";
  }

  async function caricaEMostra() {
    var numero = ++richiestaAttuale;
    evidenziaAnni();
    aggiornaFavicon();

    var riepilogo = el("riepilogoCorseAnno");
    var elenco = el("risultatiCorseAnno");
    var blocco = el("bloccoRisultatiAnno");
    var vuoto = el("nessunRisultatoAnno");
    var pannello = el("pannelloFiltriAnno");
    if (riepilogo) riepilogo.innerHTML = "";
    if (elenco) elenco.innerHTML = "";
    if (blocco) blocco.hidden = true;
    if (vuoto) vuoto.hidden = true;
    if (pannello) pannello.hidden = true;
    mostraMessaggio("Carico le corse di " + testoCaricamento() + "…");
    aggiornaIndirizzo();

    var uscite;
    try {
      uscite = await caricaAnni();
    } catch (errore) {
      console.error("Errore nel caricamento:", errore);
      cacheAnni = {};
      if (numero === richiestaAttuale) {
        mostraMessaggio("Non sono riuscito a caricare le corse.");
      }
      return;
    }

    // Se nel frattempo e' cambiata la scelta, non disegna.
    if (numero !== richiestaAttuale) return;

    stato.tutte = uscite;

    var presenti = uscite.some(function (u) {
      return stato.tuttiAnni || annoScelto(u.anno);
    });
    if (!presenti) {
      mostraMessaggio("Nessuna corsa trovata per gli anni scelti.");
      return;
    }

    // Stagioni chieste (anche dall'indirizzo) che non esistono negli
    // anni scelti vengono tolte.
    var valide = gruppiPerBottoni().map(function (g) {
      return g.chiave;
    });
    stato.stagioni = stato.stagioni.filter(function (c) {
      return valide.indexOf(c) !== -1;
    });

    mostraMessaggio("");
    if (pannello) pannello.hidden = false;
    if (blocco) blocco.hidden = false;
    disegnaForm();
    aggiornaTutto();
  }

  // ---------- Avvio ----------

  async function avvia() {
    var anni = await anniDisponibili();
    creaBottoniAnni(anni);
    agganciaForm();

    bottoniOrdine = D.inizializzaBottoniOrdine(
      "criterioOrdinamentoAnno",
      function (criterio) {
        stato.ordine = criterio;
        if (stato.tutte.length) disegnaRisultati();
      },
    );
    stato.ordine = bottoniOrdine.leggi();

    leggiIndirizzo();

    // Solo anni che esistono; se non ne resta nessuno, l'anno
    // corrente (o l'ultimo disponibile).
    stato.anni = stato.anni.filter(function (a) {
      return anni.indexOf(a) !== -1;
    });
    if (!stato.tuttiAnni && !stato.anni.length) {
      stato.anni = [
        anni.indexOf(annoCorrente) !== -1 ? annoCorrente : anni[anni.length - 1],
      ];
    }
    stato.anni.sort(function (a, b) {
      return a - b;
    });

    caricaEMostra();
  }

  avvia();
})();
