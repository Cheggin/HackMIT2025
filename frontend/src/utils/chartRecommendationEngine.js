export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  HEATMAP: 'heatmap',
  SANKEY: 'sankey',
  FUNNEL: 'funnel'
};

export const constitutionRules = {
  name: 'AI Financial Analytics Constitution',
  version: '1.0.0',
  rules: [
    {
      id: 'time_series_rule',
      condition: 'When analyzing trends over time',
      action: 'Use LINE chart',
      priority: 1,
      justification: 'Line charts best show continuous changes and trends over time periods'
    },
    {
      id: 'categorical_comparison',
      condition: 'When comparing discrete categories',
      action: 'Use BAR chart',
      priority: 2,
      justification: 'Bar charts provide clear visual comparison between different categories'
    },
    {
      id: 'density_pattern',
      condition: 'When showing density or intensity patterns',
      action: 'Use HEATMAP',
      priority: 3,
      justification: 'Heatmaps reveal patterns and concentrations in two-dimensional data'
    },
    {
      id: 'flow_analysis',
      condition: 'When analyzing flow between states or categories',
      action: 'Use SANKEY diagram',
      priority: 4,
      justification: 'Sankey diagrams visualize flow and proportion relationships'
    },
    {
      id: 'conversion_funnel',
      condition: 'When showing progression or conversion rates',
      action: 'Use FUNNEL chart',
      priority: 5,
      justification: 'Funnel charts effectively display drop-off rates in sequential processes'
    }
  ],
  anomalyThresholds: {
    highAmount: 100000,
    highRiskScore: 0.9,
    failureRate: 0.2,
    rapidLocationChange: 60000 // milliseconds
  }
};

export function analyzeDataCharacteristics(events) {
  const characteristics = {
    hasTimeSeriesData: true,
    categoricalBreakdown: {},
    flowPatterns: {},
    conversionMetrics: {},
    densityMetrics: {},
    anomalyCount: 0,
    trendDirection: null
  };

  if (!events || events.length === 0) return characteristics;

  // Analyze categorical breakdown
  events.forEach(event => {
    if (!characteristics.categoricalBreakdown[event.eventType]) {
      characteristics.categoricalBreakdown[event.eventType] = 0;
    }
    characteristics.categoricalBreakdown[event.eventType]++;

    if (!characteristics.flowPatterns[event.status]) {
      characteristics.flowPatterns[event.status] = 0;
    }
    characteristics.flowPatterns[event.status]++;
  });

  // Calculate trend
  if (events.length > 10) {
    const firstHalf = events.slice(0, Math.floor(events.length / 2));
    const secondHalf = events.slice(Math.floor(events.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, e) => sum + e.amount, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, e) => sum + e.amount, 0) / secondHalf.length;

    characteristics.trendDirection = secondHalfAvg > firstHalfAvg ? 'increasing' : 'decreasing';
  }

  // Count anomalies
  characteristics.anomalyCount = events.filter(e =>
    e.amount > constitutionRules.anomalyThresholds.highAmount ||
    e.metadata?.riskScore > constitutionRules.anomalyThresholds.highRiskScore
  ).length;

  // Calculate conversion metrics
  const successCount = events.filter(e => e.status === 'success').length;
  const totalCount = events.length;
  characteristics.conversionMetrics.successRate = totalCount > 0 ? successCount / totalCount : 0;

  return characteristics;
}

export function recommendCharts(events, maxCharts = 4) {
  const characteristics = analyzeDataCharacteristics(events);
  const recommendations = [];

  // Always include a time series chart for financial data
  recommendations.push({
    type: CHART_TYPES.LINE,
    title: 'Transaction Volume Over Time',
    justification: 'Shows temporal patterns and trends in transaction volume',
    data: prepareTimeSeriesData(events),
    priority: 1
  });

  // Add categorical breakdown if there's variety
  if (Object.keys(characteristics.categoricalBreakdown).length > 1) {
    recommendations.push({
      type: CHART_TYPES.BAR,
      title: 'Event Type Distribution',
      justification: 'Compares frequency and volume across different event types',
      data: prepareCategoricalData(events),
      priority: 2
    });
  }

  // Add heatmap for time/location patterns
  if (events.length > 50) {
    recommendations.push({
      type: CHART_TYPES.HEATMAP,
      title: 'Activity Heatmap',
      justification: 'Reveals patterns in transaction activity by time and location',
      data: prepareHeatmapData(events),
      priority: 3
    });
  }

  // Add funnel for conversion analysis
  if (characteristics.conversionMetrics.successRate < 0.95) {
    recommendations.push({
      type: CHART_TYPES.FUNNEL,
      title: 'Transaction Success Funnel',
      justification: 'Visualizes drop-off rates in transaction processing',
      data: prepareFunnelData(events),
      priority: 4
    });
  }

  // Add Sankey for flow analysis if there's enough data
  if (events.length > 30 && Object.keys(characteristics.flowPatterns).length > 2) {
    recommendations.push({
      type: CHART_TYPES.SANKEY,
      title: 'Transaction Flow Analysis',
      justification: 'Shows flow relationships between event types and outcomes',
      data: prepareSankeyData(events),
      priority: 5
    });
  }

  return recommendations.slice(0, maxCharts).sort((a, b) => a.priority - b.priority);
}

function prepareTimeSeriesData(events) {
  // Take only the last 50 transactions for a sliding window view
  const recentEvents = events.slice(-50);

  // Create individual data points for each transaction
  // This gives us a smooth sliding window effect
  const dataPoints = recentEvents.map((event, index) => {
    const timestamp = new Date(event.timestamp);
    const timeKey = `${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}`;

    // Calculate running totals up to this point
    const eventsUpToNow = recentEvents.slice(0, index + 1);
    const last10Events = eventsUpToNow.slice(-10); // Consider last 10 for running average

    return {
      time: timeKey,
      volume: last10Events.length,
      amount: last10Events.reduce((sum, e) => sum + (e.amount || 0), 0),
      fraudCount: last10Events.filter(e => e.isFraud).length,
      timestamp: timestamp.getTime()
    };
  });

  // Return last 20 data points for clean visualization
  return dataPoints.slice(-20);
}

function prepareCategoricalData(events) {
  const categories = {};

  events.forEach(event => {
    const type = event.transactionType || event.eventType;
    if (!categories[type]) {
      categories[type] = {
        name: type,
        count: 0,
        amount: 0,
        fraudCount: 0,
        avgAmount: 0
      };
    }
    categories[type].count++;
    categories[type].amount += event.amount;
    if (event.isFraud) {
      categories[type].fraudCount++;
    }
  });

  // Calculate averages and fraud rates
  Object.values(categories).forEach(cat => {
    cat.avgAmount = cat.count > 0 ? cat.amount / cat.count : 0;
    cat.fraudRate = cat.count > 0 ? (cat.fraudCount / cat.count) * 100 : 0;
  });

  return Object.values(categories);
}

function prepareHeatmapData(events) {
  const heatmapData = [];
  const locations = [...new Set(events.map(e => e.location))];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  locations.forEach(location => {
    hours.forEach(hour => {
      const matchingEvents = events.filter(e => {
        const eventHour = new Date(e.timestamp).getHours();
        return e.location === location && eventHour === hour;
      });

      heatmapData.push({
        location,
        hour,
        value: matchingEvents.reduce((sum, e) => sum + e.amount, 0)
      });
    });
  });

  return heatmapData;
}

function prepareFunnelData(events) {
  const total = events.length;
  const pending = events.filter(e => e.status === 'pending').length;
  const success = events.filter(e => e.status === 'success').length;

  return [
    { name: 'Initiated', value: total, percentage: 100 },
    { name: 'Processing', value: total - pending, percentage: ((total - pending) / total) * 100 },
    { name: 'Completed', value: success, percentage: (success / total) * 100 }
  ];
}

function prepareSankeyData(events) {
  const flows = [];

  events.forEach(event => {
    const key = `${event.eventType}-${event.status}`;
    if (!flows[key]) {
      flows[key] = { source: event.eventType, target: event.status, value: 0 };
    }
    flows[key].value++;
  });

  return Object.values(flows);
}