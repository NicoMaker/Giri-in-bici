// ============================================================
// condividi.js — Pulsante "Condividi" con immagine e dati della pagina
//
// Un pulsante flottante, uguale in ogni pagina (creato via JS,
// come ".to-top" — nessun HTML da toccare pagina per pagina).
// Al tocco:
//   1. raccoglie TUTTI i dati testuali della pagina (titoli, righe
//      dati, podio, classifiche, tabelle, grafici...), non solo il
//      link;
//   2. cattura in immagine tutto il contenuto (<main>), grafici
//      compresi, con html2canvas (caricato da CDN solo al primo
//      utilizzo: non pesa sul caricamento delle pagine che non lo
//      usano);
//   3. se il dispositivo supporta la condivisione di file (Web
//      Share API, per lo più mobile), apre il pannello di
//      condivisione di sistema con l'immagine e il testo dei dati
//      già pronti: l'invio vero e proprio lo fa il sistema;
//   4. altrove (niente Web Share API, tipico da desktop), scarica
//      l'immagine e mostra dei link VERI da toccare — WhatsApp ed
//      Email, già pronti con tutti i dati dentro — cosi' si invia
//      davvero, non ci si limita a copiare. "Copia" resta comunque
//      disponibile come scelta in più, non come unica via d'uscita.
// Non blocca mai: se la cattura o la condivisione falliscono, si
// passa comunque a offrire questi link di invio.
//
// Stili corrispondenti: assets/css/componenti/interazioni/condividi.css
// Dipendenza runtime (solo al click): html2canvas da CDN.
// ============================================================

(function () {
  "use strict";

  var HTML2CANVAS_URL =
    "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";

  var motoRidotto = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  var promessaLibreria = null;
  function caricaHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    if (promessaLibreria) return promessaLibreria;
    promessaLibreria = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = HTML2CANVAS_URL;
      script.onload = function () {
        if (window.html2canvas) resolve(window.html2canvas);
        else reject(new Error("html2canvas non disponibile dopo il caricamento"));
      };
      script.onerror = function () {
        reject(new Error("Impossibile caricare html2canvas"));
      };
      document.head.appendChild(script);
    });
    return promessaLibreria;
  }

  // Rete di sicurezza: se il caricamento della libreria o la cattura
  // stessa restano bloccati (rete lenta, pagina molto pesante...), non
  // si resta impantanati per sempre col pulsante "in corso" e la
  // pagina forzata in modalità cattura. Dopo "ms" si passa comunque
  // al ripiego (link di invio).
  function conTimeout(promessa, ms, messaggioErrore) {
    return new Promise(function (resolve, reject) {
      var scaduto = false;
      var timer = setTimeout(function () {
        scaduto = true;
        reject(new Error(messaggioErrore || "Tempo scaduto"));
      }, ms);
      promessa.then(
        function (valore) {
          if (scaduto) return;
          clearTimeout(timer);
          resolve(valore);
        },
        function (errore) {
          if (scaduto) return;
          clearTimeout(timer);
          reject(errore);
        },
      );
    });
  }

  // ---------- Avviso in basso ("Copiato", "Condiviso"...) ----------
  var avvisoEl = null;
  var avvisoTimer = null;
  function mostraAvviso(testo) {
    if (!avvisoEl) {
      avvisoEl = document.createElement("div");
      avvisoEl.setAttribute("role", "status");
      avvisoEl.setAttribute("aria-live", "polite");
      document.body.appendChild(avvisoEl);
    }
    avvisoEl.className = "avviso-condiviso";
    avvisoEl.textContent = testo;
    avvisoEl.classList.add("visibile");
    clearTimeout(avvisoTimer);
    avvisoTimer = setTimeout(
      function () {
        avvisoEl.classList.remove("visibile");
      },
      motoRidotto ? 1600 : 2600,
    );
  }

  // ---------- Raccolta di TUTTI i dati testuali della pagina ----------
  // Un solo elenco di selettori che copre l'intero sito, senza dover
  // sapere di quale pagina si tratta: sono le classi già usate ovunque
  // per titoli, sottotitoli, righe di dati (.misuracolore), podio,
  // classifiche, schede bici e tabelle. Ogni elemento diventa una riga
  // di testo, nell'ordine in cui compare nella pagina.
  var SELETTORE_DATI =
    "h1, h2, h3, .hero-sub, .classifica-titolo, .misuracolore, " +
    ".podio__gradino, .classifica-riga, .bici-card__spec, tr";

  function pulisciTesto(testo) {
    return (testo || "").replace(/\s+/g, " ").trim();
  }

  // Una riga di tabella diventa "cella — cella — cella": senza questo,
  // il testo di tutte le celle risulterebbe incollato senza spazi.
  function rigaTabella(tr) {
    var celle = Array.prototype.slice
      .call(tr.querySelectorAll("th, td"))
      .map(function (c) {
        return pulisciTesto(c.textContent);
      })
      .filter(Boolean);
    return celle.join(" — ");
  }

  // ---------- Dati dei grafici (Chart.js) ----------
  // L'immagine catturata mostra già i grafici disegnati, ma quando si
  // condivide/copia solo il testo (niente file, es. molti browser da
  // desktop) i grafici altrimenti sparirebbero del tutto: un <canvas>
  // non ha testo da leggere nella pagina. Chart.js tiene un registro di
  // tutti i grafici creati (Chart.instances): da lì si leggono
  // etichette e valori veri, non serve sapere quale pagina sia.
  function nomeGrafico(canvas) {
    var sezione = canvas.closest(".section") || canvas.parentElement;
    var titolo = sezione && sezione.querySelector("h1, h2, h3");
    return titolo ? pulisciTesto(titolo.textContent) : canvas.id || "Grafico";
  }

  function raccogliDatiGrafici(contenuto) {
    if (!window.Chart || !window.Chart.instances) return [];

    var formatta =
      typeof window.formatItalianNumber === "function"
        ? window.formatItalianNumber
        : function (n) {
            return String(n);
          };
    var canvasNellaPagina = Array.prototype.slice.call(
      contenuto.querySelectorAll("canvas"),
    );
    var righe = [];

    Object.keys(window.Chart.instances).forEach(function (chiave) {
      var chart = window.Chart.instances[chiave];
      if (!chart || !chart.canvas) return;
      if (canvasNellaPagina.indexOf(chart.canvas) === -1) return; // fuori da <main>

      var etichette = (chart.data && chart.data.labels) || [];
      var dataset = chart.data && chart.data.datasets && chart.data.datasets[0];
      if (!etichette.length || !dataset || !dataset.data) return;

      var voci = etichette
        .map(function (etichetta, i) {
          var grezzo = dataset.data[i];
          var valore =
            grezzo && typeof grezzo === "object" ? grezzo.y : grezzo;
          if (valore === undefined || valore === null) return "";
          return pulisciTesto(String(etichetta)) + " " + formatta(valore);
        })
        .filter(Boolean);

      if (voci.length) righe.push(nomeGrafico(chart.canvas) + ": " + voci.join(", "));
    });

    return righe;
  }

  function raccogliTestoDati(contenuto) {
    var righe = [pulisciTesto(document.title)];
    contenuto.querySelectorAll(SELETTORE_DATI).forEach(function (el) {
      var testo = el.tagName === "TR" ? rigaTabella(el) : pulisciTesto(el.textContent);
      if (testo) righe.push(testo);
    });

    var righeGrafici = raccogliDatiGrafici(contenuto);
    if (righeGrafici.length) {
      righe.push("Grafici:");
      righe = righe.concat(righeGrafici);
    }

    return righe.join("\n");
  }

  // ---------- Copia TUTTI i dati (usata dal link "Copia" qui sotto) ----------
  function copiaDati(testoCompleto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(testoCompleto)
        .then(function () {
          mostraAvviso("Dati copiati negli appunti");
        })
        .catch(function () {
          mostraAvviso("Impossibile copiare i dati");
        });
    } else {
      mostraAvviso("Copia il link dalla barra dell'indirizzo");
    }
  }

  // ---------- Invio vero (ripiego quando manca la condivisione di sistema) ----------
  // Non si copia e basta: si offrono link veri, WhatsApp, Telegram ed
  // Email, già pronti con tutti i dati dentro. Un tocco su un link è
  // un gesto dell'utente a tutti gli effetti: apre davvero l'app
  // scelta, pronta per l'invio, senza rischiare di essere bloccato
  // come un'apertura automatica lo sarebbe.
  //
  // wa.me, t.me e soprattutto mailto: hanno un limite pratico di
  // lunghezza del link (su alcuni programmi di posta, specie certe
  // versioni di Windows, un mailto: troppo lungo non si apre proprio
  // o arriva troncato a metà parola). Il problema non è quanti
  // CARATTERI ha il testo, ma quanto pesa una volta "codificato" per
  // stare dentro un indirizzo: accenti, "—" e le medaglie 🥇🥈🥉 del
  // podio possono arrivare a pesare 3-12 volte tanto. Per questo si
  // accorcia guardando la lunghezza già codificata, tagliando finché
  // non sta sotto il limite — e si lascia comunque il link della
  // pagina alla fine, così i dati completi restano sempre
  // raggiungibili. La copia negli appunti invece non ha questo
  // problema: non è un indirizzo, non serve accorciare nulla.
  // Taglia una stringa senza mai spezzare a metà un'emoji: in
  // JavaScript un'emoji come 🥇 è fatta di due "unità" di codice
  // (una coppia surrogata). Tagliando esattamente in mezzo si ottiene
  // una stringa non valida che manda in errore encodeURIComponent —
  // e questo bloccherebbe tutta la funzione qui sotto, medaglie del
  // podio comprese.
  function taglioSicuro(testo, lunghezza) {
    var tagliato = testo.slice(0, lunghezza);
    var ultimoCodice = tagliato.charCodeAt(tagliato.length - 1);
    // 0xD800–0xDBFF: prima metà di una coppia surrogata, senza la
    // seconda metà. Si toglie anche quella per restare validi.
    if (ultimoCodice >= 0xd800 && ultimoCodice <= 0xdbff) {
      tagliato = tagliato.slice(0, -1);
    }
    return tagliato;
  }

  function accorciaCodificato(testo, massimoCodificato) {
    var puntini = "…";
    var pesoPuntini = encodeURIComponent(puntini).length;
    var attuale = testo;
    var serveTaglio = encodeURIComponent(attuale).length > massimoCodificato;
    // Si lascia spazio, fin da subito, per i "…" che verranno
    // aggiunti alla fine: pesano anche loro una volta codificati (9
    // caratteri per un solo carattere "…"), altrimenti il risultato
    // finale sforerebbe il limite proprio per quei puntini.
    var limiteEffettivo = serveTaglio
      ? Math.max(0, massimoCodificato - pesoPuntini)
      : massimoCodificato;

    while (
      attuale.length > 0 &&
      encodeURIComponent(attuale).length > limiteEffettivo
    ) {
      // Un pezzo alla volta, più grande se si è ancora lontani dal
      // limite: evita di dover tagliare un carattere per volta su
      // testi molto più lunghi del consentito.
      var eccesso = encodeURIComponent(attuale).length - limiteEffettivo;
      var daTagliare = Math.max(1, Math.ceil(eccesso / 3));
      attuale = taglioSicuro(attuale, Math.max(0, attuale.length - daTagliare));
    }
    return serveTaglio ? attuale + puntini : attuale;
  }

  function mostraScelteInvio(testoCompleto) {
    if (!avvisoEl) {
      avvisoEl = document.createElement("div");
      avvisoEl.setAttribute("role", "status");
      avvisoEl.setAttribute("aria-live", "polite");
      document.body.appendChild(avvisoEl);
    }
    avvisoEl.className = "avviso-condiviso avviso-condiviso--scelte";
    avvisoEl.innerHTML = "";

    var etichetta = document.createElement("span");
    etichetta.className = "avviso-condiviso__etichetta";
    etichetta.textContent = "Invia con:";
    avvisoEl.appendChild(etichetta);

    // 1200 caratteri codificati: comodo margine sotto ai ~2000 che
    // vanno in crisi su alcune configurazioni Windows per mailto:,
    // e ben dentro ai limiti, più larghi, di WhatsApp e Telegram.
    var testoBreve = accorciaCodificato(testoCompleto, 1200);
    var oggetto = encodeURIComponent(document.title || "Giri in Bici");
    var corpo = encodeURIComponent(testoBreve);

    var linkWhatsApp = document.createElement("a");
    linkWhatsApp.className = "avviso-condiviso__link";
    linkWhatsApp.href = "https://wa.me/?text=" + corpo;
    linkWhatsApp.target = "_blank";
    linkWhatsApp.rel = "noopener";
    linkWhatsApp.textContent = "WhatsApp";

    var linkTelegram = document.createElement("a");
    linkTelegram.className = "avviso-condiviso__link";
    linkTelegram.href =
      "https://t.me/share/url?url=" +
      encodeURIComponent(location.href) +
      "&text=" +
      corpo;
    linkTelegram.target = "_blank";
    linkTelegram.rel = "noopener";
    linkTelegram.textContent = "Telegram";

    var linkEmail = document.createElement("a");
    linkEmail.className = "avviso-condiviso__link";
    linkEmail.href = "mailto:?subject=" + oggetto + "&body=" + corpo;
    linkEmail.textContent = "Email";

    var linkCopia = document.createElement("button");
    linkCopia.type = "button";
    linkCopia.className = "avviso-condiviso__link";
    linkCopia.textContent = "Copia";
    linkCopia.addEventListener("click", function () {
      copiaDati(testoCompleto);
    });

    var bottoneChiudi = document.createElement("button");
    bottoneChiudi.type = "button";
    bottoneChiudi.className = "avviso-condiviso__chiudi";
    bottoneChiudi.setAttribute("aria-label", "Chiudi senza inviare");
    bottoneChiudi.innerHTML = "&times;";
    bottoneChiudi.addEventListener("click", function () {
      clearTimeout(avvisoTimer);
      avvisoEl.classList.remove("visibile");
    });

    avvisoEl.appendChild(linkWhatsApp);
    avvisoEl.appendChild(linkTelegram);
    avvisoEl.appendChild(linkEmail);
    avvisoEl.appendChild(linkCopia);
    avvisoEl.appendChild(bottoneChiudi);

    avvisoEl.classList.add("visibile");
    clearTimeout(avvisoTimer);
    // Resta di più della semplice conferma: qui bisogna fare in tempo
    // a leggere e toccare uno dei link, non solo prendere atto.
    avvisoTimer = setTimeout(
      function () {
        avvisoEl.classList.remove("visibile");
      },
      motoRidotto ? 7000 : 10000,
    );
  }

  // ---------- Scarica l'immagine catturata (ripiego con immagine) ----------
  function scaricaImmagine(blob, nomeFile) {
    var link = document.createElement("a");
    var oggettoUrl = URL.createObjectURL(blob);
    link.href = oggettoUrl;
    link.download = nomeFile;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(oggettoUrl);
    }, 4000);
  }

  function nomeFilePagina() {
    var base = (document.title || "giri-in-bici")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return (base || "giri-in-bici") + ".png";
  }

  // ---------- Condivisione vera e propria ----------
  function preparaCatturaCompleta() {
    // 1. Numeri ancora a meta' del conteggio -> valore finale subito.
    if (typeof window.completaConteggiOra === "function") {
      window.completaConteggiOra();
    }
    // 2. Sezioni "a comparsa" e card create da JS (podio, classifiche...)
    //    mai scorse fin li' -> visibili subito, niente animazione.
    document.documentElement.classList.add("condividi-cattura");
    // Forza il browser a ricalcolare subito lo stile (altrimenti il
    // cambiamento sopra potrebbe non essere ancora "dipinto" quando
    // html2canvas legge la pagina un istante dopo).
    void document.documentElement.offsetHeight;
  }

  function ripristinaDopoCattura() {
    document.documentElement.classList.remove("condividi-cattura");
  }

  function condividi(bottone) {
    if (bottone.classList.contains("in-corso")) return;
    bottone.classList.add("in-corso");

    var contenuto = document.querySelector("main") || document.body;
    var titolo = document.title || "Giri in Bici";

    preparaCatturaCompleta();

    // I dati si estraggono SUBITO dopo aver finalizzato conteggi e
    // sezioni: cosi' i numeri nel testo sono quelli veri, non "0".
    var testoDati = raccogliTestoDati(contenuto);
    // Per la condivisione con Web Share (che ha un limite di
    // lunghezza ragionevole da rispettare per restare leggibile nelle
    // app di destinazione) si usa lo stesso testo completo, col link
    // in fondo; per la copia negli appunti non c'e' bisogno di
    // troncare nulla, il testo intero e' sempre gestibile.
    var testoCondivisione = testoDati + "\n\n" + location.href;

    conTimeout(caricaHtml2Canvas(), 12000, "Libreria non caricata in tempo")
      .then(function (html2canvas) {
        // Timeout dedicato: pagine molto pesanti (tante foto, tabelle
        // enormi) potrebbero impiegare tanto a essere "disegnate" in
        // immagine. Con 20s si copre anche una rete lenta, senza
        // rischiare di restare bloccati per sempre.
        return conTimeout(
          html2canvas(contenuto, {
            backgroundColor: "#ffffff",
            useCORS: true,
            scale: Math.min(window.devicePixelRatio || 1, 2),
          }),
          20000,
          "Cattura troppo lenta",
        );
      })
      .then(function (canvas) {
        ripristinaDopoCattura();
        return new Promise(function (resolve) {
          canvas.toBlob(resolve, "image/png");
        });
      })
      .then(function (blob) {
        if (!blob) throw new Error("Immagine non generata");

        var file = new File([blob], nomeFilePagina(), { type: "image/png" });

        if (
          navigator.canShare &&
          navigator.canShare({ files: [file] }) &&
          navigator.share
        ) {
          // Condividendo un file, "url" non va passato insieme
          // (molti browser lo ignorano o si lamentano): il link resta
          // comunque dentro il testo, in fondo ai dati.
          return navigator
            .share({ files: [file], title: titolo, text: testoCondivisione })
            .then(function () {
              mostraAvviso("Condiviso!");
            });
        }

        if (navigator.share) {
          // Niente condivisione di file su questo dispositivo: si
          // scarica comunque l'immagine e si condividono almeno tutti
          // i dati testuali (non solo il link).
          scaricaImmagine(blob, nomeFilePagina());
          return navigator
            .share({ title: titolo, text: testoDati, url: location.href })
            .then(function () {
              mostraAvviso("Condiviso!");
            });
        }

        // Nessuna Web Share API: immagine scaricata, e si offrono i
        // link veri per inviare tutti i dati (non solo copiarli).
        scaricaImmagine(blob, nomeFilePagina());
        mostraScelteInvio(testoCondivisione);
      })
      .catch(function (errore) {
        // Se la cattura fallisce a metà, la pagina non deve restare
        // "congelata" nello stato forzato per la condivisione.
        ripristinaDopoCattura();
        // L'utente ha annullato la condivisione: non è un errore da
        // segnalare, si chiude e basta.
        if (errore && errore.name === "AbortError") return;
        // Qualunque altro problema (cattura fallita, condivisione non
        // riuscita, html2canvas non disponibile...): non si resta
        // bloccati, si offrono comunque i link per inviare i dati.
        mostraScelteInvio(testoCondivisione);
      })
      .then(function () {
        bottone.classList.remove("in-corso");
      })
      .catch(function () {
        bottone.classList.remove("in-corso");
      });
  }

  function avvia() {
    var bottone = document.createElement("button");
    bottone.type = "button";
    bottone.className = "condividi-pulsante";
    bottone.setAttribute("aria-label", "Condividi questa pagina con un'immagine");
    bottone.innerHTML =
      '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="18" cy="5" r="3"></circle>' +
      '<circle cx="6" cy="12" r="3"></circle>' +
      '<circle cx="18" cy="19" r="3"></circle>' +
      '<line x1="8.6" y1="10.6" x2="15.4" y2="6.4"></line>' +
      '<line x1="8.6" y1="13.4" x2="15.4" y2="17.6"></line>' +
      "</svg>";
    document.body.appendChild(bottone);

    bottone.addEventListener("click", function () {
      condividi(bottone);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})();
