import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { LineChartData } from '../../../types/charts';

interface Props { data: LineChartData }

export default function LineChartTyped({ data }: Props) {
  const rows = data.points.map(p => ({ time: new Date(p.time).toLocaleTimeString(), value: p.value }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={rows} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
        <XAxis dataKey="time" stroke="#8F8F8F" style={{ fontSize: '12px' }} />
        <YAxis stroke="#8F8F8F" style={{ fontSize: '12px' }} />
        <Tooltip contentStyle={{ backgroundColor: '#2D2D2D', border: '1px solid #3D3D3D', borderRadius: '8px' }} labelStyle={{ color: '#8F8F8F' }} itemStyle={{ color: '#FFFFFF' }} />
        <Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />
        <Line type="monotone" dataKey="value" stroke="#F54E00" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Value" />
      </LineChart>
    </ResponsiveContainer>
  );
}


