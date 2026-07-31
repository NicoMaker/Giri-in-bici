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
//   { nome, href (o null), etichetta, distance }
// "href" viene letto da "place" (testo semplice o link al percorso)
// con analizzaLuogo(): se manca, la riga resta non cliccabile.
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

  T.creaPodio = function (righe) {
    return righe
      .slice(0, 3)
      .map(function (r, i) {
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
          "</span>";
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
    var massimo = righe.length ? righe[0].distance : 0;
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
  T.mostra = function (idPodio, idLista, righe, limite) {
    var contenitorePodio = document.getElementById(idPodio);
    var contenitoreLista = document.getElementById(idLista);
    if (!contenitorePodio || !contenitoreLista) return;

    var righeOrdinate = righe.slice().sort(function (a, b) {
      return b.distance - a.distance;
    });
    var totaleKm = righe.reduce(function (tot, r) {
      return tot + r.distance;
    }, 0);

    contenitorePodio.innerHTML = T.creaPodio(righeOrdinate);
    contenitoreLista.innerHTML = T.creaLista(righeOrdinate, totaleKm, limite);
  };
})(window.TappePiuLunghe);
