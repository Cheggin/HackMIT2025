import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseDataLoader';
import type { Chart, ChartData } from '../types';
import { CHART_TYPES } from '../utils/chartRecommendationEngine';

interface SQLChartResult {
  chart_id: string;
  chart_type: string;
  chart_title: string;
  chart_data: any[];
}

export function useSQLCharts(refreshInterval: number = 3000) {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform SQL data to Chart format based on type
  const transformSQLDataToChart = useCallback((sqlResult: SQLChartResult): Chart | null => {
    const { chart_type, chart_title, chart_data } = sqlResult;

    if (!chart_data || chart_data.length === 0) {
      return null;
    }

    let transformedData: ChartData[] = [];
    let chartType = chart_type;

    switch (chart_type) {
      case 'line':
        // Use current time and work backwards in 3-second intervals to match non-SQL mode
        const now = new Date();
        transformedData = chart_data.map((row, index) => {
          // Calculate time going backwards from now (most recent data is at the end)
          const secondsAgo = (chart_data.length - 1 - index) * 3; // 3 seconds between each point
          const timestamp = new Date(now.getTime() - (secondsAgo * 1000));
          const timeKey = `${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}`;

          return {
            time: timeKey,
            timestamp: timestamp.getTime(),
            volume: row.volume || 0,
            amount: row.amount || 0,
            fraudCount: row.fraudcount || row.fraudCount || 0,
            count: row.volume || 0
          };
        });
        break;

      case 'bar':
        transformedData = chart_data.map(row => ({
          name: row.name || row.category || 'Unknown',
          count: row.count || 0,
          amount: row.amount || 0,
          avgAmount: row.avgamount || row.avgAmount || 0,
          fraudCount: row.fraudcount || row.fraudCount || 0,
          fraudRate: row.fraudrate || row.fraudRate || 0,
          value: row.count || 0
        }));
        break;

      case 'pie':
        transformedData = chart_data.map(row => ({
          name: row.name || row.slice || 'Unknown',
          value: row.value || row.count || 0,
          count: row.count || row.value || 0,
          fraudCount: row.fraudcount || row.fraudCount || 0,
          fraudRate: row.fraudrate || row.fraudRate || 0
        }));
        break;

      case 'sankey':
        transformedData = chart_data.map(row => ({
          source: row.source || '',
          target: row.target || '',
          value: row.value || 0
        }));
        break;

      case 'funnel':
        transformedData = chart_data.map(row => ({
          name: row.name || row.stage || '',
          value: row.value || 0,
          percentage: row.percentage || 0
        }));
        break;

      case 'heatmap':
        // For cohort heatmap, we need to process the data differently
        // Group by cohort and period
        const cohortMap = new Map<string, any[]>();

        chart_data.forEach(row => {
          const cohortKey = `Txn ${(row.cohort_id || 0) * 5 + 1}-${(row.cohort_id || 0) * 5 + 5}`;
          if (!cohortMap.has(cohortKey)) {
            cohortMap.set(cohortKey, []);
          }
          cohortMap.get(cohortKey)!.push({
            period: row.period || 0,
            value: row.value || 0,
            count: row.count || 0,
            amount: row.amount || 0,
            fraudCount: row.fraud_count || 0
          });
        });

        // Convert to flat array for the heatmap
        transformedData = Array.from(cohortMap.entries()).flatMap(([cohort, periods]) =>
          periods.map(p => ({
            name: cohort,
            ...p,
            timestamp: Date.now()
          }))
        );

        // Change type to match our component
        chartType = CHART_TYPES.COHORT_HEATMAP;
        break;

      default:
        transformedData = chart_data as ChartData[];
    }

    return {
      type: chartType as any,
      title: chart_title,
      data: transformedData,
      justification: `SQL-driven visualization showing ${chart_title.toLowerCase()}. Data refreshes every ${refreshInterval / 1000} seconds.`,
      priority: 1
    };
  }, [refreshInterval]);

  // Fetch charts from the database
  const fetchCharts = useCallback(async () => {
    try {
      // Call the RPC function to get all chart data
      const { data, error } = await supabase
        .rpc('get_all_chart_data');

      if (error) {
        console.error('Error fetching chart data:', error);
        setError(error.message);
        return;
      }

      if (!data) {
        setError('No chart data returned');
        return;
      }

      // Transform each SQL result to a Chart
      const transformedCharts: Chart[] = [];
      let priority = 1;

      for (const sqlResult of data) {
        const chart = transformSQLDataToChart(sqlResult);
        if (chart) {
          chart.priority = priority++;
          transformedCharts.push(chart);
        }
      }

      setCharts(transformedCharts);
      setError(null);
    } catch (err) {
      console.error('Error in fetchCharts:', err);
      setError('Failed to fetch charts');
    } finally {
      setIsLoading(false);
    }
  }, [transformSQLDataToChart]);

  // Set up polling
  useEffect(() => {
    fetchCharts(); // Initial fetch

    const interval = setInterval(fetchCharts, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchCharts, refreshInterval]);

  // Subscribe to changes in the graphs table
  useEffect(() => {
    const subscription = supabase
      .channel('graphs_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'graphs'
      }, () => {
        // When graphs table changes, refetch charts
        fetchCharts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCharts]);

  return {
    charts,
    isLoading,
    error,
    refetch: fetchCharts
  };
}