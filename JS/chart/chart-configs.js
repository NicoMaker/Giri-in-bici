// File di configurazione centralizzato per tutti i grafici
// Questo file contiene tutte le configurazioni dei grafici utilizzati nel progetto

const ChartConfigs = {
    // Formattazione numeri condivisa
    formatNumber: (value) => {
        // For charts: show decimals only if not integer
        if (Number.isInteger(value)) {
            return ChartConfigs.formatItalianNumber(value);
        } else {
            return ChartConfigs.formatItalianNumber(value, true);
        }
    },

    // Funzione per formattazione italiana con separatori di migliaia e virgola per decimali
    formatItalianNumber: (num, forceDecimals = false) => {
        if (typeof num === 'string') {
            num = parseFloat(num);
        }
        if (isNaN(num)) return '0';
        
        // For tables, always show 2 decimal places
        let decimalString = '';
        if (forceDecimals || !Number.isInteger(num)) {
            const decimalPart = num.toFixed(2).split('.')[1];
            // Only add decimal part if it's not "00"
            if (decimalPart !== '00') {
                decimalString = ',' + decimalPart;
            }
        }
        
        // Handle decimal part - use comma for Italian format
        const parts = num.toString().split('.');
        let integerPart = parts[0];
        
        // Add thousand separators (periods)
        if (integerPart.length > 3) {
            const groups = [];
            let i = integerPart.length;
            while (i > 0) {
                const start = Math.max(0, i - 3);
                groups.unshift(integerPart.substring(start, i));
                i -= 3;
            }
            integerPart = groups.join('.');
        }
        
        return integerPart + decimalString;
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
                            return `${label}: ${ChartConfigs.formatItalianNumber(value, true)} km (${percentage}%)`;
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
                    },
                    ticks: {
                        callback: function(value, index, ticks) {
                            return ChartConfigs.formatItalianNumber(value);
                        }
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
                            const km = ChartConfigs.formatItalianNumber(context.raw, true);
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
                    },
                    ticks: {
                        callback: function(value, index, ticks) {
                            return ChartConfigs.formatItalianNumber(value);
                        }
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
                            const km = ChartConfigs.formatItalianNumber(context.raw, true);
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
