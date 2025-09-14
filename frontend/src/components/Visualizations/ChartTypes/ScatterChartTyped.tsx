import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ScatterChartData } from '../../../types/charts';

interface Props { data: ScatterChartData }

export default function ScatterChartTyped({ data }: Props) {
  const rows = data.points.map(p => ({ x: p.x, y: p.y }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 5, right: 30, bottom: 5, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
        <XAxis type="number" dataKey="x" name="X" stroke="#8F8F8F" style={{ fontSize: '12px' }} />
        <YAxis type="number" dataKey="y" name="Y" stroke="#8F8F8F" style={{ fontSize: '12px' }} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#2D2D2D', border: '1px solid #3D3D3D', borderRadius: '8px' }} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Scatter data={rows} fill="#10B981" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}


