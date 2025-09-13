import 'react';
import type { ChartData } from '../../../types';

interface SankeyComponentProps {
  data: ChartData[];
}

export default function SankeyComponent({ data }: SankeyComponentProps) {
  if (!data || data.length === 0) return null;

  // Get unique sources and targets
  const sources = [...new Set(data.map(d => d.source))];
  const targets = [...new Set(data.map(d => d.target))];

  // Calculate positions
  const sourceY = sources.map((_, i) => (i + 1) * (100 / (sources.length + 1)));
  const targetY = targets.map((_, i) => (i + 1) * (100 / (targets.length + 1)));

  // Calculate total values for each source
  const sourceTotals: Record<string, number> = {};
  sources.forEach(source => {
    if (source !== undefined) {
      sourceTotals[source] = data
        .filter(d => d.source === source)
        .reduce((sum, d) => sum + (d.value ?? 0), 0);
    }
  });

  const getColor = (source: string | undefined) => {
    const colors = ['#F54E00', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];
    const index = sources.indexOf(source);
    return colors[index % colors.length];
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg width="100%" height="100%" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
        {/* Source nodes */}
        {sources.map((source, i) => (
          <g key={`source-${source}`}>
            <rect
              x="50"
              y={sourceY[i] * 3 - 15}
              width="80"
              height="30"
              fill={getColor(source)}
              rx="4"
            />
            <text
              x="90"
              y={sourceY[i] * 3}
              fill="white"
              fontSize="12"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {source}
            </text>
          </g>
        ))}

        {/* Target nodes */}
        {targets.map((target, i) => {
          const color = target === 'success' ? '#10B981' : target === 'pending' ? '#F59E0B' : '#EF4444';
          return (
            <g key={`target-${target}`}>
              <rect
                x="370"
                y={targetY[i] * 3 - 15}
                width="80"
                height="30"
                fill={color}
                rx="4"
              />
              <text
                x="410"
                y={targetY[i] * 3}
                fill="white"
                fontSize="12"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {target}
              </text>
            </g>
          );
        })}

        {/* Flow paths */}
        {data.map((flow, index) => {
          const sourceIndex = sources.indexOf(flow.source);
          const targetIndex = targets.indexOf(flow.target);
          const sourceYPos = sourceY[sourceIndex] * 3;
          const targetYPos = targetY[targetIndex] * 3;
          const strokeWidth = flow.source && sourceTotals[flow.source]
            ? Math.max(2, ((flow.value ?? 0) / sourceTotals[flow.source]) * 30)
            : 2;

          return (
            <path
              key={index}
              d={`M 130 ${sourceYPos} C 250 ${sourceYPos}, 250 ${targetYPos}, 370 ${targetYPos}`}
              stroke={getColor(flow.source)}
              strokeWidth={strokeWidth}
              fill="none"
              opacity="0.6"
              className="hover:opacity-100 transition-opacity cursor-pointer"
            >
              <title>{`${flow.source} → ${flow.target}: ${flow.value}`}</title>
            </path>
          );
        })}

        {/* Value labels */}
        {data.map((flow, index) => {
          const sourceIndex = sources.indexOf(flow.source);
          const targetIndex = targets.indexOf(flow.target);
          const sourceYPos = sourceY[sourceIndex] * 3;
          const targetYPos = targetY[targetIndex] * 3;
          const midY = (sourceYPos + targetYPos) / 2;

          return (
            <text
              key={`label-${index}`}
              x="250"
              y={midY}
              fill="#8F8F8F"
              fontSize="10"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {flow.value}
            </text>
          );
        })}
      </svg>
    </div>
  );
}