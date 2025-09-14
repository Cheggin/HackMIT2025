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
  
  const rows = safePoints.map((p, index) => {
    try {
      // Ensure time is a valid number
      const timeValue = typeof p.time === 'number' ? p.time : Date.now() + index;
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
});

export default LineChartTyped;


