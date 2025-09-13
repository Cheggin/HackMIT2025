import type { ChartData } from '../types';

export interface ChartRecommendation {
  type: 'line' | 'bar' | 'heatmap' | 'sankey' | 'funnel';
  reason: string;
  confidence: number;
}

export const CHART_TYPES: {
  LINE: 'line';
  BAR: 'bar';
  HEATMAP: 'heatmap';
  SANKEY: 'sankey';
  FUNNEL: 'funnel';
};

export function recommendChart(data: ChartData[]): ChartRecommendation;