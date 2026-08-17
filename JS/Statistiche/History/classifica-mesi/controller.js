// ============================================================
// classifica-mesi.js — Avvio della pagina Classifica dei mesi
//
// Solo l'avvio: richiama in ordine i moduli delle singole schede,
// ognuno nel proprio file dentro History/classifica-mesi/:
//   selettore-vista.js  il selettore in cima (mostra/nasconde le schede)
//   vista-mesi.js        schede "Mesi", "Record" e "Anni" (stesso fetch)
//   vista-stagioni.js    scheda "Stagioni"
//   vista-periodi.js     scheda "Periodi"
//   vista-giri.js        scheda "Giri" (percorsi più lunghi)
//
// Il markup di ogni scheda arriva da History/classifica-mesi/podio/*.js,
// i calcoli da History/classifica-mesi/calcoli.js e stagioni.js.
// L'ordine dei mesi arriva da History/comune/config-mesi.js.
//
// Ogni scheda ha anche i controlli di assets/classifica-controlli.js:
// un pulsante "Ordine" (dal più al meno pedalato o inverso) e un
// filtro "da...a" in chilometri con le scorciatoie "Min"/"Max".
//
// Dipendenze: JS/json.js, JS/utils.js, History/comune/config-mesi.js,
//             History/classifica-mesi/calcoli.js,
//             History/classifica-mesi/stagioni.js,
//             History/classifica-mesi/podio/*.js,
//             History/classifica-mesi/selettore-vista.js,
//             History/classifica-mesi/vista-mesi.js,
//             History/classifica-mesi/vista-stagioni.js,
//             History/classifica-mesi/vista-periodi.js,
//             History/classifica-mesi/vista-giri.js,
//             assets/tappe-piu-lunghe.js, assets/classifica-controlli.js
// ============================================================

const CM = window.ClassificaMesi;

document.addEventListener("DOMContentLoaded", async () => {
  CM.avviaSelettoreVista();
  await CM.avviaVistaMesi();
  await CM.avviaVistaStagioni();
  await CM.avviaVistaPeriodi();
  await CM.avviaVistaGiri();
});
