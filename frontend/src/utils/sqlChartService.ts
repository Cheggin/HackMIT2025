import { supabase } from './supabaseClient';
import type { ChartData, Chart } from '../types';

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
    const modifiedQuery = `WITH events AS (SELECT * FROM public.events WHERE time > ${before})\n`
    const { data, error } = await supabase.rpc('sql', { modifiedQuery })

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
export function transformSQLToChartData(
  sqlData: SQLChartData[],
  chartType: string,
  extra?: any
): ChartData[] {
  switch (chartType) {
    case 'line':
      return sqlData.map(row => ({
        time: row.time ? new Date(row.time * 1000).toLocaleTimeString() : '',
        timestamp: row.time || 0,
        volume: row.value || 0,
        amount: row.amount || 0,
        fraudCount: row.fraud_count || 0,
        count: row.value || 0
      }));

    case 'bar':
      return sqlData.map(row => ({
        name: row.category || '',
        count: row.value || 0,
        amount: row.total_amount || 0,
        avgAmount: row.avg_amount || 0,
        fraudCount: row.fraud_count || 0,
        fraudRate: row.fraud_rate || 0
      }));

    case 'pie':
      return sqlData.map(row => ({
        name: row.slice || '',
        count: row.value || 0,
        value: row.value || 0,
        fraudCount: row.fraud_count || 0
      }));

    case 'sankey':
      return sqlData.map(row => ({
        source: row.source || '',
        target: row.target || '',
        value: row.value || 0
      }));

    case 'funnel':
      return sqlData.map(row => ({
        name: row.stage || '',
        value: row.value || 0,
        percentage: row.percentage || 0
      }));

    case 'heatmap':
      // Cohort heatmap needs special processing
      return sqlData.map(row => ({
        cohort: row.name || '',
        period: row.value || 0,
        count: row.count || 0,
        amount: row.amount || 0,
        fraudCount: row.fraud_count || 0
      }));

    case 'network':
      // Network graph needs the full graph_data object
      if (sqlData[0]?.graph_data) {
        return [sqlData[0].graph_data];
      }
      return [];

    default:
      return sqlData as ChartData[];
  }
}

// Generate charts from SQL definitions
export async function generateChartsFromSQL(before: number): Promise<Chart[]> {
  const graphDefinitions = await fetchGraphDefinitions();
  const charts: Chart[] = [];

  for (const graph of graphDefinitions) {
    try {
      // In production, you'd execute the actual SQL query
      // For now, we'll use mock data or the existing data pipeline
      const sqlData = await executeSQLQuery(graph.sql_query, before);
      const chartData = transformSQLToChartData(sqlData, graph.type, graph.extra);

      charts.push({
        type: graph.type as any,
        title: graph.title,
        data: chartData,
        justification: `Generated from SQL query: ${graph.title}`,
        priority: charts.length + 1
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