let Maggio = 45,
  Giugno = 367,
  Luglio = 627,
  Agosto = 691,
  Settembre = 291,
  Novembre = 192,
  Dicembre = 243;
let totale =
  Maggio + Giugno + Luglio + Agosto + Settembre + Novembre + Dicembre;

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

let avgnovembre = (Novembre / totale) * 100;
avgnovembre = avgnovembre.toFixed(2);

let avgdicembre = (Dicembre / totale) * 100;
avgdicembre = avgdicembre.toFixed(2);

let corse = 32;

let avgtot = totale / corse;
avgtot = avgtot.toFixed(2);

let avgmese = totale / 7;
avgmese = avgmese.toFixed(2);

let dati = {
  labels: [
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Novembre",
    "Dicembre",
  ],
  datasets: [
    {
      label: "km mensili 2020",
      backgroundColor: [
        "pink",
        "yellow",
        "orange",
        "red",
        "darkgreen",
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
      ],
      borderWidth: 1,
      data: [Maggio, Giugno, Luglio, Agosto, Settembre, Novembre, Dicembre],
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
