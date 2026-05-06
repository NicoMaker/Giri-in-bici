// Renderer universale per grafici
// Questo file gestisce la creazione di tutti i grafici basandosi sulle configurazioni centralizzate

class UniversalChartRenderer {
    constructor() {
        this.charts = new Map(); // Memorizza i grafici creati per distruggerli quando necessario
        this.configs = window.ChartConfigs;
        if (!this.configs) {
            console.error('ChartConfigs non trovato. Includere chart-configs.js prima di questo file.');
        }
    }

    // Metodo principale per creare un grafico
    async createChart(pageType, data, customOptions = {}) {
        try {
            const pageConfig = this.configs.pages[pageType];
            if (!pageConfig) {
                throw new Error(`Configurazione per pagina '${pageType}' non trovata`);
            }

            // Processa i dati usando il processore specifico
            const processedData = await this.processData(pageConfig.dataProcessor, data, pageConfig.chartType);
            
            // Crea la configurazione del grafico
            const chartConfig = this.buildChartConfig(pageConfig.chartType, processedData, customOptions);
            
            // Ottieni il contesto del canvas
            const ctx = this.getCanvasContext(pageConfig.containerId);
            if (!ctx) {
                throw new Error(`Canvas con ID '${pageConfig.containerId}' non trovato`);
            }

            // Distruggi il grafico esistente se presente
            this.destroyChart(pageConfig.containerId);

            // Crea il nuovo grafico
            const chart = new Chart(ctx, chartConfig);
            this.charts.set(pageConfig.containerId, chart);

            return chart;
        } catch (error) {
            console.error('Errore nella creazione del grafico:', error);
            throw error;
        }
    }

    // Processa i dati in base al tipo di processore
    async processData(processorType, data, chartType) {
        switch (processorType) {
            case 'processSeasonData':
                return this.processSeasonData(data);
            case 'processGeneralStatsData':
                return this.processGeneralStatsData(data);
            case 'processYearData':
                return this.processYearData(data);
            case 'processTotalHistoryData':
                return this.processTotalHistoryData(data);
            case 'processMonthlyHistoryData':
                return this.processMonthlyHistoryData({...data, chartType});
            default:
                throw new Error(`Processore dati '${processorType}' non implementato`);
        }
    }

    // Processore per dati stagionali
    async processSeasonData(data) {
        const { season, image, path, cssclass, colors, subPeriodData } = data;
        const labels = Object.keys(subPeriodData);
        const values = labels.map(label => subPeriodData[label].totalDistance);
        
        return {
            labels,
            datasets: [{
                label: `km ${season}`,
                backgroundColor: colors,
                borderColor: ["black"],
                borderWidth: 1,
                data: values
            }],
            metadata: { season, image, path, cssclass }
        };
    }

    // Processore per dati statistiche generali
    async processGeneralStatsData(data) {
        const { statistics, colors } = data;
        const labels = statistics.map(entry => entry.year);
        const values = statistics.map(entry => entry.km);
        
        return {
            labels,
            datasets: [{
                label: "km totali",
                backgroundColor: colors,
                borderColor: ["black"],
                borderWidth: 1,
                data: values
            }]
        };
    }

    // Processore per dati annuali
    async processYearData(data) {
        const { year, data: monthlyData, colors } = data;
        const labels = Object.keys(monthlyData);
        const values = Object.values(monthlyData);
        
        return {
            labels,
            datasets: [{
                label: `km mensili ${year}`,
                backgroundColor: colors,
                borderColor: "black",
                borderWidth: 1,
                data: values
            }]
        };
    }

    // Processore per dati storici totali
    async processTotalHistoryData(data) {
        const { labels, values, percentuali, colors } = data;
        
        // Usa sempre blu per il grafico a linee
        let borderColor = "rgba(54, 162, 235, 1)";
        let backgroundColor = "transparent";
        
        if (colors && colors.length > 0) {
            // Usa il primo colore ma forza il blu
            borderColor = "rgba(54, 162, 235, 1)";
            backgroundColor = "transparent";
        }
        
        return {
            labels: labels.map((mese, index) => `${mese} (${data.anni[index]})`),
            datasets: [{
                label: "km mensili per periodo totali",
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 3,
                fill: false,
                data: values,
                percentuali: percentuali
            }]
        };
    }

    // Processore per dati storici mensili
    async processMonthlyHistoryData(data) {
        const { labels, values, colors, percentuali, chartType } = data;
        
        // Se è un grafico a linee, usa sempre blu
        if (chartType === 'line') {
            let borderColor = "rgba(54, 162, 235, 1)";
            let backgroundColor = "transparent";
            
            if (colors && colors.length > 0) {
                // Forza sempre il blu per i grafici a linee
                borderColor = "rgba(54, 162, 235, 1)";
                backgroundColor = "transparent";
            }
            
            return {
                labels,
                datasets: [{
                    label: "km mensili totali (andamento)",
                    data: values,
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    borderWidth: 3,
                    pointBackgroundColor: borderColor,
                    pointBorderColor: "rgba(255, 255, 255, 1)",
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.35,
                    fill: false,
                    percentuali: percentuali
                }]
            };
        } else {
            // Grafico a barre (comportamento originale - grassetto)
            return {
                labels,
                datasets: [{
                    label: "km mensili totali",
                    backgroundColor: colors,
                    borderColor: ["black"],
                    borderWidth: 1,
                    data: values,
                    percentuali: percentuali
                }]
            };
        }
    }

    // Costruisce la configurazione completa del grafico
    buildChartConfig(chartType, processedData, customOptions = {}) {
        const baseConfig = this.configs[chartType];
        if (!baseConfig) {
            throw new Error(`Configurazione per tipo '${chartType}' non trovata`);
        }

        return {
            type: chartType,
            data: processedData,
            options: this.mergeOptions(baseConfig.options, customOptions)
        };
    }

    // Unisce le opzioni di base con quelle personalizzate
    mergeOptions(baseOptions, customOptions) {
        return this.deepMerge(baseOptions, customOptions);
    }

    // Merge profondo per oggetti
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(target[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    // Ottiene il contesto del canvas
    getCanvasContext(containerId) {
        const canvas = document.getElementById(containerId);
        if (!canvas) {
            console.error(`Canvas con ID '${containerId}' non trovato`);
            return null;
        }
        return canvas.getContext('2d');
    }

    // Distrugge un grafico specifico
    destroyChart(containerId) {
        const existingChart = this.charts.get(containerId);
        if (existingChart) {
            existingChart.destroy();
            this.charts.delete(containerId);
        }
    }

    // Distrugge tutti i grafici
    destroyAllCharts() {
        this.charts.forEach((chart, containerId) => {
            chart.destroy();
        });
        this.charts.clear();
    }

    // Metodo per creare grafici multipli (es. per pagine con più grafici)
    async createMultipleCharts(chartConfigs) {
        const charts = [];
        
        for (const config of chartConfigs) {
            try {
                const chart = await this.createChart(config.pageType, config.data, config.options);
                charts.push({ containerId: config.containerId, chart });
            } catch (error) {
                console.error(`Errore nella creazione del grafico per ${config.pageType}:`, error);
            }
        }
        
        return charts;
    }
}

// Crea un'istanza globale del renderer
window.chartRenderer = new UniversalChartRenderer();

// Esporta la classe per uso modulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalChartRenderer;
}
