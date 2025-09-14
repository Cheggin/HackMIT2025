import { useState, useRef } from 'react';
import { Maximize2, Minimize2, Download, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { toPng } from 'html-to-image';
import type { AnyChartData } from '../../types/charts';
import PieChartTyped from './ChartTypes/PieChartTyped';
import BarChartTyped from './ChartTypes/BarChartTyped';
import LineChartTyped from './ChartTypes/LineChartTyped';
import AreaChartTyped from './ChartTypes/AreaChartTyped';
import ScatterChartTyped from './ChartTypes/ScatterChartTyped';
import JustificationPopup from './JustificationPopup';

interface TypedChartContainerProps {
  chart: { title: string; data: AnyChartData; justification?: string };
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function TypedChartContainer({ chart, isFullscreen, onToggleFullscreen }: TypedChartContainerProps) {
  const [isLoading] = useState(false);
  const [showJustification, setShowJustification] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!chartRef.current) return;

    try {
      // Export as PNG
      const dataUrl = await toPng(chartRef.current, {
        quality: 0.95,
        backgroundColor: '#1B1B1B',
        style: {
          padding: '20px'
        }
      });

      // Download the image
      const link = document.createElement('a');
      link.download = `${chart.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export chart:', error);
    }
  };

  const renderChart = () => {
    switch (chart.data.kind) {
      case 'pie':
        return <PieChartTyped data={chart.data.data} />;
      case 'bar':
        return <BarChartTyped data={chart.data.data} />;
      case 'line':
        return <LineChartTyped data={chart.data.data} />;
      case 'area':
        return <AreaChartTyped data={chart.data.data} />;
      case 'scatter':
        return <ScatterChartTyped data={chart.data.data} />;
      default:
        return <div className="h-full flex items-center justify-center text-posthog-text-secondary">Unsupported chart</div>;
    }
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
            {chart.justification && (
              <button
                onClick={() => setShowJustification(!showJustification)}
                className="p-1.5 hover:bg-posthog-bg-tertiary rounded transition-colors relative"
                title="Show justification"
              >
                <Info className="w-4 h-4 text-posthog-accent" />
              </button>
            )}
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
      </div>

      <div className="flex-1 p-4 overflow-hidden" ref={chartRef}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="space-y-3 w-full">
              <div className="h-4 bg-posthog-bg-tertiary rounded animate-pulse"></div>
              <div className="h-32 bg-posthog-bg-tertiary rounded animate-pulse"></div>
              <div className="h-4 bg-posthog-bg-tertiary rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : (
          renderChart()
        )}
      </div>

      {showJustification && chart.justification && (
        <JustificationPopup
          title={chart.title}
          justification={chart.justification}
          onClose={() => setShowJustification(false)}
        />
      )}
    </div>
  );
}


