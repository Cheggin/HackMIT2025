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

  const customLegendContent = () => {
    return (
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <div style={{ fontSize: '12px' }}>
          <span style={{ marginRight: '20px' }}>
            <span style={{ color: '#F54E00', fontWeight: 'bold' }}>X-Axis:</span>
            <span style={{ color: '#FFFFFF', marginLeft: '5px' }}>{data.x_axis_label || "Category"}</span>
          </span>
          <span>
            <span style={{ color: '#10B981', fontWeight: 'bold' }}>Y-Axis:</span>
            <span style={{ color: '#FFFFFF', marginLeft: '5px' }}>{data.y_axis_label || "Value"}</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 5, right: 30, left: 40, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
        <XAxis
          dataKey="name"
          stroke="#8F8F8F"
          style={{ fontSize: '10px' }}
          angle={-30}
          textAnchor="end"
          interval={0}
          height={50}
        />
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
        <Legend content={customLegendContent} />
        <Bar dataKey="value" fill="#F54E00" radius={[4, 4, 0, 0]} name="Value" />
      </BarChart>
    </ResponsiveContainer>
  );
}


