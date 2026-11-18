// calcolo_km_media_periodi.js
// Dipendenze: JS/utils.js (caricato prima in HTML)

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

  const createTableRow = (row, index, totalkm) => {
    const newRow = document.createElement("tr");
    const percentuale =
      totalkm > 0 ? formatPercentage((row.distance / totalkm) * 100) : "0";
    newRow.innerHTML = `
      <td>${row.date}</td>
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

  const updateTableAndStats = (data) => {
    const tableBody = document.querySelector("table tbody");
    const totalkm = data.reduce((total, row) => total + row.distance, 0);
    data.forEach((row, index) => {
      tableBody.appendChild(createTableRow(row, index, totalkm));
    });
    calculateAndDisplayStats(data, totalkm);
  };

  const jsonUrl = document.getElementById("json").getAttribute("link");
  fetchJSON(jsonUrl)
    .then((data) => {
      if (data && Array.isArray(data)) updateTableAndStats(data);
    })
    .catch((error) => console.error(`Error loading data: ${error}`));
});
