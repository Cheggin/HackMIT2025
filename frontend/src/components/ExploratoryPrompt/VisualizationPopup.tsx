import { X } from 'lucide-react';
import TypedChartContainer from '../Visualizations/TypedChartContainer';
import ChartContainer from '../Visualizations/ChartContainer';
import { transformSQLToTypedChartData } from '../../utils/sqlChartService';
import type { GeneratedChartData } from '../../services/exploratoryService';

interface VisualizationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  chartData: GeneratedChartData | null;
  isLoading: boolean;
  error: string | null;
}

export default function VisualizationPopup({
  isOpen,
  onClose,
  chartData,
  isLoading,
  error
}: VisualizationPopupProps) {
  if (!isOpen) return null;

  // Transform the data for the chart
  const getChartComponent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-posthog-accent mb-4"></div>
          <p className="text-posthog-text-secondary">Generating visualization...</p>
          <p className="text-xs text-posthog-text-tertiary mt-2">This may take a few moments</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-posthog-error mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-posthog-text-primary font-semibold mb-2">Failed to generate visualization</p>
          <p className="text-sm text-posthog-text-secondary text-center max-w-md">{error}</p>
        </div>
      );
    }

    if (!chartData) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-posthog-text-secondary">No data available</p>
        </div>
      );
    }

    // Check if it's a supported typed chart
    const supportedTypes = ['pie', 'bar', 'line', 'area', 'scatter'];
    const isTypedChart = supportedTypes.includes(chartData.graph.type);

    if (isTypedChart) {
      // Transform SQL data to typed format
      const typedData = transformSQLToTypedChartData(
        chartData.data,
        chartData.graph.type as any,
        chartData.graph.extra
      );

      return (
        <TypedChartContainer
          chart={{
            title: chartData.graph.title,
            data: typedData,
            justification: chartData.graph.justification
          }}
          isFullscreen={false}
          onToggleFullscreen={() => {}}
        />
      );
    } else {
      // Use legacy chart container for other types
      return (
        <ChartContainer
          chart={{
            type: chartData.graph.type as any,
            title: chartData.graph.title,
            data: chartData.data,
            justification: chartData.graph.justification || '',
            priority: 1
          }}
          isFullscreen={false}
          onToggleFullscreen={() => {}}
        />
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="relative bg-posthog-bg-elevated border border-posthog-border rounded-lg shadow-2xl
                      w-[90vw] h-[85vh] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-posthog-border">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-posthog-text-primary">
              {chartData?.graph.title || 'Generated Visualization'}
            </h2>
            {chartData?.graph.justification && (
              <p className="text-sm text-posthog-text-secondary mt-1">
                {chartData.graph.justification}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-posthog-bg-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-posthog-text-secondary" />
          </button>
        </div>

        {/* Chart Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {getChartComponent()}
        </div>

        {/* Footer with SQL Query */}
        {chartData && !isLoading && !error && (
          <div className="px-6 py-4 border-t border-posthog-border">
            <details className="cursor-pointer">
              <summary className="text-xs font-semibold text-posthog-text-secondary hover:text-posthog-text-primary transition-colors">
                View Generated SQL Query
              </summary>
              <pre className="mt-2 p-3 bg-posthog-bg-default border border-posthog-border rounded-lg text-xs text-posthog-text-tertiary overflow-x-auto">
                {chartData.graph.sql_query}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}