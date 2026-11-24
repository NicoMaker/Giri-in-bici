// calcolo_km_media_periodi.js
// Dipendenze: JS/utils.js (caricato prima in HTML)

const MESI_ITALIANI = [
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

// Il JSON scrive la data senza anno ("06 Marzo"): l'anno sta nel nome del
// file ("2025.json", o "2024-2025.json" per Autunno-Inverno, dove
// Ottobre-Dicembre sono del primo anno e Gennaio-Aprile del secondo).
const dataConAnno = (dataTesto, urlJson) => {
  const [giorno, mese] = String(dataTesto).split(" ");
  const meseNumero = MESI_ITALIANI.indexOf(mese) + 1;
  const anni = String(urlJson).match(/(\d{4})(?:-(\d{4}))?\.json$/);
  if (!anni || meseNumero === 0) return dataTesto;
  const [, primoAnno, secondoAnno] = anni;
  const anno = secondoAnno && meseNumero < 10 ? secondoAnno : primoAnno;
  return `${giorno.padStart(2, "0")}/${String(meseNumero).padStart(2, "0")}/${anno}`;
};

document.addEventListener("DOMContentLoaded", () => {
  // Quando un'uscita ha piu' percorsi separati (tipicamente "andata" e
  // "ritorno" tracciati come due tour diversi su Komoot), il JSON li
  // scrive come "Nome <br><a>andata</a><br><a>ritorno</a>": senza
  // questa funzione finiscono nella cella cosi' come sono, due link di
  // testo semplice uno sotto l'altro. Qui si riusa la stessa analisi e
  // lo stesso markup a pillola gia' usati per il podio "Tappe più
  // lunghe" (JS/assets/tappe-piu-lunghe.js), cosi' la stessa uscita ha
  // lo stesso aspetto sia nel podio che nella tabella cronologica, in
  // ogni stagione. Se quello script non e' caricato in pagina, o il
  // luogo ha zero/un solo link, la cella resta come prima.
  const formattaLuogo = (luogoHtml) => {
    if (!window.TappePiuLunghe) return luogoHtml;
    const info = window.TappePiuLunghe.analizzaLuogo(luogoHtml);
    if (!info.linkMultipli) return luogoHtml;
    return (
      info.nome +
      "<br>" +
      window.TappePiuLunghe.creaLinkMultipli(info.linkMultipli)
    );
  };

  const createTableRow = (row, index, totalkm, urlJson) => {
    const newRow = document.createElement("tr");
    const percentuale =
      totalkm > 0 ? formatPercentage((row.distance / totalkm) * 100) : "0";
    newRow.innerHTML = `
      <td>${dataConAnno(row.date, urlJson)}</td>
      <td>${formatItalianNumber(index + 1)}</td>
      <td>${formattaLuogo(row.place)}</td>
      <td>${formatItalianNumber(row.distance)}</td>
      <td>${percentuale} %</td>
    `;
    return newRow;
  };

  const calculateAndDisplayStats = (data, totalkm) => {
    const totalRaces = data.length;
    const mediaValue = formatNumber(totalkm / totalRaces);
    const formattedTotalKm = formatItalianNumber(totalkm);

    document.getElementById("km").innerHTML = `
      <div class="colore">
        <p class="misuracolore">Totale km percorsi ${formattedTotalKm}
          <img src="/img/Icons/traguardo.png" alt="Icona traguardo">
        </p>
        <p class="misuracolore">Totale corse ${formatItalianNumber(totalRaces)}</p> 
        <p class="misuracolore">Media km percorsi ${mediaValue}</p>
      </div>
    `;
  };

  const updateTableAndStats = (data, urlJson) => {
    const tableBody = document.querySelector("table tbody");
    const totalkm = data.reduce((total, row) => total + row.distance, 0);
    data.forEach((row, index) => {
      tableBody.appendChild(createTableRow(row, index, totalkm, urlJson));
    });
    calculateAndDisplayStats(data, totalkm);
  };

  const jsonUrl = document.getElementById("json").getAttribute("link");
  fetchJSON(jsonUrl)
    .then((data) => {
      if (data && Array.isArray(data)) updateTableAndStats(data, jsonUrl);
    })
    .catch((error) => console.error(`Error loading data: ${error}`));
});
