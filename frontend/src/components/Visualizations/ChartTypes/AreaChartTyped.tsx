import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { AreaChartData } from '../../../types/charts';

interface Props { data: AreaChartData }

export default function AreaChartTyped({ data }: Props) {
  // Generate times based on current time, going backwards
  const now = Date.now();
  const interval = 3000; // 3 seconds between points

  const rows = data.points.map((p, index) => {
    // Calculate time going backwards from now
    const timeValue = now - (data.points.length - 1 - index) * interval;
    return {
      time: new Date(timeValue).toLocaleTimeString(),
      value: p.value
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={rows} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
        <XAxis dataKey="time" stroke="#8F8F8F" style={{ fontSize: '12px' }} />
        <YAxis stroke="#8F8F8F" style={{ fontSize: '12px' }} />
        <Tooltip contentStyle={{ backgroundColor: '#2D2D2D', border: '1px solid #3D3D3D', borderRadius: '8px' }} labelStyle={{ color: '#8F8F8F' }} itemStyle={{ color: '#FFFFFF' }} />
        <Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />
        <Area type="monotone" dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} name="Value" />
      </AreaChart>
    </ResponsiveContainer>
  );
}


