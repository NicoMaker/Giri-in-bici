// Renderer universale per grafici
class UniversalChartRenderer {
    constructor() {
        this.charts = new Map();
        this.configs = window.ChartConfigs;
        if (!this.configs) {
            console.error('ChartConfigs non trovato. Includere chart-configs.js prima di questo file.');
        }
    }

    async createChart(pageType, data, customOptions = {}) {
        try {
            const pageConfig = this.configs.pages[pageType];
            if (!pageConfig) {
                throw new Error(`Configurazione per pagina '${pageType}' non trovata`);
            }

            const processedData = await this.processData(pageConfig.dataProcessor, data, pageConfig.chartType);
            const chartConfig = this.buildChartConfig(pageConfig.chartType, processedData, customOptions);
            const ctx = this.getCanvasContext(pageConfig.containerId);
            if (!ctx) {
                throw new Error(`Canvas con ID '${pageConfig.containerId}' non trovato`);
            }

            this.destroyChart(pageConfig.containerId);
            const chart = new Chart(ctx, chartConfig);
            this.charts.set(pageConfig.containerId, chart);
            return chart;

        } catch (error) {
            console.error('Errore nella creazione del grafico:', error);
            throw error;
        }
    }

    async processData(processorType, data, chartType) {
        switch (processorType) {
            case 'processSeasonData':          return this.processSeasonData(data);
            case 'processGeneralStatsData':    return this.processGeneralStatsData(data);
            case 'processYearData':            return this.processYearData(data);
            case 'processTotalHistoryData':    return this.processTotalHistoryData(data);
            case 'processMonthlyHistoryData':  return this.processMonthlyHistoryData({ ...data, chartType });
            default:
                throw new Error(`Processore dati '${processorType}' non implementato`);
        }
    }

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

    async processTotalHistoryData(data) {
        const { labels, values, percentuali } = data;
        return {
            labels: labels.map((mese, index) => `${mese} (${data.anni[index]})`),
            datasets: [{
                label: "km mensili per periodo totali",
                backgroundColor: "transparent",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 3,
                fill: false,
                data: values,
                percentuali: percentuali
            }]
        };
    }

    async processMonthlyHistoryData(data) {
        const { labels, values, colors, percentuali, chartType } = data;

        if (chartType === 'line') {
            return {
                labels,
                datasets: [{
                    label: "km mensili totali (andamento)",
                    data: values,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "transparent",
                    borderWidth: 3,
                    pointBackgroundColor: "rgba(54, 162, 235, 1)",
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

    mergeOptions(baseOptions, customOptions) {
        return this.deepMerge(baseOptions, customOptions);
    }

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

    getCanvasContext(containerId) {
        const canvas = document.getElementById(containerId);
        if (!canvas) {
            console.error(`Canvas con ID '${containerId}' non trovato`);
            return null;
        }
        return canvas.getContext('2d');
    }

    destroyChart(containerId) {
        const existingChart = this.charts.get(containerId);
        if (existingChart) {
            existingChart.destroy();
            this.charts.delete(containerId);
        }
    }

    destroyAllCharts() {
        this.charts.forEach((chart) => chart.destroy());
        this.charts.clear();
    }

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

window.chartRenderer = new UniversalChartRenderer();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalChartRenderer;
}