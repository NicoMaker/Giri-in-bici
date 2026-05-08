// File di configurazione centralizzato per tutti i grafici
// Questo file contiene tutte le configurazioni dei grafici utilizzati nel progetto

const ChartConfigs = {
    // Formattazione numeri condivisa
    formatNumber: (value) => {
        // Always use Italian formatting for charts
        return ChartConfigs.formatItalianNumber(value);
    },

    // Funzione per formattazione italiana con separatori di migliaia e virgola per decimali
    formatItalianNumber: (num, forceDecimals = false, isPercentage = false) => {
        if (typeof num === 'string') {
            num = parseFloat(num);
        }
        if (isNaN(num)) return '0';
        
        // Convert to string and handle decimal part
        const numStr = num.toString();
        const parts = numStr.split('.');
        let integerPart = parts[0];
        let decimalPart = parts[1] || '';
        
        // For tables and percentages, always show 2 decimal places
        if (forceDecimals || isPercentage || !Number.isInteger(num)) {
            // Ensure we have exactly 2 decimal places
            decimalPart = num.toFixed(2).split('.')[1];
            // Only add decimal part if it's not "00"
            if (decimalPart !== '00') {
                decimalString = ',' + decimalPart;
            } else {
                decimalString = '';
            }
        } else if (decimalPart !== '') {
            // For charts, show existing decimals with comma
            decimalString = ',' + decimalPart;
        } else {
            // No decimal part
            decimalString = '';
        }
        
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
                            const percentageRaw = (value / total) * 100;
                            const percentage = ChartConfigs.formatItalianNumber(percentageRaw);
                            return `${label}: ${ChartConfigs.formatItalianNumber(value)} km (${percentage}%)`;
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
                            const km = ChartConfigs.formatItalianNumber(context.raw);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentageRaw = (context.raw / total) * 100;
                            const percentage = ChartConfigs.formatItalianNumber(percentageRaw);
                            return `${context.dataset.label}: ${km} km (${percentage}%)`;
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
                            const km = ChartConfigs.formatItalianNumber(context.raw);
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
