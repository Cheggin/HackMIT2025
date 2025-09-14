import { supabase } from './supabaseDataLoader';
// Removed legacy Chart/ChartData usage
import type { AnyChartData, PieChartData, BarChartData, LineChartData, AreaChartData, ScatterChartData } from '../types/charts';

export interface GraphDefinition {
  id: string;
  type: string;
  title: string;
  sql_query: string;
  extra: any;
}

export interface SQLChartData {
  // For line charts
  time?: number;
  value?: number;
  amount?: number;
  fraud_count?: number;

  // For bar/pie charts
  category?: string;
  slice?: string;
  total_amount?: number;
  avg_amount?: number;
  fraud_rate?: number;

  // For sankey
  source?: string;
  target?: string;

  // For funnel
  stage?: string;
  percentage?: number;

  // For network
  graph_data?: any;

  // Generic
  count?: number;
  name?: string;
}

// Fetch all graph definitions from the database
export async function fetchGraphDefinitions(): Promise<GraphDefinition[]> {
  const { data, error } = await supabase
    .from('graphs')
    .select('*')
    .neq('sql_query', 'example')
    .order('type');

  if (error) {
    console.error('Error fetching graph definitions:', error);
    return [];
  }

  return data || [];
}

// Execute a SQL query and return chart data
export async function executeSQLQuery(query: string, before: number): Promise<SQLChartData[]> {
  try {
    // Execute the actual SQL query using the RPC function
    const modifiedQuery = `WITH events AS (SELECT * FROM public.events WHERE time > ${before})\n${query}`
    const { data, error } = await supabase.rpc('sql', { modifiedquery: modifiedQuery })

    if (error) {
      console.error('Error executing SQL query:', error);
      return [];
    }

    // The RPC function returns JSONB, which should be an array of objects
    return data || [];
  } catch (error) {
    console.error('Error executing SQL query:', error);
    return [];
  }
}

// Transform SQL results to chart data format
// Removed legacy transformSQLToChartData

// New: Typed transformer that returns a discriminated union for chart payloads
export function transformSQLToTypedChartData(
  sqlData: SQLChartData[],
  chartType: 'pie' | 'bar' | 'line' | 'area' | 'scatter',
  extra?: any
): AnyChartData {
  switch (chartType) {
    case 'pie': {
      const data: PieChartData = {
        slices: sqlData.map(row => ({
          slice: String((row as any).slice ?? (row as any).name ?? ''),
          value: Number((row as any).value ?? (row as any).count ?? 0),
        })),
      };
      return { kind: 'pie', data };
    }
    case 'bar': {
      const data: BarChartData = {
        bars: sqlData.map(row => ({
          label: String((row as any).category ?? (row as any).name ?? ''),
          value: Number((row as any).value ?? (row as any).count ?? 0),
        })),
        y_axis_label: extra?.y_axis_label,
      };
      return { kind: 'bar', data };
    }
    case 'line': {
      const data: LineChartData = {
        points: sqlData.map(row => ({
          time: Number((row as any).time ?? 0),
          value: Number(
            (row as any).value ??
            (row as any).volume ??
            (row as any).amount ??
            (row as any).count ?? 0
          ),
        })),
        x_axis_label: extra?.x_axis_label,
        y_axis_label: extra?.y_axis_label,
      };
      return { kind: 'line', data };
    }
    case 'area': {
      const data: AreaChartData = {
        points: sqlData.map(row => ({
          time: Number((row as any).time ?? 0),
          value: Number(
            (row as any).value ??
            (row as any).volume ??
            (row as any).amount ??
            (row as any).count ?? 0
          ),
        })),
        x_axis_label: extra?.x_axis_label,
        y_axis_label: extra?.y_axis_label,
      };
      return { kind: 'area', data };
    }
    case 'scatter': {
      const data: ScatterChartData = {
        points: sqlData.map(row => ({
          x: Number((row as any).x_value ?? 0),
          y: Number((row as any).y_value ?? 0),
        })),
        x_axis_label: extra?.x_axis_label,
        y_axis_label: extra?.y_axis_label,
      };
      return { kind: 'scatter', data };
    }
    default: {
      // Should not happen due to chartType annotation
      throw new Error(`Unsupported chart type for typed transform: ${chartType as string}`);
    }
  }
}

// Generate charts from SQL definitions
export async function generateChartsFromSQL(before: number): Promise<{
  type: 'pie' | 'bar' | 'line' | 'area' | 'scatter' | string;
  title: string;
  data: AnyChartData;
}[]> {
  const graphDefinitions = await fetchGraphDefinitions();
  const charts: {
    type: 'pie' | 'bar' | 'line' | 'area' | 'scatter' | string;
    title: string;
    data: AnyChartData;
  }[] = [];

  for (const graph of graphDefinitions) {
    try {
      // In production, you'd execute the actual SQL query
      // For now, we'll use mock data or the existing data pipeline
      const sqlData = await executeSQLQuery(graph.sql_query, before);
      // Use typed transformer
      const normalizedType = (graph.type as any) as 'pie' | 'bar' | 'line' | 'area' | 'scatter';
      const chartData = transformSQLToTypedChartData(sqlData, normalizedType, graph.extra);

      charts.push({
        type: graph.type as any,
        title: graph.title,
        data: chartData,
      });
    } catch (error) {
      console.error(`Error generating chart ${graph.title}:`, error);
    }
  }

  return charts;
}

// Update a specific graph definition in the database
export async function updateGraphDefinition(
  id: string,
  updates: Partial<GraphDefinition>
): Promise<boolean> {
  const { error } = await supabase
    .from('graphs')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating graph definition:', error);
    return false;
  }

  return true;
}

// Create a new graph definition
export async function createGraphDefinition(
  graph: Omit<GraphDefinition, 'id'>
): Promise<string | null> {
  const { data, error } = await supabase
    .from('graphs')
    .insert(graph)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating graph definition:', error);
    return null;
  }

  return data?.id || null;
}