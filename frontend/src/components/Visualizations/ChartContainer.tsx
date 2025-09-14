import { useState } from 'react';
import { Maximize2, Minimize2, Download } from 'lucide-react';
import { clsx } from 'clsx';
import LineChartWithHistory from './ChartTypes/LineChartWithHistory';
import NetworkGraph3D from './ChartTypes/NetworkGraph3D';
import SankeyComponent from './ChartTypes/SankeyChart';
import FunnelComponent from './ChartTypes/FunnelChart';
import CohortHeatmap from './ChartTypes/CohortHeatmap';
import { CHART_TYPES } from '../../utils/chartRecommendationEngine';
import type { Chart, ChartData } from '../../types';

interface ChartContainerProps {
  chart: Chart;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const chartComponents: Record<string, React.ComponentType<{ data: ChartData[] }>> = {
  [CHART_TYPES.LINE]: LineChartWithHistory,
  // Fallbacks for legacy non-SQL mode after removing Bar/Pie legacy components
  [CHART_TYPES.BAR]: LineChartWithHistory,
  [CHART_TYPES.PIE]: LineChartWithHistory,
  [CHART_TYPES.NETWORK3D]: NetworkGraph3D,
  [CHART_TYPES.SANKEY]: SankeyComponent,
  [CHART_TYPES.FUNNEL]: FunnelComponent,
  [CHART_TYPES.COHORT_HEATMAP]: CohortHeatmap,
};

export default function ChartContainer({ chart, isFullscreen, onToggleFullscreen }: ChartContainerProps) {
  const [isLoading] = useState(false);

  const ChartComponent = chartComponents[chart.type as string] || LineChartWithHistory;

  const handleExport = () => {
    console.log('Exporting chart:', chart.title);
    // In a real app, this would export the chart as an image or CSV
  };

  return (
    <div
      className={clsx(
        'bg-posthog-bg-secondary border border-posthog-border rounded-lg flex flex-col',
        isFullscreen ? 'fixed inset-4 z-50' : 'h-full'
      )}
    >
      <div className="p-4 border-b border-posthog-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-semibold text-posthog-text-primary">
              {chart.title}
            </h3>
            <span className="text-xs text-posthog-text-secondary">
              Updated {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="p-1.5 hover:bg-posthog-bg-tertiary rounded transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4 text-posthog-text-secondary" />
            </button>
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 hover:bg-posthog-bg-tertiary rounded transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-posthog-text-secondary" />
              ) : (
                <Maximize2 className="w-4 h-4 text-posthog-text-secondary" />
              )}
            </button>
          </div>
        </div>

        {/* Justification UI removed */}
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="space-y-3 w-full">
              <div className="h-4 bg-posthog-bg-tertiary rounded animate-pulse"></div>
              <div className="h-32 bg-posthog-bg-tertiary rounded animate-pulse"></div>
              <div className="h-4 bg-posthog-bg-tertiary rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : (
          <ChartComponent data={chart.data} />
        )}
      </div>
    </div>
  );
}