let dati = {
    labels: ['Statistiche 2020', 'Statistiche 2021', 'Statistiche 2022', 'Statistiche 2023', 'Statistiche 2024'],
    datasets: [{
        label: 'km totali',
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
        data: [2456, 2614, 3808, 3438, 0]  // Aggiunto un valore per il 2024, correggi se necessario
    }]
};

// Configurazione del grafico
let config = {
    type: 'pie',
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
let ctx = document.getElementById('pie-chart').getContext('2d');
new Chart(ctx, config);