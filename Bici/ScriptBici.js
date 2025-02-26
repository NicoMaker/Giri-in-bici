document.addEventListener("DOMContentLoaded", function () {
  fetch("bici.json")
    .then((response) => response.json())
    .then((data) => {
      const bici = document.getElementById("StampaBici");

      // Funzione per mostrare solo l'intestazione Home
      const Home = () =>
        (bici.innerHTML = `<img class="immagini_stagione" src="${data.intestazioni.home}" /><br />`);

      // Funzione generica per mostrare le bici filtrate
      function mostraBiciFiltrate(tipo) {
        let html = `<div class="container_stagione">`;

        // Mostra intestazioni per la categoria selezionata con layout a 3 per riga
        if (data.intestazioni[tipo]) {
          html += `<div class="container_stagione">`;
          data.intestazioni[tipo].forEach((img, index) => {
            if (index % 3 === 0) html += `<div class="row">`; // Inizio riga ogni 3 immagini
            html += `<img class="immagini_stagione2" src="${img}" />`;
            if (index % 3 === 2 || index === data.intestazioni[tipo].length - 1)
              html += `</div>`; // Chiudi riga ogni 3 immagini o alla fine
          });
          html += `</div><br />`;
        }

        // Filtra e mostra solo le bici del tipo selezionato
        const biciFiltrate = data.bici.filter((bici) => bici.tipo === tipo);

        biciFiltrate.forEach((bici, index) => {
          const classeImmagine =
            index % 2 === 0 ? "immagine_bicisx" : "immagine_bicidx";
          html += `
            <div class="contorno">
                <img class="${classeImmagine}" src="${bici.immagine}">
                <h1 class="Titolo2">${bici.nome}</h1>
                <p><strong>Tipo Freni:</strong> ${bici.tipo_freni}</p>
                <p><strong>Materiale:</strong> ${bici.materiale}</p>
                <p><strong>Misura Ruote:</strong> ${bici.misura_ruote}</p>
                <p><strong>Cambi:</strong> ${bici.cambi} <br>Totale ${bici.totale_cambi}</p>
                <p><strong>Anno di Produzione:</strong> ${bici.anno}</p>
            </div>`;
        });

        bici.innerHTML = html;
      }

      // Funzioni per mostrare MTB e Corsa
      window.CalcolaMTB = () => mostraBiciFiltrate("mtb");
      window.CalcolaCorsa = () => mostraBiciFiltrate("corsa");
      window.Home = Home;

      // Carica la home all'avvio
      Home();
    })
    .catch((error) => console.error("Errore nel caricamento del JSON:", error));
});
