import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { PieChartData } from '../../../types/charts';

const COLORS = ['#F54E00', '#EF4444', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6'];

interface Props { data: PieChartData }

export default function PieChartTyped({ data }: Props) {
  const [animationBegin, setAnimationBegin] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    setAnimationBegin(0);
    const timer = setTimeout(() => setAnimationBegin(1), 100);
    return () => clearTimeout(timer);
  }, [data]);

  const pieData = data.slices.filter(s => s.value > 0).map(s => ({ name: s.slice, value: s.value }));
  if (pieData.length === 0) {
    return <div className="flex items-center justify-center h-full"><p className="text-posthog-text-secondary">No data available</p></div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          animationBegin={animationBegin}
          animationDuration={800}
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(undefined)}
        >
          {pieData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: activeIndex === index ? 'brightness(1.2)' : 'none', cursor: 'pointer', transition: 'filter 0.2s ease' }} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#2D2D2D',
            border: '1px solid #3D3D3D',
            borderRadius: '8px',
            color: '#FFFFFF'
          }}
          itemStyle={{ color: '#FFFFFF' }}
          labelStyle={{ color: '#FFFFFF' }}
        />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#8F8F8F' }} iconType="rect" iconSize={10} formatter={(value: string) => (<span style={{ color: '#FFFFFF' }}>{value}</span>)} />
      </PieChart>
    </ResponsiveContainer>
  );
}


