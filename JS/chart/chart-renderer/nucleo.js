// ============================================================
// nucleo.js — Renderer universale per grafici: costruttore e
// metodi generali (creazione, configurazione, distruzione).
//
// I gestori di dati specifici per ogni tipo di pagina stanno in
// chart-renderer/data/pagine.js e
// chart-renderer/data/storico.js, aggiunti al prototipo di
// UniversalChartRenderer.
//
// Dipendenze: chart-configs.js (window.ChartConfigs), Chart.js
// ============================================================

class UniversalChartRenderer {
  constructor() {
    this.charts = new Map();
    this.configs = window.ChartConfigs;
    if (!this.configs) {
      console.error(
        "ChartConfigs non trovato. Includere chart-configs.js prima di questo file.",
      );
    }
  }

  async createChart(pageType, data, customOptions = {}) {
    try {
      const pageConfig = this.configs.pages[pageType];
      if (!pageConfig) {
        throw new Error(`Configurazione per pagina '${pageType}' non trovata`);
      }

      const processedData = await this.processData(
        pageConfig.dataProcessor,
        data,
        pageConfig.chartType,
      );
      const chartConfig = this.buildChartConfig(
        pageConfig.chartType,
        processedData,
        customOptions,
      );
      const ctx = this.getCanvasContext(pageConfig.containerId);
      if (!ctx) {
        throw new Error(
          `Canvas con ID '${pageConfig.containerId}' non trovato`,
        );
      }

      this.destroyChart(pageConfig.containerId);
      const chart = new Chart(ctx, chartConfig);
      this.charts.set(pageConfig.containerId, chart);

      // Se il grafico è stato misurato prima che il contenitore avesse
      // un'altezza reale (sezioni animate, canvas appena inseriti nel DOM),
      // lo rimisuro dopo il primo paint.
      requestAnimationFrame(() => {
        try {
          if (chart.canvas && chart.canvas.isConnected) chart.resize();
        } catch (e) {
          /* grafico già distrutto */
        }
      });

      return chart;
    } catch (error) {
      console.error("Errore nella creazione del grafico:", error);
      throw error;
    }
  }

  // Smista verso il processore giusto: ognuno vive nel proprio file,
  // aggiunto al prototipo di questa classe (vedi intestazione).
  async processData(processorType, data, chartType) {
    switch (processorType) {
      case "processSeasonData":
        return this.processSeasonData(data, chartType);
      case "processGeneralStatsData":
        return this.processGeneralStatsData(data, chartType);
      case "processYearData":
        return this.processYearData(data, chartType);
      case "processTotalHistoryData":
        return this.processTotalHistoryData(data);
      case "processMonthlyHistoryData":
        return this.processMonthlyHistoryData({ ...data, chartType });
      default:
        throw new Error(`Processore dati '${processorType}' non implementato`);
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
      options: this.mergeOptions(baseConfig.options, customOptions),
    };
  }

  mergeOptions(baseOptions, customOptions) {
    return this.deepMerge(baseOptions, customOptions);
  }

  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          typeof source[key] === "object" &&
          source[key] !== null &&
          !Array.isArray(source[key])
        ) {
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
    return canvas.getContext("2d");
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
        const chart = await this.createChart(
          config.pageType,
          config.data,
          config.options,
        );
        charts.push({ containerId: config.containerId, chart });
      } catch (error) {
        console.error(
          `Errore nella creazione del grafico per ${config.pageType}:`,
          error,
        );
      }
    }
    return charts;
  }
}

window.UniversalChartRenderer = UniversalChartRenderer;
