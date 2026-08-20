// ============================================================
// vista-giri.js — Scheda "Giri" (i percorsi più lunghi) della
// pagina Classifica dei mesi.
//
// Dati letti direttamente da json/Estate/estate.json,
// json/Primavera/primavera.json e
// json/Autunno_Inverno/autunno-inverno.json (e dai rispettivi
// sottoperiodi), indipendenti dal resto della pagina.
//
// Dipendenze: JS/json.js, JS/utils.js, History/comune/config-mesi.js,
//             assets/tappe-piu-lunghe.js, assets/classifica-controlli.js
// Richiamato da Statistiche/History/classifica-mesi.js
// ============================================================

window.ClassificaMesi = window.ClassificaMesi || {};

(function (CM) {
  "use strict";

  CM.avviaVistaGiri = async function () {
    const CC = window.ClassificaControlli;

    const controlliGiri = CC.crea(document.getElementById("controlli-giri"), {
      onCambia: () => aggiornaVistaTappe(),
    });

    let aggiornaVistaTappe = () => {};

    if (!window.TappePiuLunghe) return;

    try {
      const configStagioni = [
        "json/Estate/estate.json",
        "json/Primavera/primavera.json",
        "json/Autunno_Inverno/autunno-inverno.json",
      ];
      const configuazioni = await Promise.all(
        configStagioni.map((url) => fetchJSON(url)),
      );

      function annoReale(etichettaPeriodo, meseNum) {
        const intervallo = etichettaPeriodo.match(/^(\d{4})-(\d{4})$/);
        if (!intervallo) return parseInt(etichettaPeriodo, 10);
        return meseNum >= 10
          ? parseInt(intervallo[1], 10)
          : parseInt(intervallo[2], 10);
      }

      const tutteLeTappe = [];
      for (const config of configuazioni) {
        const periodi = Object.entries(config.subPeriods || {});
        const datiPeriodi = await Promise.all(
          periodi.map(([, file]) => fetchJSON(file)),
        );
        periodi.forEach(([etichettaPeriodo], indice) => {
          const uscite = datiPeriodi[indice] || [];
          uscite.forEach((r) => {
            const info = TappePiuLunghe.analizzaLuogo(r.place);
            const [giornoTesto, meseTesto] = (r.date || "").split(" ");
            const giorno = parseInt(giornoTesto, 10) || 0;
            const meseNum = ConfigMesi.ordine[meseTesto] || 0;
            const anno = annoReale(etichettaPeriodo, meseNum) || 0;
            tutteLeTappe.push({
              nome: info.nome,
              nomeTesto: info.nomeTesto,
              href: info.href,
              linkMultipli: info.linkMultipli,
              stagione: config.season,
              periodo: etichettaPeriodo,
              etichetta: `${r.date} · ${config.season} ${etichettaPeriodo}`,
              distance: r.distance,
              dataOrdine: anno * 10000 + meseNum * 100 + giorno,
            });
          });
        });
      }

      const selettoreStagioneEl = document.getElementById(
        "tappe-filtro-stagione",
      );
      const selettoreAnnoEl = document.getElementById("tappe-filtro-anno");

      const stagioniUniche = [...new Set(tutteLeTappe.map((t) => t.stagione))];
      stagioniUniche.forEach((s) => {
        const opzione = document.createElement("option");
        opzione.value = s;
        opzione.textContent = s;
        selettoreStagioneEl.appendChild(opzione);
      });

      function popolaAnni(stagioneFiltro) {
        if (!stagioneFiltro) {
          selettoreAnnoEl.innerHTML = '<option value="">Tutti</option>';
          selettoreAnnoEl.value = "";
          selettoreAnnoEl.disabled = true;
          return;
        }
        selettoreAnnoEl.disabled = false;
        const disponibili = tutteLeTappe.filter(
          (t) => t.stagione === stagioneFiltro,
        );
        const anniDisponibili = [
          ...new Set(disponibili.map((t) => t.periodo)),
        ].sort((a, b) => b.localeCompare(a));
        const sceltaAttuale = selettoreAnnoEl.value;
        selettoreAnnoEl.innerHTML = '<option value="">Tutti</option>';
        anniDisponibili.forEach((a) => {
          const opzione = document.createElement("option");
          opzione.value = a;
          opzione.textContent = a;
          selettoreAnnoEl.appendChild(opzione);
        });
        selettoreAnnoEl.value = anniDisponibili.includes(sceltaAttuale)
          ? sceltaAttuale
          : "";
      }

      aggiornaVistaTappe = function () {
        const stagioneScelta = selettoreStagioneEl.value;
        const annoScelto = selettoreAnnoEl.value;
        const perFiltriEsistenti = tutteLeTappe.filter(
          (t) =>
            (!stagioneScelta || t.stagione === stagioneScelta) &&
            (!annoScelto || t.periodo === annoScelto),
        );
        controlliGiri.aggiornaLimiti(perFiltriEsistenti.map((t) => t.distance));
        const stato = controlliGiri.stato();
        const cercate = CC.cerca(
          perFiltriEsistenti,
          stato.testo,
          (t) => `${t.nomeTesto || t.nome} ${t.stagione} ${t.periodo}`,
        );
        const filtrate = CC.filtra(cercate, stato, (t) => t.distance);

        TappePiuLunghe.mostra(
          "podio-tappe",
          "classifica-tappe",
          filtrate,
          undefined,
          stato.ordine,
        );

        const listaGiriEl = document.getElementById("classifica-tappe");
        if (listaGiriEl) {
          const totaleKmGiri = filtrate.reduce((tot, t) => tot + t.distance, 0);
          listaGiriEl.insertAdjacentHTML(
            "beforeend",
            CM.creaRigaTotale(
              totaleKmGiri,
              `${filtrate.length} ${pluralizza(filtrate.length, "giro", "giri")}`,
            ),
          );
        }
      };

      const parametriUrl = new URLSearchParams(window.location.search);
      const stagioneDaUrl = parametriUrl.get("stagione");
      if (stagioneDaUrl && stagioniUniche.includes(stagioneDaUrl)) {
        selettoreStagioneEl.value = stagioneDaUrl;
      }
      popolaAnni(selettoreStagioneEl.value);
      const annoDaUrl = parametriUrl.get("anno");
      if (
        annoDaUrl &&
        Array.prototype.some.call(
          selettoreAnnoEl.options,
          (o) => o.value === annoDaUrl,
        )
      ) {
        selettoreAnnoEl.value = annoDaUrl;
      }

      selettoreStagioneEl.addEventListener("change", () => {
        popolaAnni(selettoreStagioneEl.value);
        aggiornaVistaTappe();
      });
      selettoreAnnoEl.addEventListener("change", aggiornaVistaTappe);

      aggiornaVistaTappe();
    } catch (error) {
      console.error(`Errore nel caricamento dei giri: ${error}`);
      const listaTappeEl = document.getElementById("classifica-tappe");
      if (listaTappeEl)
        listaTappeEl.innerHTML =
          '<li class="errore-grafico">Non è stato possibile caricare i giri.</li>';
    }
  };
})(window.ClassificaMesi);
