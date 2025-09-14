import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { LineChartData } from '../../../types/charts';

interface Props { data: LineChartData }

const LineChartTyped = React.memo(function LineChartTyped({ data }: Props) {
  // Safety checks to prevent infinite recursion
  if (!data || !data.points || !Array.isArray(data.points)) {
    console.warn('Invalid LineChartData provided to LineChartTyped');
    return <div className="h-full flex items-center justify-center text-red-500">Invalid chart data</div>;
  }

  // Debug logging to identify the issue
  console.log('LineChartTyped received data:', {
    pointsLength: data.points.length,
    firstPoint: data.points[0],
    dataStructure: JSON.stringify(data, null, 2)
  });

  // Limit data points to prevent performance issues
  const safePoints = data.points.slice(0, 100);
  
  // Check for circular references
  try {
    JSON.stringify(safePoints);
  } catch (error) {
    console.error('Circular reference detected in chart data:', error);
    return <div className="h-full flex items-center justify-center text-red-500">Circular reference in data</div>;
  }
  
  // Generate times based on current time, going backwards
  const now = Date.now();
  const interval = 3000; // 3 seconds between points

  const rows = safePoints.map((p, index) => {
    try {
      // Calculate time going backwards from now
      const timeValue = now - (safePoints.length - 1 - index) * interval;
      const timeString = new Date(timeValue).toLocaleTimeString();
      const value = typeof p.value === 'number' ? p.value : 0;

      return {
        time: timeString,
        value: value,
        originalTime: timeValue
      };
    } catch (error) {
      console.warn('Error processing chart point:', error);
      return {
        time: `Point ${index}`,
        value: 0,
        originalTime: Date.now() + index
      };
    }
  });

  const customLegendContent = () => {
    return (
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <div style={{ fontSize: '12px' }}>
          <span style={{ marginRight: '20px' }}>
            <span style={{ color: '#F54E00', fontWeight: 'bold' }}>X-Axis:</span>
            <span style={{ color: '#FFFFFF', marginLeft: '5px' }}>{data.x_axis_label || "Time"}</span>
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
      <LineChart data={rows} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3D3D3D" />
        <XAxis
          dataKey="time"
          stroke="#8F8F8F"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#8F8F8F"
          style={{ fontSize: '12px' }}
        />
        <Tooltip contentStyle={{ backgroundColor: '#2D2D2D', border: '1px solid #3D3D3D', borderRadius: '8px' }} labelStyle={{ color: '#8F8F8F' }} itemStyle={{ color: '#FFFFFF' }} />
        <Legend content={customLegendContent} />
        <Line type="monotone" dataKey="value" stroke="#F54E00" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Value" />
      </LineChart>
    </ResponsiveContainer>
  );
});

export default LineChartTyped;


