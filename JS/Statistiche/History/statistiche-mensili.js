// ============================================================
// statistiche-mensili.js — Avvio della pagina Statistiche Mensili
//
// Solo l'avvio. I pezzi stanno in History/statistiche-mensili/:
//   calcoli.js    totali, percentuali e medie
//   tabella.js    tabella dei dodici mesi
//   riepilogo.js  riquadro dei totali
//   canvas.js     crea i riquadri dei grafici se mancano
//   podio.js      podio e classifica interattivi, in cima alla pagina
// L'ordine dei mesi arriva da History/comune/config-mesi.js
//
// Dati letti da json/Statistiche/History/Storico.json: gli anni
// vengono da "anni", la tavolozza dei 12+ colori per i mesi da
// "coloriMesi" (prima erano "statistics" e "colors" dentro il
// vecchio GraficoTotale.json).
//
// Dipendenze: JS/utils.js, JS/chart/chart-configs.js,
//             JS/chart/chart-renderer.js
// ============================================================

const GTM = window.GraficoTotaleMensile;

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.chartRenderer || !window.ChartConfigs) {
    console.error(
      "Chart system non inizializzato. Includere chart-configs.js e chart-renderer.js",
    );
    return;
  }

  try {
    // Carica la configurazione dei mesi prima di tutto
    await ConfigMesi.carica();

    const storico = await fetchJSON("json/Statistiche/History/Storico.json");
    const allData = await Json.leggiTutti(Object.values(storico.anni));

    let chilometriTotali = new Array(12).fill(0);
    let mesiPercorsi = new Array(12).fill(0);
    const coloriGlobali = storico.coloriMesi;

    allData.forEach((json) => {
      ConfigMesi.elenco.forEach((mese, index) => {
        if (json.data[mese]) {
          chilometriTotali[index] += json.data[mese];
          mesiPercorsi[index] += 1;
        }
      });
    });

    const totaleChilometri = GTM.getTotale(chilometriTotali);
    const percentuali = GTM.getPercentuali(chilometriTotali, totaleChilometri);
    const kmPerMese = GTM.getkmPerMese(
      ConfigMesi.elenco,
      chilometriTotali,
      mesiPercorsi,
    );
    const mediaComplessiva = GTM.getMediaPer12(totaleChilometri);
    const totaleCorse = GTM.getTotaleCorse(allData);
    const mediacorse = GTM.getMediaPer12(totaleCorse);

    // ---------- Podio e classifica interattivi, in cima alla pagina ----------
    // Una riga per mese con tutti i numeri che servono: il selettore
    // decide solo con quale di questi si ordina e si evidenzia il podio.
    const righeClassifica = ConfigMesi.elenco.map((mese, index) => ({
      mese,
      km: chilometriTotali[index],
      percentuale:
        totaleChilometri > 0
          ? (chilometriTotali[index] / totaleChilometri) * 100
          : 0,
      mesiPercorsi: mesiPercorsi[index],
      kmMedio:
        mesiPercorsi[index] > 0
          ? chilometriTotali[index] / mesiPercorsi[index]
          : 0,
    }));

    let metricaAttiva = "km";
    const titoloPodioEl = document.getElementById("podio-mensili-titolo");
    const podioEl = document.getElementById("podio-mensili");
    const listaEl = document.getElementById("classifica-mensili");

    function disegnaClassificaMensile() {
      const ordinate = GTM.ordinaPer(righeClassifica, metricaAttiva);
      if (titoloPodioEl)
        titoloPodioEl.innerHTML = GTM.creaTitoloPodio(ordinate, metricaAttiva);
      if (podioEl) podioEl.innerHTML = GTM.creaPodio(ordinate, metricaAttiva);
      if (listaEl)
        listaEl.innerHTML = GTM.creaClassifica(ordinate, metricaAttiva);
    }

    disegnaClassificaMensile();

    document
      .querySelectorAll("#selettore-metrica .selettore-metrica__pulsante")
      .forEach((pulsante) => {
        pulsante.addEventListener("click", () => {
          if (pulsante.dataset.metrica === metricaAttiva) return;
          metricaAttiva = pulsante.dataset.metrica;
          document
            .querySelectorAll("#selettore-metrica .selettore-metrica__pulsante")
            .forEach((p) => p.classList.toggle("attivo", p === pulsante));
          disegnaClassificaMensile();
        });
      });

    const chartData = {
      labels: ConfigMesi.elenco,
      values: chilometriTotali,
      colors: coloriGlobali,
      percentuali,
    };

    await window.chartRenderer.createChart("graficoTotaleMensile", chartData);
    await window.chartRenderer.createChart(
      "graficoTotaleMensileLine",
      chartData,
    );

    document.getElementById("mesi").innerHTML = GTM.createTableHTML(
      kmPerMese,
      chilometriTotali,
      percentuali,
      mesiPercorsi,
    );
    document.getElementById("totale").innerHTML = GTM.createSummaryHTML(
      totaleChilometri,
      mediaComplessiva,
      totaleCorse,
      mediacorse,
    );
  } catch (error) {
    console.error(`Errore nel caricamento: ${error}`);
    const box = document.getElementById("grafici");
    if (box)
      box.innerHTML =
        '<p class="errore-grafico">Non è stato possibile caricare i dati dei grafici: ' +
        error.message +
        "</p>";
  }
});
