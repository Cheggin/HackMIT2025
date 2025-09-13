import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ChartData } from '../../../types';

interface LineChartWithHistoryProps {
  data: ChartData[];
}

const MAX_HISTORY = 5; // Keep last 5 snapshots

export default function LineChartWithHistory({ data }: LineChartWithHistoryProps) {
  const [historicalData, setHistoricalData] = useState<ChartData[][]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setHistoricalData(prev => {
        // Add current data as new snapshot
        const newHistory = [...prev, data];
        // Keep only the last MAX_HISTORY snapshots
        return newHistory.slice(-MAX_HISTORY);
      });
    }
  }, [data]);

  // Merge all historical data for the chart
  // We'll need to align the x-axis values
  const mergedData = data.map((point, index) => {
    const merged: any = {
      time: point.time,
      // Current data with full opacity
      volume: point.volume,
      amount: point.amount,
      fraudCount: point.fraudCount,
    };

    // Add historical data with decreasing opacity
    historicalData.forEach((snapshot, histIndex) => {
      const histPoint = snapshot[index];
      if (histPoint) {
        const opacity = (histIndex + 1) / (MAX_HISTORY + 1); // Older = less opacity
        merged[`volume_hist_${histIndex}`] = histPoint.volume;
        merged[`amount_hist_${histIndex}`] = histPoint.amount;
        merged[`fraudCount_hist_${histIndex}`] = histPoint.fraudCount;
      }
    });

    return merged;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={mergedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
        <XAxis
          dataKey="time"
          stroke="#8F8F8F"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#8F8F8F"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#2D2D2D',
            border: '1px solid #3D3D3D',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#8F8F8F' }}
          itemStyle={{ color: '#FFFFFF' }}
        />

        {/* Render historical lines with decreasing opacity */}
        {historicalData.map((_, histIndex) => {
          const opacity = (histIndex + 1) / (MAX_HISTORY + 1);
          return (
            <g key={`hist-${histIndex}`}>
              <Line
                type="monotone"
                dataKey={`volume_hist_${histIndex}`}
                stroke="#F54E00"
                strokeWidth={1}
                strokeOpacity={opacity * 0.3}
                dot={false}
                isAnimationActive={false}
                connectNulls
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey={`amount_hist_${histIndex}`}
                stroke="#10B981"
                strokeWidth={1}
                strokeOpacity={opacity * 0.3}
                dot={false}
                isAnimationActive={false}
                connectNulls
                legendType="none"
              />
              {data[0]?.fraudCount !== undefined && (
                <Line
                  type="monotone"
                  dataKey={`fraudCount_hist_${histIndex}`}
                  stroke="#EF4444"
                  strokeWidth={1}
                  strokeOpacity={opacity * 0.3}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                  legendType="none"
                />
              )}
            </g>
          );
        })}

        {/* Current lines with full opacity */}
        <Line
          type="monotone"
          dataKey="volume"
          stroke="#F54E00"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          name="Transaction Volume"
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#10B981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          name="Total Amount"
        />
        {data[0]?.fraudCount !== undefined && (
          <Line
            type="monotone"
            dataKey="fraudCount"
            stroke="#EF4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            name="Fraud Count"
          />
        )}

        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          iconType="line"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}