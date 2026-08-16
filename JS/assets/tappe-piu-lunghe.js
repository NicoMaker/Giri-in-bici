// ============================================================
// tappe-piu-lunghe.js — Podio e classifica delle uscite più lunghe
//
// Logica condivisa fra due contesti:
//   - pagina di un singolo periodo (es. Estate/2025.html): le uscite
//     di quell'anno soltanto, etichettate solo con la data;
//   - pagina generale di una stagione (es. Estate.html): le uscite
//     di TUTTI gli anni di quella stagione messe insieme, etichettate
//     con data e anno (altrimenti "29 Giugno" da solo sarebbe
//     ambiguo fra un anno e l'altro).
//
// Chi chiama questo file prepara le righe già uniformi:
//   { nome, href (o null), etichetta, distance, dataOrdine }
// "href" viene letto da "place" (testo semplice o link al percorso)
// con analizzaLuogo(): se manca, la riga resta non cliccabile.
// "dataOrdine" è opzionale (numero tipo aaaammgg, es. 20240316): a
// parità di distance decide la parità nello stesso verso della
// classifica — dal più al meno pedalato vince la data più vecchia,
// dal meno al più pedalato vince (cioè conta come "più corta") la
// data più recente. Se manca, le righe pari restano nell'ordine in
// cui sono arrivate, come sempre.
//
// Dipendenze: JS/utils.js (formatItalianNumber, formatNumber)
// ============================================================

window.TappePiuLunghe = window.TappePiuLunghe || {};

(function (T) {
  "use strict";

  var MEDAGLIE = ["🥇", "🥈", "🥉"];

  // "place" nel JSON è già HTML, in quattro forme possibili:
  //   1. solo testo                       "Cisterna"
  //   2. testo + bandierina               "Dobrovo <img .../Slovenia.png>"
  //      (le uscite che sconfinano in Slovenia o Austria)
  //   3. un link al percorso              "<a href=...>Nome</a>"
  //   4. un nome + PIÙ link separati      "Udine <br><a>andata</a><br><a>ritorno</a>"
  //      (andata e ritorno tracciate come due percorsi diversi)
  //
  // Il caso 4 è quello delicato: senza distinguerlo, si prende il
  // primo link e si scambia la sua etichetta ("andata") per il nome
  // del posto, perdendo sia il nome vero ("Udine") sia il secondo
  // link ("ritorno"). Qui si contano i link: se sono 2 o più, il nome
  // è il testo che resta togliendo i link (e gli eventuali <br> usati
  // solo per andare a capo), e i link diventano un piccolo gruppo a
  // parte da mostrare insieme nella stessa riga/scheda.
  //
  // Si usa innerHTML (non textContent) per il nome apposta: textContent
  // butterebbe via anche le bandierine insieme al resto dell'HTML. Il
  // <div> di appoggio non viene mai inserito nella pagina, serve solo
  // a farsi leggere il contenuto dal browser senza un'espressione
  // regolare.
  T.analizzaLuogo = function (luogoHtml) {
    var appoggio = document.createElement("div");
    appoggio.innerHTML = luogoHtml;
    var link = appoggio.querySelectorAll("a[href]");

    if (link.length >= 2) {
      var senzaLink = appoggio.cloneNode(true);
      Array.prototype.forEach.call(
        senzaLink.querySelectorAll("a"),
        function (a) {
          a.remove();
        },
      );
      Array.prototype.forEach.call(
        senzaLink.querySelectorAll("br"),
        function (br) {
          br.remove();
        },
      );
      var nomePostoTesto = (senzaLink.textContent || "").trim();
      return {
        nome: senzaLink.innerHTML.trim() || nomePostoTesto,
        nomeTesto: nomePostoTesto,
        href: null,
        linkMultipli: Array.prototype.map.call(link, function (a) {
          return {
            testo: (a.textContent || "").trim(),
            href: a.getAttribute("href"),
          };
        }),
      };
    }

    var contenitoreNome = link[0] || appoggio;
    return {
      nome: contenitoreNome.innerHTML,
      nomeTesto: (contenitoreNome.textContent || "").trim(),
      href: link[0] ? link[0].getAttribute("href") : null,
      linkMultipli: null,
    };
  };

  // Il gruppo di link "andata / ritorno" (o simili), sempre nella
  // stessa riga/scheda del nome del posto, mai come righe separate.
  function creaLinkMultipli(linkMultipli) {
    if (!linkMultipli || !linkMultipli.length) return "";
    return (
      '<span class="tappa-link-multipli">' +
      linkMultipli
        .map(function (l) {
          return (
            '<a href="' +
            l.href +
            '" target="_blank" rel="noopener">' +
            l.testo +
            "</a>"
          );
        })
        .join("") +
      "</span>"
    );
  }
  // Esposta pubblicamente: la riusa anche calcolo_km_media_periodi.js
  // per dare la stessa veste a pillola ai link "andata/ritorno" nella
  // tabella cronologica di ogni periodo (prima erano due <a> di testo
  // semplice, uno sotto l'altro, senza stile).
  T.creaLinkMultipli = creaLinkMultipli;

  T.creaPodio = function (righe) {
    return righe
      .slice(0, 3)
      .map(function (r, i) {
        // Bottone "Vai alla tappa" in fondo alla card, stesso stile
        // (.podio__vai, gia' condiviso via CSS) del "Vai alla stagione"
        // e "Vai al periodo" degli altri due podi. Ha senso solo se la
        // card e' un unico link cliccabile: col gruppo andata/ritorno
        // non c'e' un singolo href a cui puntare, e le due pillole
        // stesse fanno gia' da invito al click.
        var vaiATappa = r.href
          ? '<span class="podio__vai">Vai alla tappa <span class="freccia" aria-hidden="true">→</span></span>'
          : "";
        var dentro =
          '<span class="podio__medaglia" aria-hidden="true">' +
          MEDAGLIE[i] +
          '</span><span class="podio__mese">' +
          r.nome +
          "</span>" +
          creaLinkMultipli(r.linkMultipli) +
          '<span class="podio__km anima-numero">' +
          formatItalianNumber(r.distance) +
          ' km</span><span class="podio__dettaglio">' +
          r.etichetta +
          "</span>" +
          vaiATappa;
        return r.href
          ? '<a class="podio__gradino podio__gradino--' +
              (i + 1) +
              '" href="' +
              r.href +
              '" target="_blank" rel="noopener">' +
              dentro +
              "</a>"
          : '<div class="podio__gradino podio__gradino--' +
              (i + 1) +
              '">' +
              dentro +
              "</div>";
      })
      .join("");
  };

  T.creaLista = function (righe, totaleKm, limite) {
    // "massimo" scala la barra di ogni riga: va preso col vero valore
    // più alto (Math.max), non il primo elemento. Con il pulsante
    // "Ordine" la lista può arrivare qui ordinata dal più corto al
    // più lungo, dove il primo elemento è il più BASSO.
    var massimo = righe.reduce(function (m, r) {
      return r.distance > m ? r.distance : m;
    }, 0);
    var righeMostrate = limite ? righe.slice(0, limite) : righe;
    return righeMostrate
      .map(function (r, i) {
        var quota = massimo > 0 ? (r.distance / massimo) * 100 : 0;
        var percentualeTotale =
          totaleKm > 0 ? formatNumber((r.distance / totaleKm) * 100) : "0";
        var dentro =
          '<span class="classifica-riga__posizione">' +
          (i + 1) +
          '&ordm;</span><span class="classifica-riga__mese">' +
          r.nome +
          '<small class="classifica-riga__sotto">' +
          r.etichetta +
          "</small>" +
          creaLinkMultipli(r.linkMultipli) +
          '</span><span class="classifica-riga__barra"><span style="--percentuale:' +
          quota +
          '%"></span></span><span class="classifica-riga__km anima-numero">' +
          formatItalianNumber(r.distance) +
          ' km</span><span class="classifica-riga__percentuale">' +
          percentualeTotale +
          " %</span>";
        var classi =
          "classifica-riga" +
          (i < 3 ? " classifica-riga--podio" : "") +
          (r.href ? " classifica-riga--cliccabile" : "");
        return r.href
          ? '<li class="' +
              classi +
              '"><a class="classifica-riga__link" href="' +
              r.href +
              '" target="_blank" rel="noopener" aria-label="Vedi il percorso di ' +
              r.nomeTesto +
              ", " +
              r.etichetta +
              '">' +
              dentro +
              "</a></li>"
          : '<li class="' + classi + '">' + dentro + "</li>";
      })
      .join("");
  };

  // Riempie i due contenitori se esistono in pagina; se non ci sono
  // (pagine che non hanno questa sezione) non fa nulla. "limite" è
  // opzionale: le pagine di singola stagione/periodo mostrano solo le
  // prime N (poche righe, non l'elenco intero), la scheda dedicata
  // nella pagina Classifica invece le mostra tutte (nessun limite).
  //
  // "ordine" è opzionale ("desc" di default: le pagine di stagione/anno
  // come Estate.html non lo passano mai e continuano a vedere le
  // uscite più lunghe per prime, come sempre). Nella scheda "Giri"
  // della pagina Classifica, dove il pulsante "Ordine" esiste davvero,
  // sceglie invece podio E lista insieme — "dal meno al più lungo"
  // inverte tutto, podio compreso, stesso comportamento delle altre
  // schede (vedi assets/classifica-controlli.js). Oltre a "desc"/"asc"
  // (per distanza) accetta anche "alfabetico"/"alfabetico-desc" (per
  // nome del posto) e "data-recente"/"data-vecchio" (per data della
  // tappa, campo "dataOrdine").
  T.mostra = function (idPodio, idLista, righe, limite, ordine) {
    var contenitorePodio = document.getElementById(idPodio);
    var contenitoreLista = document.getElementById(idLista);
    if (!contenitorePodio || !contenitoreLista) return;

    var righeOrdinate;

    if (ordine === "alfabetico" || ordine === "alfabetico-desc") {
      // Alfabetico per nome del posto (testo semplice, senza gli
      // eventuali link/bandierine di "nome"): stesso confronto
      // "italiano" usato da ClassificaControlli.ordina.
      righeOrdinate = righe.slice().sort(function (a, b) {
        var risultato = String(a.nomeTesto || a.nome || "").localeCompare(
          String(b.nomeTesto || b.nome || ""),
          "it",
          { sensitivity: "base", numeric: true },
        );
        return ordine === "alfabetico-desc" ? -risultato : risultato;
      });
    } else if (ordine === "data-recente" || ordine === "data-vecchio") {
      // Per data della tappa (dataOrdine, tipo aaaammgg): dal piu'
      // recente al meno recente o viceversa.
      righeOrdinate = righe.slice().sort(function (a, b) {
        return ordine === "data-recente"
          ? (b.dataOrdine || 0) - (a.dataOrdine || 0)
          : (a.dataOrdine || 0) - (b.dataOrdine || 0);
      });
    } else {
      var ordineEffettivo = ordine === "asc" ? "asc" : "desc";
      righeOrdinate = righe.slice().sort(function (a, b) {
        var perDistanza =
          ordineEffettivo === "asc"
            ? a.distance - b.distance
            : b.distance - a.distance;
        if (perDistanza !== 0) return perDistanza;
        // Stessi km: la parita' la decide la data, nello STESSO verso
        // della classifica attuale — non e' una regola fissa a se'.
        // Dal piu' al meno pedalato vince chi l'ha fatta prima (la
        // data piu' vecchia "pesa" come se la strada fosse un filo piu'
        // lunga). Dal meno al piu' pedalato si specchia: chi l'ha fatta
        // DOPO conta come se fosse un filo piu' corta, quindi passa
        // avanti li'. Esempio: 70km il 5 luglio e 70km il 6 luglio —
        // nell'ordine "dal meno al piu'" il 6 luglio risulta la piu'
        // corta delle due e va prima; nell'ordine "dal piu' al meno" e'
        // il 5 luglio a vincere la parita' e andare prima.
        return ordineEffettivo === "asc"
          ? (b.dataOrdine || 0) - (a.dataOrdine || 0)
          : (a.dataOrdine || 0) - (b.dataOrdine || 0);
      });
    }
    var totaleKm = righe.reduce(function (tot, r) {
      return tot + r.distance;
    }, 0);

    contenitorePodio.innerHTML = T.creaPodio(righeOrdinate);
    contenitoreLista.innerHTML = T.creaLista(righeOrdinate, totaleKm, limite);
  };
})(window.TappePiuLunghe);
