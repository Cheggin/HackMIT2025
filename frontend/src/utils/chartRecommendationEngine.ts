import type { FinancialEvent, Chart, ChartData } from '../types';

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  SANKEY: 'sankey',
  FUNNEL: 'funnel',
  NETWORK3D: 'network3d'
} as const;

export type ChartType = typeof CHART_TYPES[keyof typeof CHART_TYPES];

interface ConstitutionRule {
  id: string;
  condition: string;
  action: string;
  priority: number;
  justification: string;
}

interface ConstitutionRules {
  name: string;
  version: string;
  rules: ConstitutionRule[];
  anomalyThresholds: {
    highAmount: number;
    highRiskScore: number;
    multipleFailuresThreshold: number;
  };
}

export const constitutionRules: ConstitutionRules = {
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
    multipleFailuresThreshold: 3
  }
};

interface DataCharacteristics {
  hasTimeSeries: boolean;
  hasCategoricalBreakdown: Record<string, number>;
  hasFlowPatterns: Record<string, number>;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  anomalyCount: number;
}

function analyzeDataCharacteristics(events: FinancialEvent[]): DataCharacteristics {
  const characteristics: DataCharacteristics = {
    hasTimeSeries: false,
    hasCategoricalBreakdown: {},
    hasFlowPatterns: {},
    trendDirection: 'stable',
    anomalyCount: 0
  };

  if (events.length === 0) return characteristics;

  // Check for time series data
  const timestamps = events.map(e => new Date(e.timestamp).getTime());
  const timeDiffs = timestamps.slice(1).map((t, i) => t - timestamps[i]);
  characteristics.hasTimeSeries = timeDiffs.length > 0;

  // Analyze categorical breakdown
  events.forEach(event => {
    if (!characteristics.hasCategoricalBreakdown[event.eventType]) {
      characteristics.hasCategoricalBreakdown[event.eventType] = 0;
    }
    characteristics.hasCategoricalBreakdown[event.eventType]++;

    if (!characteristics.hasFlowPatterns[event.status]) {
      characteristics.hasFlowPatterns[event.status] = 0;
    }
    characteristics.hasFlowPatterns[event.status]++;
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

  return characteristics;
}

export function recommendChart(events: FinancialEvent[]): Chart {
  const characteristics = analyzeDataCharacteristics(events);
  const rule = constitutionRules.rules[0];

  // Default to line chart for time series
  return {
    type: CHART_TYPES.LINE,
    title: 'Transaction Volume Over Time',
    justification: `${rule.justification}. Data shows ${characteristics.trendDirection} trend with ${events.length} data points.`,
    data: prepareTimeSeriesData(events),
    priority: 1
  };
}

export function recommendCharts(events: FinancialEvent[], maxCharts: number = 4): Chart[] {
  const characteristics = analyzeDataCharacteristics(events);
  const recommendations: Chart[] = [];

  // Always include time series - even with minimal data
  const timeSeriesRule = constitutionRules.rules.find(r => r.id === 'time_series_rule')!;
  const timeSeriesData = prepareTimeSeriesData(events);
  if (timeSeriesData.length > 0 || events.length > 0) {
    recommendations.push({
      type: CHART_TYPES.LINE,
      title: 'Transaction Volume Over Time',
      justification: `${timeSeriesRule.justification}. Data shows ${characteristics.trendDirection} trend with ${events.length} data points and ${characteristics.anomalyCount} anomalies detected.`,
      data: timeSeriesData,
      priority: 1
    });
  }

  // Always add categorical comparison
  if (true) {
    const rule = constitutionRules.rules.find(r => r.id === 'categorical_comparison')!;
    recommendations.push({
      type: CHART_TYPES.BAR,
      title: 'Transaction Types Distribution',
      justification: `${rule.justification}. Found ${Object.keys(characteristics.hasCategoricalBreakdown).length} different transaction types to compare.`,
      data: prepareCategoricalData(events),
      priority: 2
    });
  }

  // Add pie chart for transaction type distribution
  if (events.length > 5) {
    recommendations.push({
      type: CHART_TYPES.PIE,
      title: 'Transaction Type Distribution',
      justification: `Shows the proportion of different transaction types. Analyzing ${events.length} transactions.`,
      data: preparePieData(events),
      priority: 4
    });
  }

  // Add Sankey for flow analysis - high priority
  if (events.length > 10) {
    const rule = constitutionRules.rules.find(r => r.id === 'flow_analysis')!;
    recommendations.push({
      type: CHART_TYPES.SANKEY,
      title: 'Transaction Flow Analysis',
      justification: `${rule.justification}. Visualizing money flow between ${Object.keys(characteristics.hasCategoricalBreakdown).length} transaction types.`,
      data: prepareSankeyData(events),
      priority: 3
    });
  }

  // Add Network3D for advanced visualization - lower priority
  if (events.length > 15) {
    recommendations.push({
      type: CHART_TYPES.NETWORK3D,
      title: '3D Network Visualization',
      justification: `Interactive 3D visualization showing account relationships and transaction flows. Analyzing ${events.length} transactions across multiple accounts.`,
      data: prepareNetworkData(events),
      priority: 5
    });
  }

  // Always add funnel for status progression
  const funnelRule = constitutionRules.rules.find(r => r.id === 'conversion_funnel')!;
  recommendations.push({
    type: CHART_TYPES.FUNNEL,
    title: 'Transaction Status Funnel',
    justification: `${funnelRule.justification}. Tracking progression through ${Object.keys(characteristics.hasFlowPatterns).length} different states.`,
    data: prepareFunnelData(events),
    priority: 4
  });


  return recommendations.slice(0, maxCharts).sort((a, b) => a.priority - b.priority);
}

function prepareTimeSeriesData(events: FinancialEvent[]): ChartData[] {
  if (events.length === 0) return [];

  // Take only the last 50 transactions for a sliding window view
  const recentEvents = events.slice(-50);

  // Create individual data points for each transaction
  // This gives us a smooth sliding window effect
  const dataPoints = recentEvents.map((event, index) => {
    const timestamp = new Date(event.timestamp);
    const timeKey = `${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}`;

    // Calculate running totals up to this point
    const eventsUpToNow = recentEvents.slice(0, index + 1);
    const last50Events = eventsUpToNow.slice(-50); // Consider last 50 for running average

    return {
      time: timeKey,
      volume: last50Events.length,
      amount: last50Events.reduce((sum, e) => sum + (e.amount || 0), 0),
      fraudCount: last50Events.filter(e => e.isFraud).length,
      timestamp: timestamp.getTime()
    };
  });

  // Always return at least some data if we have any events
  const pointsToReturn = Math.min(dataPoints.length, 20);
  return dataPoints.slice(-pointsToReturn);
}

function prepareCategoricalData(events: FinancialEvent[]): ChartData[] {
  // Define all 5 transaction types that should always be shown
  const ALL_TRANSACTION_TYPES = ['PAYMENT', 'TRANSFER', 'CASH_OUT', 'CASH_IN', 'DEBIT'];

  // Initialize categories with all types set to zero
  const categories: Record<string, { count: number; amount: number; fraudCount: number }> = {};

  ALL_TRANSACTION_TYPES.forEach(type => {
    categories[type] = {
      count: 0,
      amount: 0,
      fraudCount: 0
    };
  });

  // Count actual data
  events.forEach(event => {
    const type = event.transactionType || event.eventType;
    if (categories[type]) {
      categories[type].count++;
      categories[type].amount += event.amount;
      if (event.isFraud) {
        categories[type].fraudCount++;
      }
    }
  });

  // Return all types, including those with zero values
  return ALL_TRANSACTION_TYPES.map(name => {
    const data = categories[name];
    return {
      name,
      count: data.count,
      amount: data.amount,
      avgAmount: data.count > 0 ? data.amount / data.count : 0,
      fraudCount: data.fraudCount,
      fraudRate: data.count > 0 ? (data.fraudCount / data.count) * 100 : 0
    };
  });
}

function prepareNetworkData(events: FinancialEvent[]): ChartData[] {
  // Prepare data for 3D network visualization
  // Group by account relationships and include fraud indicators
  const accountMap = new Map<string, ChartData>();

  events.forEach(event => {
    // Source account node
    if (event.sourceAccount) {
      if (!accountMap.has(event.sourceAccount)) {
        accountMap.set(event.sourceAccount, {
          name: event.sourceAccount,
          count: 0,
          value: 0,
          fraudCount: 0,
          fraudRate: 0
        });
      }
      const sourceData = accountMap.get(event.sourceAccount)!;
      sourceData.count! += 1;
      sourceData.value! += event.amount;
      if (event.isFraud) sourceData.fraudCount! += 1;
    }

    // Destination account node
    if (event.destAccount) {
      if (!accountMap.has(event.destAccount)) {
        accountMap.set(event.destAccount, {
          name: event.destAccount,
          count: 0,
          value: 0,
          fraudCount: 0,
          fraudRate: 0
        });
      }
      const destData = accountMap.get(event.destAccount)!;
      destData.count! += 1;
      destData.value! += event.amount;
      if (event.isFraud) destData.fraudCount! += 1;
    }
  });

  // Calculate fraud rates
  accountMap.forEach(data => {
    if (data.count! > 0) {
      data.fraudRate = (data.fraudCount! / data.count!) * 100;
    }
  });

  // Also include transaction-level data for edges
  const transactionData = events.slice(-50).map(event => ({
    name: `${event.transactionType}: $${event.amount.toFixed(0)}`,
    count: 1,
    value: event.amount,
    fraudCount: event.isFraud ? 1 : 0,
    fraudRate: event.isFraud ? 100 : 0
  }));

  return [...Array.from(accountMap.values()), ...transactionData];
}

function preparePieData(events: FinancialEvent[]): ChartData[] {
  // Group events by transaction type
  const typeGroups = events.reduce((acc, event) => {
    const type = event.transactionType || 'Unknown';
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        totalAmount: 0,
        fraudCount: 0
      };
    }
    acc[type].count++;
    acc[type].totalAmount += event.amount;
    if (event.isFraud) {
      acc[type].fraudCount++;
    }
    return acc;
  }, {} as Record<string, { count: number; totalAmount: number; fraudCount: number }>);

  // Convert to chart data format
  const pieData: ChartData[] = Object.entries(typeGroups).map(([type, data]) => ({
    name: type,
    count: data.count,
    value: data.totalAmount,
    fraudCount: data.fraudCount,
    fraudRate: data.count > 0 ? (data.fraudCount / data.count) * 100 : 0
  }));

  // Sort by count descending
  return pieData.sort((a, b) => (b.count || 0) - (a.count || 0));
}

function prepareFunnelData(events: FinancialEvent[]): ChartData[] {
  const total = events.length;
  if (total === 0) {
    return [
      { name: 'Total', value: 0, percentage: 100 },
      { name: 'Processing', value: 0, percentage: 0 },
      { name: 'Completed', value: 0, percentage: 0 }
    ];
  }

  const pending = events.filter(e => e.status === 'pending').length;
  const success = events.filter(e => e.status === 'success').length;

  return [
    { name: 'Total', value: total, percentage: 100 },
    { name: 'Processing', value: total - pending, percentage: ((total - pending) / total) * 100 },
    { name: 'Completed', value: success, percentage: (success / total) * 100 }
  ];
}

function prepareSankeyData(events: FinancialEvent[]): ChartData[] {
  const flows: Record<string, ChartData> = {};

  events.forEach(event => {
    const key = `${event.eventType}-${event.status}`;
    if (!flows[key]) {
      flows[key] = { source: event.eventType, target: event.status, value: 0 };
    }
    flows[key].value! += 1;
  });

  return Object.values(flows);
}