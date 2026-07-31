// calcolo_km_media_periodi.js
// Dipendenze: JS/utils.js (caricato prima in HTML)

document.addEventListener("DOMContentLoaded", function () {
  function createTableRow(row, index) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${row.date}</td>
      <td>${formatItalianNumber(index + 1)}</td>
      <td>${row.place}</td>
      <td>${formatItalianNumber(row.distance)}</td>
      <td>km</td>
    `;
    return newRow;
  }

  function calculateAndDisplayStats(data) {
    const totalkm = data.reduce((total, row) => total + row.distance, 0);
    const totalRaces = data.length;
    const mediaValue = formatNumber(totalkm / totalRaces);
    const formattedTotalKm = formatItalianNumber(totalkm);

    document.getElementById("km").innerHTML = `
      <div class="colore">
        <p class="misuracolore">Totale km percorsi ${formattedTotalKm}
          <img src="/img/Icons/traguardo.png" alt="Icona traguardo">
        </p>
        <p class="misuracolore">Media km percorsi ${mediaValue}</p>
      </div>
    `;
  }

  // ---------------------------------------------------------
  // "Tappe più lunghe": le stesse uscite della tabella qui sopra,
  // ma ordinate per distanza invece che per data. Qui basta
  // preparare le righe (etichetta = solo la data, siamo dentro un
  // singolo anno) e passarle alla logica condivisa in
  // assets/js/tappe-piu-lunghe.js (usata anche dalla pagina
  // generale della stagione, che le combina di tutti gli anni).
  function mostraTappePiuLunghe(data) {
    if (!window.TappePiuLunghe) return;
    const righe = data.map(function (r) {
      const info = TappePiuLunghe.analizzaLuogo(r.place);
      return {
        nome: info.nome,
        nomeTesto: info.nomeTesto,
        href: info.href,
        linkMultipli: info.linkMultipli,
        etichetta: r.date,
        distance: r.distance,
      };
    });
    TappePiuLunghe.mostra("tappe-podio", "tappe-lista", righe);
  }

  function updateTableAndStats(data) {
    const tableBody = document.querySelector("table tbody");
    data.forEach((row, index) => {
      tableBody.appendChild(createTableRow(row, index));
    });
    calculateAndDisplayStats(data);
    mostraTappePiuLunghe(data);
  }

  const jsonUrl = document.getElementById("json").getAttribute("link");
  fetchJSON(jsonUrl)
    .then((data) => {
      if (data && Array.isArray(data)) updateTableAndStats(data);
    })
    .catch((error) => console.error(`Error loading data: ${error}`));
});
