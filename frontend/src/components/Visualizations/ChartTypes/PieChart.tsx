import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ChartData } from '../../../types';

interface PieChartComponentProps {
  data: ChartData[];
}

// PostHog-inspired color palette
const COLORS = [
  '#F54E00', // PostHog accent orange
  '#EF4444', // Red for fraud
  '#F59E0B', // Amber/warning
  '#10B981', // Success green
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-posthog-bg-secondary border border-posthog-border rounded-lg p-3">
        <p className="text-posthog-text-primary font-medium">{data.name}</p>
        <p className="text-posthog-text-secondary text-sm">
          Value: <span className="text-posthog-text-primary font-medium">{data.value}</span>
        </p>
        <p className="text-posthog-text-secondary text-sm">
          Percentage: <span className="text-posthog-text-primary font-medium">
            {((data.percent || 0) * 100).toFixed(1)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent
}: CustomLabelProps) => {
  // Only show label if percentage is significant (> 5%)
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#FFFFFF"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function PieChartComponent({ data }: PieChartComponentProps) {
  const [animationBegin, setAnimationBegin] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Trigger animation on data change
    setAnimationBegin(0);
    const timer = setTimeout(() => setAnimationBegin(1), 100);
    return () => clearTimeout(timer);
  }, [data]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // Transform data for pie chart - ensure we have valid values
  const pieData = data
    .filter(item => item.count && item.count > 0)
    .map(item => ({
      name: item.name,
      value: item.count || 0,
      fraudCount: item.fraudCount || 0,
      fraudRate: item.fraudRate || 0
    }));

  if (pieData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-posthog-text-secondary">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel as any} 
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          animationBegin={animationBegin}
          animationDuration={800}
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
        >
          {pieData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              style={{
                filter: activeIndex === index ? 'brightness(1.2)' : 'none',
                cursor: 'pointer',
                transition: 'filter 0.2s ease'
              }}
            />
          ))}
        </Pie>
        <Tooltip
          content={<CustomTooltip />}
          contentStyle={{
            backgroundColor: '#2D2D2D',
            border: '1px solid #3D3D3D',
            borderRadius: '8px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{
            fontSize: '12px',
            color: '#8F8F8F'
          }}
          iconType="rect"
          iconSize={10}
          formatter={(value: string) => (
            <span style={{ color: '#FFFFFF' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}