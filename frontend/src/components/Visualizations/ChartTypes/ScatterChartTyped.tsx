import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ScatterChartData } from '../../../types/charts';

interface Props { data: ScatterChartData }

export default function ScatterChartTyped({ data }: Props) {
  // Filter out invalid points (NaN, null, undefined, or 0,0 points)
  const rows = data.points
    .filter(p =>
      p.x != null &&
      p.y != null &&
      !isNaN(p.x) &&
      !isNaN(p.y) &&
      !(p.x === 0 && p.y === 0)
    )
    .map(p => ({ x: p.x, y: p.y }));

  const customLegendContent = () => {
    return (
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <div style={{ fontSize: '12px' }}>
          <span style={{ marginRight: '20px' }}>
            <span style={{ color: '#F54E00', fontWeight: 'bold' }}>X-Axis:</span>
            <span style={{ color: '#FFFFFF', marginLeft: '5px' }}>{data.x_axis_label || "X"}</span>
          </span>
          <span>
            <span style={{ color: '#10B981', fontWeight: 'bold' }}>Y-Axis:</span>
            <span style={{ color: '#FFFFFF', marginLeft: '5px' }}>{data.y_axis_label || "Y"}</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 5, right: 30, left: 40, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
        <XAxis
          type="number"
          dataKey="x"
          name={data.x_axis_label || "X"}
          stroke="#8F8F8F"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={data.y_axis_label || "Y"}
          stroke="#8F8F8F"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{
            backgroundColor: '#2D2D2D',
            border: '1px solid #3D3D3D',
            borderRadius: '8px',
            color: '#FFFFFF'
          }}
          itemStyle={{ color: '#FFFFFF' }}
          labelStyle={{ color: '#FFFFFF' }}
        />
        <Legend content={customLegendContent} />
        <Scatter data={rows} fill="#10B981" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}


