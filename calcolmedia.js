let kmElement = document.getElementById("km");
if (!kmElement) {
  console.error("Elemento non trovato.");
} else {
  let km = parseFloat(kmElement.getAttribute("data-km"));
  let corse = parseFloat(kmElement.getAttribute("data-corse"));

  if (!isNaN(km) && !isNaN(corse)) {
    let mediaValue = (km / corse).toFixed(2);
    let imgSrc = kmElement.hasAttribute("principale")
      ? "Icone/traguardo.png"
      : "../Icone/traguardo.png";

    let stampa = `
            <div class="colore">
                <p> totale km ${km} <img src="${imgSrc}"> </p>
                <p> km medi ${
                  kmElement.hasAttribute("principale") ? "per giro" : ""
                } percorsi ${mediaValue} </p>
            </div>
        `;

    kmElement.innerHTML = stampa;
  } else {
    console.error("Dati non validi.");
  }
}
