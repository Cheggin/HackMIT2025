import { useState } from 'react';
import { Maximize2, Minimize2, Download, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { clsx } from 'clsx';
import LineChartWithHistory from './ChartTypes/LineChartWithHistory';
import BarChartComponent from './ChartTypes/BarChart';
import HeatmapComponent from './ChartTypes/HeatmapChart';
import SankeyComponent from './ChartTypes/SankeyChart';
import FunnelComponent from './ChartTypes/FunnelChart';
import { CHART_TYPES } from '../../utils/chartRecommendationEngine';
import type { Chart, ChartData } from '../../types';

interface ChartContainerProps {
  chart: Chart;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  constitutionMode: boolean;
}

const chartComponents: Record<string, React.ComponentType<{ data: ChartData[] }>> = {
  [CHART_TYPES.LINE]: LineChartWithHistory, // Use the new component with history
  [CHART_TYPES.BAR]: BarChartComponent,
  [CHART_TYPES.HEATMAP]: HeatmapComponent,
  [CHART_TYPES.SANKEY]: SankeyComponent,
  [CHART_TYPES.FUNNEL]: FunnelComponent,
};

export default function ChartContainer({ chart, isFullscreen, onToggleFullscreen, constitutionMode }: ChartContainerProps) {
  const [showJustification, setShowJustification] = useState(false);
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

        {constitutionMode && (
          <button
            onClick={() => setShowJustification(!showJustification)}
            className="flex items-center space-x-2 text-xs text-posthog-accent hover:text-posthog-accent-hover transition-colors"
          >
            <Info className="w-3 h-3" />
            <span>AI Justification</span>
            {showJustification ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}

        {showJustification && constitutionMode && (
          <div className="mt-3 p-3 bg-posthog-bg-primary rounded-lg border border-posthog-border">
            <p className="text-xs text-posthog-text-secondary">
              {chart.justification}
            </p>
          </div>
        )}
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