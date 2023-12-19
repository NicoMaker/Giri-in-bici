let Gennaio = 152, Febbraio = 315, Marzo = 302, Aprile = 323, Maggio = 180, Giugno = 270, Luglio = 401, Agosto = 174, Settembre = 75, Ottobre = 216, Novembre = 66, Dicembre = 140;
let totale = Gennaio + Febbraio + Marzo + Aprile + Maggio + Giugno + Luglio + Agosto + Settembre + Ottobre + Novembre + Dicembre;

let avggennaio = (Gennaio / totale) * 100;
avggennaio = avggennaio.toFixed(2);

let avgfebbraio = (Febbraio / totale) * 100;
avgfebbraio = avgfebbraio.toFixed(2);

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

let corse = 40;

let avgtot = totale / corse;
avgtot = avgtot.toFixed(2);

let dati = {
    labels: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
    datasets: [{
        label: 'km mensili 2024',
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
        data: [Gennaio,Febbraio,Marzo,Aprile,Maggio,Giugno,Luglio,Agosto,Settembre,Ottobre,Novembre,Dicembre]
    }]
};

// Configurazione del grafico
let config = {
    type: 'bar',
    data: dati,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
};

// Ottenere il contesto del canvas e creare il grafico
let ctx = document.getElementById('bar-chart').getContext('2d');
new Chart(ctx, config);

let stampag = `<td> Gennaio </td><td>${Gennaio}</td><td>${avggennaio} %</td>`;
document.getElementById("gennaio").innerHTML = stampag;

let stampaf = ` <td> Febbraio </td><td>${Febbraio}</td><td>${avgfebbraio} %</td>`;
document.getElementById("febbraio").innerHTML = stampaf;

let stampam = `<td> Marzo </td> <td>${Marzo}</td><td>${avgmarzo} %</td>`;
document.getElementById("marzo").innerHTML = stampam;

let stampaa = `<td> Aprile </td><td>${Aprile}</td><td>${avgaprile} %</td>`;
document.getElementById("aprile").innerHTML = stampaa;

let stampama = `<td> Maggio </td><td>${Maggio}</td><td>${avgmaggio} %</td>`;
document.getElementById("maggio").innerHTML = stampama;

let stampagi = `<td> Giugno </td><td>${Giugno}</td><td>${avggiugno} %</td>`;
document.getElementById("giugno").innerHTML = stampagi;

let stampal = ` <td> Luglio </td><td>${Luglio}</td><td>${avgluglio} %</td>`;
document.getElementById("luglio").innerHTML = stampal;

let stampaag = `<td>Agosto </td><td>${Agosto}</td><td>${avgagosto} %</td>`;
document.getElementById("agosto").innerHTML = stampaag;

let stampas = `<td> Settembre </td> <td>${Settembre}</td><td>${avgsettembre} %</td>`;
document.getElementById("settembre").innerHTML = stampas;

let stampao = `<td> Ottobre </td> <td>${Ottobre}</td><td>${avgottobre} %</td>`;
document.getElementById("ottobre").innerHTML = stampao;

let stampan = ` <td> Novembre </td><td>${Novembre}</td><td>${avgnovembre} %</td>`;
document.getElementById("novembre").innerHTML = stampan;

let stampad = `<td> Dicembre </td> <td>${Dicembre}</td><td>${avgdicembre}%</td>`;
document.getElementById("dicembre").innerHTML = stampad;

let stampat = `<p>totale km ${totale} <img src="../Icone/traguardo.png"></p> <p>km medi percorsi ${avgtot}</p>`;
document.getElementById("totale").innerHTML = stampat;