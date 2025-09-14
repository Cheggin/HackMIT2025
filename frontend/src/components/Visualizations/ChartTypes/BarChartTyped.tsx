import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { BarChartData } from '../../../types/charts';

interface Props { data: BarChartData }

export default function BarChartTyped({ data }: Props) {
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 10]);
  const BASE_MAX = 10;

  const rows = data.bars.map(b => ({ name: b.label, value: b.value }));

  useEffect(() => {
    if (rows.length > 0) {
      const maxVal = Math.max(...rows.map(r => r.value));
      setYAxisDomain([0, maxVal > BASE_MAX ? Math.ceil(maxVal * 1.1) : BASE_MAX]);
    }
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
        <XAxis dataKey="name" stroke="#8F8F8F" style={{ fontSize: '10px' }} angle={-30} textAnchor="end" interval={0} height={60} />
        <YAxis
          stroke="#8F8F8F"
          style={{ fontSize: '12px' }}
          domain={yAxisDomain}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#2D2D2D',
            border: '1px solid #3D3D3D',
            borderRadius: '8px',
            color: '#FFFFFF'
          }}
          labelStyle={{ color: '#FFFFFF' }}
          itemStyle={{ color: '#FFFFFF' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} iconType="rect" />
        <Bar dataKey="value" fill="#F54E00" radius={[4, 4, 0, 0]} name="Value" />
      </BarChart>
    </ResponsiveContainer>
  );
}


