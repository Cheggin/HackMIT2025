import 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ChartData } from '../../../types';

interface BarChartComponentProps {
  data: ChartData[];
}

export default function BarChartComponent({ data }: BarChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
        <XAxis
          dataKey="name"
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
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
        />
        <Bar dataKey="count" fill="#F54E00" radius={[4, 4, 0, 0]} name="Transaction Count" />
        {data[0]?.fraudCount !== undefined && (
          <Bar dataKey="fraudCount" fill="#EF4444" radius={[4, 4, 0, 0]} name="Fraud Count" />
        )}
        {data[0]?.fraudRate !== undefined && (
          <Bar dataKey="fraudRate" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Fraud Rate %" />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}