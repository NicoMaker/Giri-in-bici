// ============================================================
// numeri.js — Conteggio animato dei numeri (.misuracolore,
// .anima-numero, celle delle tabelle, valori delle schede bici).
//
// Stili corrispondenti: assets/css/componenti/animazioni/animazioni.css
// Nessuna dipendenza. Rispetta prefers-reduced-motion.
// Richiamato da assets/motion/contenuti-animati.js
//
// MODIFICA 2026-08-19: separati due passaggi che prima erano uno
// solo (animaNumero):
//   1) costruisciNumeri — SEMPRE sincrono, appena la scheda esiste
//      nel DOM. Avvolge il numero-valore in <span class="num">
//      (o ".num-anim" per i numeri secondari) e scrive subito il
//      testo finale, gia' formattato.
//   2) animaConteggio    — SOLO estetico, parte quando la card
//      entra nello schermo (IntersectionObserver) e se l'utente
//      non ha richiesto "riduci animazioni": riparte da 0 e sale
//      fino al valore che il passaggio 1 ha gia' scritto.
//
// Prima il passaggio 1 avveniva solo dentro l'IntersectionObserver
// (quindi mai per le schede fuori schermo al primo sguardo) e
// veniva saltato del tutto con "prefers-reduced-motion: reduce".
// Risultato: la stessa card, a seconda di quando/come veniva
// vista, appariva con il valore allineato a destra (".num" gia'
// creato) oppure con etichetta+valore+distintivo tutti appiccicati
// a sinistra (".num" mai creato) — la stessa card "con una grafica
// diversa" a seconda dei casi. Separando i due passaggi, il
// markup — e quindi l'aspetto — e' sempre lo stesso: cambia solo
// se il numero sale da 0 o compare gia' al valore finale.
// ============================================================

window.ContenutiAnimati = window.ContenutiAnimati || {};

(function (CA) {
  "use strict";

  var motoRidotto = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Formattazione italiana con separatore delle migliaia SEMPRE attivo da
  // 1.000 in su. Non si usa toLocaleString("it-IT") perche' la regola CLDR
  // italiana non raggruppa i numeri a 4 cifre (1234 restava "1234" mentre
  // 12345 diventava "12.345"): l'animazione sovrascriveva cosi' la
  // formattazione corretta prodotta da JS/utils.js.
  function formattaNumero(valore, decimali, minInteri) {
    var negativo = valore < 0;
    var fisso = Math.abs(valore).toFixed(decimali);
    var pezzi = fisso.split(".");
    var intero = pezzi[0];

    // Zero iniziale: se la sorgente aveva piu' cifre (es. "08"), si mantiene
    // la larghezza paddizzando con zeri prima di raggruppare le migliaia.
    if (minInteri && intero.length < minInteri) {
      intero = intero.padStart(minInteri, "0");
    }

    if (intero.length > 3) {
      var gruppi = [];
      var i = intero.length;
      while (i > 0) {
        gruppi.unshift(intero.substring(Math.max(0, i - 3), i));
        i -= 3;
      }
      intero = gruppi.join(".");
    }

    return (negativo ? "-" : "") + intero + (pezzi[1] ? "," + pezzi[1] : "");
  }

  function conta(elemento, obiettivo, decimali, minInteri) {
    var durata = 1100;
    var avvio = null;

    function passo(ora) {
      if (avvio === null) avvio = ora;
      var t = Math.min((ora - avvio) / durata, 1);
      var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      elemento.textContent = formattaNumero(
        obiettivo * eased,
        decimali,
        minInteri,
      );
      if (t < 1) window.requestAnimationFrame(passo);
      else
        elemento.textContent = formattaNumero(obiettivo, decimali, minInteri);
    }

    window.requestAnimationFrame(passo);
  }

  // ------------------------------------------------------------
  // costruisciNumeri — SEMPRE sincrono: individua i numeri nel
  // testo dell'elemento e li avvolge in <span>, gia' con il testo
  // finale (formattato, non animato). Questo e' cio' che decide
  // il layout (".num" va a destra via CSS): deve quindi succedere
  // sempre, non solo quando la card e' visibile o quando le
  // animazioni sono attive.
  //
  // Nelle righe .misuracolore / .anima-numero un solo numero va allineato a
  // destra in grassetto (classe .num): quello è il VALORE della riga. Come
  // valore si sceglie l'ultimo numero che sta FUORI dalle parentesi, così
  // "Medie corse per mese (12 mesi) 27,92" mette a destra 27,92 e lascia
  // "(12 mesi)" al suo posto nell'etichetta. Tutti gli altri numeri (dentro
  // le parentesi, nelle tabelle, nelle schede) vanno in .num-anim, neutro:
  // contano senza spostare nulla.
  //
  // Ritorna la lista { span, valore, decimali, minInteri } dei numeri
  // trovati, cosi' animaConteggio puo' farli ripartire da 0 in seguito
  // senza dover rileggere/ricostruire il DOM.
  // ------------------------------------------------------------
  function costruisciNumeri(elemento) {
    if (elemento.dataset.costruito) return [];
    elemento.dataset.costruito = "1";

    var vuoleValore =
      elemento.classList &&
      (elemento.classList.contains("misuracolore") ||
        elemento.classList.contains("anima-numero"));

    // Raccoglie i nodi di testo in ordine e il testo unito, con gli offset.
    var walker = document.createTreeWalker(
      elemento,
      NodeFilter.SHOW_TEXT,
      null,
    );
    var nodi = [];
    var inizi = [];
    var unito = "";
    while (walker.nextNode()) {
      inizi.push(unito.length);
      nodi.push(walker.currentNode);
      unito += walker.currentNode.nodeValue;
    }

    var numero = /(\d{1,3}(?:\.\d{3})+|\d+)(,\d+)?/g;

    // Trova a quale nodo di testo appartiene una posizione assoluta in
    // "unito" (per sapere in che elemento vive quel numero).
    function nodoDiPosizione(posizioneAssoluta) {
      var idx = 0;
      for (var k = 0; k < inizi.length; k++) {
        if (inizi[k] <= posizioneAssoluta) idx = k;
        else break;
      }
      return nodi[idx];
    }

    // Un numero dentro un distintivo (.badge, es. "▼ - 12,3% vs...") non e'
    // MAI il valore principale della riga: e' un dettaglio a corredo. Se lo
    // si scegliesse come ".num", il margin-left:auto che lo dovrebbe
    // spingere a destra si applicherebbe allo <span> annidato dentro il
    // badge — non alla riga — quindi non sposterebbe visivamente nulla e
    // l'intera riga resterebbe appiccicata a sinistra (proprio il difetto
    // "stessa scheda, grafica diversa" quando compare un distintivo con
    // percentuale reale invece del semplice "—").
    function dentroBadge(posizioneAssoluta) {
      var nodo = nodoDiPosizione(posizioneAssoluta);
      var el = nodo && nodo.parentNode;
      return !!(el && el.closest && el.closest(".badge"));
    }

    // Posizione (assoluta) del valore da mettere a destra: l'ultimo numero
    // fuori dalle parentesi e fuori da un badge; se non ce ne sono, l'ultimo
    // fuori da un badge in assoluto.
    var posValore = -1;
    if (vuoleValore) {
      var mm;
      var ultimoQualsiasi = -1;
      numero.lastIndex = 0;
      while ((mm = numero.exec(unito)) !== null) {
        if (dentroBadge(mm.index)) continue;
        ultimoQualsiasi = mm.index;
        var testa = unito.slice(0, mm.index);
        var aperte = (testa.match(/\(/g) || []).length;
        var chiuse = (testa.match(/\)/g) || []).length;
        if (aperte <= chiuse) posValore = mm.index; // fuori dalle parentesi
      }
      if (posValore === -1) posValore = ultimoQualsiasi;
    }

    var trovati = [];

    for (var i = 0; i < nodi.length; i++) {
      var nodo = nodi[i];
      var testo = nodo.nodeValue;
      numero.lastIndex = 0;
      if (!numero.test(testo)) continue;
      numero.lastIndex = 0;

      var frammento = document.createDocumentFragment();
      var ultimo = 0;
      var m;

      while ((m = numero.exec(testo)) !== null) {
        var grezzo = m[0];
        var idx = m.index;
        var assoluto = inizi[i] + idx;
        var valore = parseFloat(grezzo.replace(/\./g, "").replace(",", "."));

        if (idx > ultimo) {
          frammento.appendChild(
            document.createTextNode(testo.slice(ultimo, idx)),
          );
        }

        if (!isFinite(valore) || valore <= 0) {
          frammento.appendChild(document.createTextNode(grezzo));
        } else {
          var decimali = m[2] ? m[2].length - 1 : 0;
          // Cifre intere presenti nella sorgente (senza i punti delle
          // migliaia): cosi' "08" -> 2, per rimettere lo zero iniziale.
          var cifreIntere = m[1].replace(/\./g, "").length;
          var span = document.createElement("span");
          span.className =
            vuoleValore && assoluto === posValore ? "num" : "num-anim";
          // Testo FINALE subito: il layout non deve dipendere da
          // se/quando partira' l'animazione.
          span.textContent = formattaNumero(valore, decimali, cifreIntere);
          frammento.appendChild(span);
          trovati.push({
            span: span,
            valore: valore,
            decimali: decimali,
            minInteri: cifreIntere,
          });
        }

        ultimo = idx + grezzo.length;
      }

      if (ultimo < testo.length) {
        frammento.appendChild(document.createTextNode(testo.slice(ultimo)));
      }

      nodo.parentNode.replaceChild(frammento, nodo);
    }

    return trovati;
  }

  // ------------------------------------------------------------
  // animaConteggio — passaggio puramente estetico: fa ripartire da
  // 0 gli span gia' costruiti (e gia' al valore finale) e li fa
  // risalire. Se qualcosa va storto o non viene mai chiamata, gli
  // span restano comunque al valore finale corretto.
  // ------------------------------------------------------------
  function animaConteggio(voci) {
    for (var j = 0; j < voci.length; j++) {
      var v = voci[j];
      v.span.textContent = formattaNumero(0, v.decimali, v.minInteri);
      conta(v.span, v.valore, v.decimali, v.minInteri);
    }
  }

  // Conta solo quando la card entra davvero nello schermo
  var osservatoreNumeri = null;
  var vociPerElemento = typeof WeakMap === "function" ? new WeakMap() : null;

  // .misuracolore sono le righe delle card; .anima-numero e' l'aggancio
  // per i numeri fuori da quelle righe. In piu' si animano anche i
  // numeri delle tabelle (celle td: storico mensile, mesi, totali...) e
  // i valori delle schede bici: cosi' "tutti i numeri, da ogni parte"
  // entrano contando. Le intestazioni (th) e le etichette restano ferme.
  // L'anno della bici (.bici-card__spec-value--anno) e la colonna
  // "Anno" della tabella mese per mese (td.td-anno, Statistiche
  // Totali) restano esclusi: sono un anno, non una quantita', e non
  // vanno scritti con il punto delle migliaia (es. 2020, mai 2.020).
  CA.preparaNumeri = function (radice) {
    var selettore =
      ".misuracolore:not([data-costruito])," +
      ".anima-numero:not([data-costruito])," +
      "td:not(.td-anno):not([data-costruito])," +
      ".bici-card__spec-value:not(.bici-card__spec-value--anno):not([data-costruito])";
    var elementi = (radice || document).querySelectorAll(selettore);
    if (!elementi.length) return;

    // Passaggio 1 — SEMPRE, subito: costruisce il markup finale.
    // Da qui in poi la card ha gia' il suo aspetto definitivo,
    // indipendentemente da scroll, IntersectionObserver o
    // preferenze di movimento.
    var daOsservare = [];
    elementi.forEach(function (el) {
      var voci = costruisciNumeri(el);
      if (!voci.length) return;
      if (vociPerElemento) vociPerElemento.set(el, voci);
      daOsservare.push(el);
    });

    // Passaggio 2 — SOLO estetico e SOLO se ammesso: fa risalire i
    // numeri da 0 quando la card entra nello schermo.
    if (motoRidotto || !vociPerElemento || !daOsservare.length) return;

    if (!("IntersectionObserver" in window)) return;

    if (!osservatoreNumeri) {
      osservatoreNumeri = new IntersectionObserver(
        function (voci) {
          voci.forEach(function (voce) {
            if (!voce.isIntersecting) return;
            var elencoNumeri = vociPerElemento.get(voce.target);
            if (elencoNumeri) animaConteggio(elencoNumeri);
            osservatoreNumeri.unobserve(voce.target);
          });
        },
        { threshold: 0.25 },
      );
    }

    daOsservare.forEach(function (el) {
      osservatoreNumeri.observe(el);
    });
  };
})(window.ContenutiAnimati);
