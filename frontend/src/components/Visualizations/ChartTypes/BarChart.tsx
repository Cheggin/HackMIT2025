import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ChartData } from '../../../types';

interface BarChartComponentProps {
  data: ChartData[];
}

export default function BarChartComponent({ data }: BarChartComponentProps) {
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 10]);
  const BASE_MAX = 10; // Fixed base maximum for Y-axis

  useEffect(() => {
    if (data && data.length > 0) {
      // Find the maximum value across all bars
      const maxCount = Math.max(...data.map(d => d.count || 0));
      const maxFraudCount = Math.max(...data.map(d => d.fraudCount || 0));
      const maxFraudRate = Math.max(...data.map(d => d.fraudRate || 0));

      // Get the overall maximum
      const overallMax = Math.max(maxCount, maxFraudCount, maxFraudRate);

      // If any value exceeds our base max, expand the domain
      if (overallMax > BASE_MAX) {
        setYAxisDomain([0, Math.ceil(overallMax * 1.1)]); // Add 10% padding
      } else {
        // Reset to base domain
        setYAxisDomain([0, BASE_MAX]);
      }
    }
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
        <XAxis
          dataKey="name"
          stroke="#8F8F8F"
          style={{ fontSize: '10px' }}
          angle={-30}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis
          stroke="#8F8F8F"
          style={{ fontSize: '12px' }}
          domain={yAxisDomain}
          ticks={[0, 2, 4, 6, 8, 10].filter(tick => tick <= yAxisDomain[1])}
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
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          iconType="rect"
        />
        <Bar dataKey="count" fill="#F54E00" radius={[4, 4, 0, 0]} name="Transaction Count" />
        <Bar dataKey="fraudCount" fill="#EF4444" radius={[4, 4, 0, 0]} name="Fraud Count" />
        <Bar dataKey="fraudRate" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Fraud Rate %" />
      </BarChart>
    </ResponsiveContainer>
  );
}