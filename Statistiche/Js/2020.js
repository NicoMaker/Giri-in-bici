let Maggio = 45, Giugno = 367, Luglio = 627, Agosto = 691, Settembre = 291 , Novembre = 192, Dicembre = 243;
let totale = Maggio + Giugno + Luglio + Agosto + Settembre + Novembre +Dicembre;

let avgmaggio = (Maggio / totale) * 100;
let avggiugno = (Giugno / totale) * 100;
let avgluglio = (Luglio / totale) * 100;
let avgagosto = (Agosto / totale) * 100;
let avgsettembre = (Settembre / totale) * 100;
let avgnovembre = (Novembre / totale) * 100;
let avgdicembre = (Dicembre / totale) * 100;

let corse = 32;

let avgtot = totale / corse;

let dati = {
    labels: ['Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre','Novembre', 'Dicembre'],
    datasets: [{
        label: 'km mensili 2020',
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 99, 132, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
        data: [Maggio,Giugno,Luglio,Agosto,Settembre,Novembre,Dicembre]
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

let stampan = ` <td> Novembre </td><td>${Novembre}</td><td>${avgnovembre} %</td>`;
document.getElementById("novembre").innerHTML = stampan;

let stampad = `<td> Dicembre </td> <td>${Dicembre}</td><td>${avgdicembre}%</td>`;
document.getElementById("dicembre").innerHTML = stampad;

let stampat = `<p>totale km ${totale} <img src="../Icone/traguardo.png"></p> <p>km medi percorsi ${avgtot}</p>`;
document.getElementById("totale").innerHTML = stampat;