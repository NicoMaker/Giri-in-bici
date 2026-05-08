// File di configurazione centralizzato per tutti i grafici
// Questo file contiene tutte le configurazioni dei grafici utilizzati nel progetto

const ChartConfigs = {
    // Formattazione numeri condivisa
    formatNumber: (value) => {
        if (Number.isInteger(value)) {
            return value.toString();
        }
        return value.toFixed(2);
    },

    // Configurazione per grafico doughnut (usato per stagioni e statistiche generali)
    doughnut: {
        type: "doughnut",
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${ChartConfigs.formatNumber(value)} km (${percentage}%)`;
                        }
                    }
                }
            }
        }
    },

    // Configurazione per grafico a barre (usato per statistiche mensili/annuali)
    bar: {
        type: "bar",
        options: {
            scales: {
                y: { 
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Chilometri"
                    }
                },
                x: {
                    title: {
                        display: true
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const km = ChartConfigs.formatNumber(context.raw);
                            return `${context.dataset.label}: ${km} km`;
                        }
                    }
                }
            }
        }
    },

    // Configurazione per grafico a linea (usato per andamenti storici)
    line: {
        type: "line",
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { 
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Chilometri"
                    }
                },
                x: {
                    title: {
                        display: true
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const km = ChartConfigs.formatNumber(context.raw);
                            const percentage = context.dataset.percentuali ? 
                                `(${context.dataset.percentuali[context.dataIndex]}%)` : '';
                            return [
                                `${context.dataset.label}: ${km} km`,
                                percentage
                            ].filter(Boolean);
                        }
                    }
                }
            }
        }
    },

    // Configurazioni specifiche per pagina
    pages: {
        stagioni: {
            chartType: 'doughnut',
            containerId: 'doughnut-chart',
            dataProcessor: 'processSeasonData'
        },
        generaleStatistiche: {
            chartType: 'doughnut',
            containerId: 'doughnut-chart',
            dataProcessor: 'processGeneralStatsData'
        },
        anni: {
            chartType: 'bar',
            containerId: 'bar-chart',
            dataProcessor: 'processYearData'
        },
        graficoTotale: {
            chartType: 'line',
            containerId: 'line-chart',
            dataProcessor: 'processTotalHistoryData'
        },
        graficoTotaleMensile: {
            chartType: 'bar',
            containerId: 'bar-chart',
            dataProcessor: 'processMonthlyHistoryData'
        },
        graficoTotaleMensileLine: {
            chartType: 'line',
            containerId: 'line-chart',
            dataProcessor: 'processMonthlyHistoryData'
        }
    }
};

// Esporta le configurazioni per uso globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartConfigs;
} else {
    window.ChartConfigs = ChartConfigs;
}
