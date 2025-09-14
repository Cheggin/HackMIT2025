import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ChartData } from '../../../types';

interface LineChartWithHistoryProps {
  data: ChartData[];
}

const MAX_HISTORY = 5; // Keep last 5 snapshots

export default function LineChartWithHistory({ data }: LineChartWithHistoryProps) {
  const [historicalData, setHistoricalData] = useState<ChartData[][]>([]);
  const [key, setKey] = useState(0);
  const [tooltipEnabled, setTooltipEnabled] = useState(true);

  useEffect(() => {
    if (data && data.length > 0) {
      setHistoricalData(prev => {
        // Add current data as new snapshot
        const newHistory = [...prev, data];
        // Keep only the last MAX_HISTORY snapshots
        return newHistory.slice(-MAX_HISTORY);
      });

      // Force re-render of the entire chart to reset tooltip state
      setKey(prev => prev + 1);

      // Disable tooltip completely during data update
      setTooltipEnabled(false);
      setTimeout(() => {
        setTooltipEnabled(true);
      }, 100); // Brief disable to reset hover state
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
        merged[`volume_hist_${histIndex}`] = histPoint.volume;
        merged[`amount_hist_${histIndex}`] = histPoint.amount;
        merged[`fraudCount_hist_${histIndex}`] = histPoint.fraudCount;
      }
    });

    return merged;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        key={key}
        data={mergedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 45 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
        <XAxis
          dataKey="time"
          stroke="#8F8F8F"
          style={{ fontSize: '9px' }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={50}
        />
        <YAxis
          stroke="#8F8F8F"
          style={{ fontSize: '12px' }}
        />
        {tooltipEnabled && (
          <Tooltip
            cursor={{ stroke: '#8F8F8F', strokeWidth: 1 }}
            animationDuration={0}
            isAnimationActive={false}
            contentStyle={{
              backgroundColor: '#2D2D2D',
              border: '1px solid #3D3D3D',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#8F8F8F' }}
            itemStyle={{ color: '#FFFFFF' }}
            content={(props) => {
              const { active, payload, label } = props;
              if (active && payload && payload.length) {
              // Filter to show only current line data (not historical)
              const currentData = payload.filter(p =>
                p.dataKey === 'volume' ||
                p.dataKey === 'amount'
              );

              return (
                <div style={{
                  backgroundColor: '#2D2D2D',
                  border: '1px solid #3D3D3D',
                  borderRadius: '8px',
                  padding: '10px'
                }}>
                  <p style={{ color: '#8F8F8F', margin: '0 0 5px 0' }}>{label}</p>
                  {currentData.map((entry, index) => {
                    const formattedValue = entry.dataKey === 'amount'
                      ? `$${Number(entry.value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
                      : entry.value;
                    return (
                      <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                        {entry.name}: {formattedValue}
                      </p>
                    );
                  })}
                </div>
              );
            }
            return null;
          }}
          />
        )}

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
                activeDot={false}
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
                activeDot={false}
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
                  activeDot={false}
                  isAnimationActive={false}
                  connectNulls
                  legendType="none"
                />
              )}
            </g>
          );
        })}

        {/* Current lines with morphing animation */}
        <Line
          type="monotone"
          dataKey="volume"
          stroke="#F54E00"
          strokeWidth={2}
          dot={false}
          activeDot={tooltipEnabled ? { r: 4 } : false}
          name="Transaction Volume"
          isAnimationActive={true}
          animationDuration={500}
          animationEasing="ease-in-out"
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#10B981"
          strokeWidth={2}
          dot={false}
          activeDot={tooltipEnabled ? { r: 4 } : false}
          name="Total Amount"
          isAnimationActive={true}
          animationDuration={500}
          animationEasing="ease-in-out"
        />
        {data[0]?.fraudCount !== undefined && (
          <Line
            type="monotone"
            dataKey="fraudCount"
            stroke="#EF4444"
            strokeWidth={2}
            dot={false}
            activeDot={tooltipEnabled ? { r: 4 } : false}
            name="Fraud Count"
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-in-out"
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