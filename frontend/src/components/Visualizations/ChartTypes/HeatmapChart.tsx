import React from 'react';
import type { ChartData } from '../../../types';

interface HeatmapComponentProps {
  data: ChartData[];
}

export default function HeatmapComponent({ data }: HeatmapComponentProps) {
  if (!data || data.length === 0) return null;

  // Get unique locations and hours
  const locations = [...new Set(data.map(d => d.location))];
  const hours = [...new Set(data.map(d => d.hour))].sort((a, b) => a - b);

  // Find max value for color scaling
  const maxValue = Math.max(...data.map(d => d.value));

  const getColor = (value) => {
    const intensity = value / maxValue;
    if (intensity === 0) return '#1C1C1C';
    if (intensity < 0.25) return '#2D4A3D';
    if (intensity < 0.5) return '#4A7C59';
    if (intensity < 0.75) return '#F59E0B';
    return '#F54E00';
  };

  const getCellValue = (location, hour) => {
    const cell = data.find(d => d.location === location && d.hour === hour);
    return cell ? cell.value : 0;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-[auto_repeat(24,_minmax(30px,_1fr))] gap-0.5">
            <div className="text-xs text-posthog-text-secondary p-2"></div>
            {hours.map(hour => (
              <div key={hour} className="text-xs text-posthog-text-secondary text-center p-1">
                {hour}h
              </div>
            ))}

            {locations.map(location => (
              <React.Fragment key={location}>
                <div className="text-xs text-posthog-text-secondary p-2 whitespace-nowrap">
                  {location}
                </div>
                {hours.map(hour => {
                  const value = getCellValue(location, hour);
                  return (
                    <div
                      key={`${location}-${hour}`}
                      className="relative group"
                      style={{ backgroundColor: getColor(value) }}
                    >
                      <div className="w-full h-8 cursor-pointer hover:ring-1 hover:ring-posthog-accent transition-all">
                        <div className="absolute hidden group-hover:block z-10 bg-posthog-bg-secondary border border-posthog-border rounded p-2 text-xs whitespace-nowrap -top-12 left-1/2 transform -translate-x-1/2">
                          <div className="text-posthog-text-primary">{location}</div>
                          <div className="text-posthog-text-secondary">{hour}:00</div>
                          <div className="text-posthog-accent font-semibold">${value.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center space-x-4">
        <span className="text-xs text-posthog-text-secondary">Low</span>
        <div className="flex space-x-1">
          <div className="w-6 h-4 bg-[#1C1C1C] border border-posthog-border"></div>
          <div className="w-6 h-4 bg-[#2D4A3D]"></div>
          <div className="w-6 h-4 bg-[#4A7C59]"></div>
          <div className="w-6 h-4 bg-[#F59E0B]"></div>
          <div className="w-6 h-4 bg-[#F54E00]"></div>
        </div>
        <span className="text-xs text-posthog-text-secondary">High</span>
      </div>
    </div>
  );
}