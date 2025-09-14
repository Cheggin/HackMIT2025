import 'react';
import type { ChartData } from '../../../types';

interface FunnelComponentProps {
  data: ChartData[];
}

export default function FunnelComponent({ data }: FunnelComponentProps) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value ?? 0));

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-md">
        {data.map((item, index) => {
          const widthPercentage = ((item.value ?? 0) / maxValue) * 100;
          const isLast = index === data.length - 1;

          return (
            <div key={index} className="relative mb-2">
              <div
                className="mx-auto relative overflow-hidden"
                style={{
                  width: `${widthPercentage}%`,
                  minWidth: '120px',
                }}
              >
                <div
                  className={`h-16 flex items-center justify-between px-4 ${
                    index === 0
                      ? 'bg-gradient-to-r from-posthog-accent to-orange-600'
                      : index === data.length - 1
                      ? 'bg-gradient-to-r from-green-600 to-posthog-success'
                      : 'bg-gradient-to-r from-yellow-600 to-posthog-warning'
                  }`}
                  style={{
                    clipPath: isLast
                      ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                      : 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-semibold">
                      {item.name}
                    </span>
                    <span className="text-white/80 text-xs">
                      {(item.value ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-white text-lg font-bold">
                    {(item.percentage ?? 0).toFixed(1)}%
                  </span>
                </div>
              </div>

              {index < data.length - 1 && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 z-10">
                  <svg width="20" height="10" viewBox="0 0 20 10">
                    <path
                      d="M10 10 L0 0 L20 0 Z"
                      fill="#3D3D3D"
                      opacity="0.3"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-6 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    index === 0
                      ? 'bg-posthog-accent'
                      : index === data.length - 1
                      ? 'bg-posthog-success'
                      : 'bg-posthog-warning'
                  }`}
                ></div>
                <span className="text-posthog-text-secondary">{item.name}</span>
              </div>
              <span className="text-posthog-text-primary font-medium">
                {(item.value ?? 0).toLocaleString()} ({(item.percentage ?? 0).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}