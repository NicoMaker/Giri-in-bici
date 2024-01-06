function media(){
    let km = parseFloat(document.getElementById("km").getAttribute("data-km"));
    let corse = parseFloat(document.getElementById("km").getAttribute("data-corse"));

    let mediaValue = km / corse;
    mediaValue = parseFloat(mediaValue.toFixed(2));

    let stampa = `
    <div class="colore">
        <p> totale km ${km}
            <img src="../Icone/traguardo.png">
        </p>
        <p>km medi percorsi ${mediaValue} </p>
    </div>
    `;

    document.getElementById("km").innerHTML = stampa;
}

media();