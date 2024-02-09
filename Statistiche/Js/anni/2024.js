let Gennaio = 486,
  Marzo = 0,
  Aprile = 0,
  Maggio = 0,
  Giugno = 0,
  Luglio = 0,
  Agosto = 0,
  Settembre = 0,
  Ottobre = 0,
  Novembre = 0,
  Dicembre = 0;
let totale =
  Gennaio +
  Marzo +
  Aprile +
  Maggio +
  Giugno +
  Luglio +
  Agosto +
  Settembre +
  Ottobre +
  Novembre +
  Dicembre;

let avggennaio = (Gennaio / totale) * 100;
avggennaio = avggennaio.toFixed(2);

let avgmarzo = (Marzo / totale) * 100;
avgmarzo = avgmarzo.toFixed(2);

let avgaprile = (Aprile / totale) * 100;
avgaprile = avgaprile.toFixed(2);

let avgmaggio = (Maggio / totale) * 100;
avgmaggio = avgmaggio.toFixed(2);

let avggiugno = (Giugno / totale) * 100;
avggiugno = avggiugno.toFixed(2);

let avgluglio = (Luglio / totale) * 100;
avgluglio = avgluglio.toFixed(2);

let avgagosto = (Agosto / totale) * 100;
avgagosto = avgagosto.toFixed(2);

let avgsettembre = (Settembre / totale) * 100;
avgsettembre = avgsettembre.toFixed(2);

let avgottobre = (Ottobre / totale) * 100;
avgottobre = avgottobre.toFixed(2);

let avgnovembre = (Novembre / totale) * 100;
avgnovembre = avgnovembre.toFixed(2);

let avgdicembre = (Dicembre / totale) * 100;
avgdicembre = avgdicembre.toFixed(2);

let corse = 6;

let avgtot = totale / corse;
avgtot = avgtot.toFixed(2);

let avgmese = totale / 1;
avgmese = avgmese.toFixed(2);

let dati = {
  labels: [
    "Gennaio",
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
  ],
  datasets: [
    {
      label: "km mensili 2024",
      backgroundColor: [
        "darkblue",
        "lightgreen",
        "green",
        "pink",
        "yellow",
        "orange",
        "red",
        "darkgreen",
        "brown",
        "cyan",
        "blue",
      ],
      borderColor: [
        "black",
        "black",
        "black",
        "black",
        "black",
        "black",
        "black",
        "black",
        "black",
        "black",
        "black",
      ],
      borderWidth: 1,
      data: [
        Gennaio,
        Marzo,
        Aprile,
        Maggio,
        Giugno,
        Luglio,
        Agosto,
        Settembre,
        Ottobre,
        Novembre,
        Dicembre,
      ],
    },
  ],
};

// Configurazione del grafico
let config = {
  type: "bar",
  data: dati,
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
};

// Ottenere il contesto del canvas e creare il grafico
let ctx = document.getElementById("bar-chart").getContext("2d");
new Chart(ctx, config);

let stampatabella = `

    <tr class="grasetto">
        <th>Mese</th>
        <th>km <img src="../Icone/traguardo.png">
        </th>
        <th>Percentuale su anno</th>
    </tr>

    <tr>
        <td> Gennaio </td>
        <td>${Gennaio}</td>
        <td>${avggennaio} %</td>
    </tr>

    <tr>
        <td> Marzo </td>
        <td>${Marzo}</td>
        <td>${avgmarzo} %</td>
    </tr>

    <tr>
        <td> Aprile </td>
        <td>${Aprile}</td>
        <td>${avgaprile} %</td>
    </tr>

    <tr>
        <td> Maggio </td>
        <td>${Maggio}</td>
        <td>${avgmaggio} %</td>
    </tr>

    <tr>
        <td> Giugno </td>
        <td>${Giugno}</td>
        <td>${avggiugno} %</td>
    </tr>

    <tr>
        <td> Luglio </td>
        <td>${Luglio}</td>
        <td>${avgluglio} %</td>
    </tr>

    <tr>
        <td> Agossto </td>
        <td>${Agosto}</td>
        <td>${avgagosto} %</td>
    </tr>

    <tr>
        <td> Settembre </td>
        <td>${Settembre}</td>
        <td>${avgsettembre} %</td>
    </tr>

    <tr>
        <td> Ottobre </td>
        <td>${Ottobre}</td>
        <td>${avgottobre} %</td>
    </tr>

    <tr>
        <td> Novembre </td>
        <td>${Novembre}</td>
        <td>${avgnovembre} %</td>
    </tr>

    <tr>
        <td> Dicembre </td>
        <td>${Dicembre}</td>
        <td>${avgdicembre} %</td>
    </tr>
`;
document.getElementById("mesi").innerHTML = stampatabella;

let stampat = `
<div class="colore">
    <p>totale km ${totale} <img src="../Icone/traguardo.png"></p> <p>km medi percorsi ${avgtot}</p>
    <p>km medi per mese ${avgmese}</p>
</div>`;
document.getElementById("totale").innerHTML = stampat;
